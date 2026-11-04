// Импорт одного объявления с 999.md: разбор страницы, проверка дублей, фото в KV,
// перевод и оформление через Workers AI, запись в базу.
import type { Deal, LandUse, Listing, PropertyType } from "../lib/types";
import { CITIES, FEATURES } from "../lib/types";

export const AD_URL = /https?:\/\/(?:www\.)?999\.md\/(?:ru\/|ro\/)?(\d{6,})/g;

const AI_MODEL = "@cf/meta/llama-3.3-70b-instruct-fp8-fast";
// Примерные курсы, если на 999.md цена не в евро
export const TO_EUR: Record<string, number> = { EUR: 1, USD: 0.92, MDL: 1 / 19.5 };

export interface Parsed999 {
  id: string;
  title: string;
  description: string;
  category: string;
  dealText: string;
  price: number | null;
  currency: string;
  location: string;
  chars: Record<string, string>;
  images: string[];
}

export type ImportResult =
  | { kind: "created"; listing: Listing; notes: string[] }
  | { kind: "duplicate"; listingId: string; byPhotos: boolean }
  | { kind: "skipped"; reason: string };

const decode = (s: string) =>
  s.replace(/&quot;/g, '"').replace(/&#x27;|&#39;/g, "'").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&nbsp;/g, " ");
const stripTags = (s: string) => decode(s.replace(/<[^>]+>/g, " ")).replace(/\s+/g, " ").trim();

export async function fetch999(id: string): Promise<Parsed999 | null> {
  const res = await fetch(`https://999.md/ru/${id}`, { headers: { "User-Agent": "Mozilla/5.0", "Accept-Language": "ru" } });
  if (!res.ok) return null;
  const html = await res.text();

  const ldRaw = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]).find((t) => t.includes('"Product"'));
  if (!ldRaw) return null;
  const ld = JSON.parse(ldRaw) as {
    name?: string;
    description?: string;
    category?: string;
    offers?: { price?: string; priceCurrency?: string };
  };

  const chars: Record<string, string> = {};
  for (const m of html.matchAll(/__group__feature">([\s\S]*?)<\/li>/g)) {
    const key = m[1].match(/__group__key">([^<]+)</)?.[1];
    if (key) chars[decode(key).trim()] = stripTags(m[1].replace(/<span[^>]*__group__key">[^<]+<\/span>/, ""));
  }

  return {
    id,
    title: ld.name ?? "",
    description: ld.description ?? "",
    category: ld.category ?? "",
    dealText: html.match(/advert__info__item__value">(Продам|Сдаю[^<]*|Меняю|Куплю|Сниму[^<]*)</)?.[1] ?? "",
    price: ld.offers?.price ? Number(ld.offers.price) : null,
    currency: ld.offers?.priceCurrency ?? "EUR",
    location: decode(html.match(/__map__address">([^<]+)</)?.[1] ?? html.match(/__map__title">(?!Расположение)([^<]+)</)?.[1] ?? "").trim(),
    chars,
    images: [...new Set([...html.matchAll(/BoardImages\/900x900\/+([0-9a-f]{32})/g)].map((m) => m[1]))],
  };
}

// ---------- Правила (работают и без ИИ) ----------

function dealOf(text: string): Deal | null {
  if (text.startsWith("Продам")) return "sale";
  if (text.startsWith("Сдаю")) return /посуточно/i.test(text) ? "daily" : "rent";
  if (text.startsWith("Меняю")) return "exchange";
  return null;
}

function typeOf(category: string, chars: Record<string, string>): PropertyType | null {
  if (category.includes("Участки")) return "land";
  if (/таунхаус/i.test(chars["Тип"] ?? "")) return "townhouse";
  if (category.includes("Дома") || category.includes("Дачи")) return "house";
  if (category.includes("Квартиры")) return "apartment";
  if (category.includes("Комнаты")) return "room";
  if (category.includes("Коммерческая") || category.includes("Разное") || category.includes("Действующий бизнес")) return "commercial";
  return null;
}

/** Назначение участка по полю «Тип участка» / «Назначение» на 999.md */
function landUseOf(chars: Record<string, string>): LandUse | undefined {
  const v = (chars["Тип участка"] ?? chars["Назначение"] ?? "").toLowerCase();
  if (/строител|садов|жил/.test(v)) return "building";
  if (/с\/х|сельск|плантац|лес|водо[её]м|пахот/.test(v)) return "agricultural";
  if (/производ|промыш|коммерч|индустр/.test(v)) return "industrial";
  return undefined;
}

const CITY_WORDS: [RegExp, string][] = [
  [/Оргее|Пересечин|Иванч|Орхей/i, "orhei"],
  [/Хынчешт/i, "hincesti"],
  [/Новые Анены|Бульбоак|Чобановк|Пугачен|Пугачён/i, "aneniiNoi"],
  [/Яловен|Данчен/i, "ialoveni"],
  [/Страшен|Лозов/i, "straseni"],
  [/Криулян|Пашкан/i, "criuleni"],
  [/Калараш|Бахмут/i, "calarasi"],
  [/Комрат/i, "comrat"],
  [/Бельц/i, "balti"],
  [/Кагул/i, "cahul"],
  [/Унген/i, "ungheni"],
  [/Вадул-луй-Водэ|Ваду-луй-Водэ/i, "vadulLuiVoda"],
  [/Кишин|Думбрав|Дурлешт|Кодру|Ватр|Бачо|Бубуеч|Трушен|Тогатин|Ставчен|Сынжер|Гратиешт|Кондриц|Будешт|Старая Почта|Ботаник|Буюкан|Чокан|Рышкан|Телецентр|Скулянк/i, "chisinau"],
];

function cityOf(location: string): string {
  return CITY_WORDS.find(([re]) => re.test(location))?.[1] ?? "moldova";
}

/** «6 сотки» → 600, «1 гектары» → 10 000, «160 м²» → 160 */
function areaM2(value: string | undefined): number {
  if (!value) return 0;
  const n = Number(value.replace(",", ".").match(/[\d.]+/)?.[0] ?? 0);
  if (/гектар/i.test(value)) return Math.round(n * 10_000);
  if (/сот/i.test(value)) return Math.round(n * 100);
  return Math.round(n);
}

function areaOf(type: PropertyType, chars: Record<string, string>, title: string): number {
  const fromChars =
    type === "land"
      ? areaM2(chars["Площадь земли"] ?? chars["Площадь участка"])
      : areaM2(chars["Общая площадь"] ?? chars["Площадь"]);
  if (fromChars) return fromChars;
  const m = title.match(/([\d.,]+)\s*(м²|сот|гектар)/i);
  return m ? areaM2(`${m[1]} ${m[2]}`) : 0;
}

// ---------- ИИ: тексты на трёх языках ----------
// Три небольших запроса параллельно (по одному на язык) — быстрее и надёжнее одного большого.

type Lang3 = "ro" | "ru" | "en";

interface AiLang {
  title: string;
  description: string;
  exchange: string;
  address: string;
  /** Ключи удобств через запятую (массив модель иногда зацикливает) */
  features: string;
}

const AI_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    description: { type: "string" },
    exchange: { type: "string" },
    address: { type: "string" },
    features: { type: "string" },
  },
  required: ["title", "description", "exchange", "address", "features"],
};

const LANG_RULES: Record<Lang3, string> = {
  ro: "Пиши на литературном румынском языке с диакритикой (ă, â, î, ș, ț). Сотка = «ar» (мн. «ari»), гектар = «ha». Пример заголовка: «6 ari pentru construcție în Codru».",
  ru: "Пиши на грамотном русском языке. Пример заголовка: «6 соток под строительство в Кодру».",
  en: "Write in natural British English. A сотка is an «are» (100 m²); prefer m² or ha where clearer. Example title: «6-are building plot in Codru».",
};

const system = (lang: Lang3) => `Ты оформляешь объявление агентства недвижимости REZULTAT (Молдова) для сайта. ${LANG_RULES[lang]}
- title: короткий конкретный заголовок с главным параметром и местом. Место бери из поля «Расположение» (село, район или город), а не из описания. С заглавной буквы только первое слово и имена собственные — не пиши Каждое Слово С Большой Буквы. Без капслока и восклицаний. Названия мест пиши так, как они пишутся по-румынски (Ghidighici, Durlești, Bacioi), в русском тексте — по-русски.
- description: перескажи исходный текст на этом языке, сохрани все факты и цифры, ничего не выдумывай. Убери ссылки, телефоны и номера объявлений. Абзацы раздели пустой строкой. Если описания нет — 1–2 предложения по характеристикам.
- exchange: если в тексте есть обмен или бартер — кратко, на что и до какой суммы; иначе пустая строка.
- address: короткий адрес (улица, район или село) без «Кишинёв мун.»; если адреса нет — пустая строка.
- features: подходящие ключи через запятую, только из списка: ${FEATURES.join(", ")}. Каждый ключ не больше одного раза. Если ничего не подходит — пустая строка.`;

async function aiLang(env: AppEnv, lang: Lang3, prompt: string): Promise<AiLang | null> {
  try {
    const out = (await env.AI.run(AI_MODEL as keyof AiModels, {
      messages: [
        { role: "system", content: system(lang) },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_schema", json_schema: AI_SCHEMA },
      max_tokens: 1500,
    } as never)) as { response?: AiLang | string };
    const r = typeof out.response === "string" ? (JSON.parse(out.response) as AiLang) : out.response;
    return r?.title ? r : null;
  } catch (e) {
    console.error(`AI ${lang} failed`, e);
    return null;
  }
}

async function aiTexts(env: AppEnv, ad: Parsed999): Promise<Record<Lang3, AiLang> | null> {
  const prompt = [
    `Заголовок на 999.md: ${ad.title}`,
    `Категория: ${ad.category}`,
    `Сделка: ${ad.dealText}`,
    `Цена: ${ad.price ?? "—"} ${ad.currency}`,
    `Расположение: ${ad.location || "—"}`,
    `Характеристики: ${Object.entries(ad.chars).map(([k, v]) => `${k}: ${v}`).join("; ") || "—"}`,
    `Описание:\n${ad.description || "—"}`,
  ].join("\n");
  const [ro, ru, en] = await Promise.all((["ro", "ru", "en"] as const).map((l) => aiLang(env, l, prompt)));
  return ro && ru && en ? { ro, ru, en } : null;
}

const tri = (ro: string, ru: string, en: string) => ({ ro: ro.trim(), ru: ru.trim(), en: en.trim() });

// ---------- Импорт ----------

export async function import999(env: AppEnv, id: string): Promise<ImportResult> {
  const listingExists = async (listingId: string) =>
    Boolean(await env.DB.prepare("SELECT 1 FROM listings WHERE id = ?").bind(listingId).first());

  const known = await env.DB.prepare("SELECT listing_id FROM source_ads WHERE ad_id = ?").bind(id).first<{ listing_id: string }>();
  if (known && (await listingExists(known.listing_id))) return { kind: "duplicate", listingId: known.listing_id, byPhotos: false };

  const ad = await fetch999(id);
  if (!ad) return { kind: "skipped", reason: "Не удалось открыть объявление на 999.md — проверьте ссылку." };

  const deal = dealOf(ad.dealText);
  const type = typeOf(ad.category, ad.chars);
  if (!type) return { kind: "skipped", reason: `Это не недвижимость (рубрика «${ad.category || "?"}»), пропускаю.` };
  if (!deal) return { kind: "skipped", reason: `Это объявление «${ad.dealText}», а не предложение — пропускаю.` };

  // Тот же объект под другим номером: совпадает хотя бы одно фото
  if (ad.images.length) {
    const placeholders = ad.images.map(() => "?").join(",");
    const { results } = await env.DB.prepare(`SELECT DISTINCT listing_id FROM source_images WHERE hash IN (${placeholders})`)
      .bind(...ad.images)
      .all<{ listing_id: string }>();
    for (const r of results) if (await listingExists(r.listing_id)) return { kind: "duplicate", listingId: r.listing_id, byPhotos: true };
  }

  const notes: string[] = [];
  let price = ad.price ?? 0;
  if (ad.currency !== "EUR") {
    price = Math.round(price * (TO_EUR[ad.currency] ?? 1));
    notes.push(`Цена пересчитана из ${ad.currency} в евро примерно — проверьте.`);
  }
  if (!price) notes.push("Цена на 999.md не указана.");

  // Фото: копируем в своё хранилище, чтобы не зависеть от 999.md
  // Фото и перевод — параллельно
  const [saved, ai] = await Promise.all([
    Promise.all(
      ad.images.slice(0, 15).map(async (hash) => {
        const res = await fetch(`https://i.simpalsmedia.com/999.md/BoardImages/900x900/${hash}.jpg`);
        if (!res.ok || !res.body) return null;
        const key = `999-${hash}.jpg`;
        await env.MEDIA.put(`img:${key}`, res.body, { metadata: { type: "image/jpeg" } });
        return `/media/${key}`;
      }),
    ),
    aiTexts(env, ad),
  ]);
  const images = saved.filter((u): u is string => Boolean(u));
  if (!images.length) return { kind: "skipped", reason: "У объявления нет фото — добавьте его вручную в панели." };

  if (!ai) notes.push("Перевод не получился — тексты пока на русском, их можно поправить в панели.");

  const rooms = Number(ad.chars["Количество комнат"]?.match(/\d+/)?.[0] ?? 0);
  const floor = Number(ad.chars["Этаж"]?.match(/\d+/)?.[0] ?? 0) || undefined;
  const floors = Number((ad.chars["Этажность"] ?? ad.chars["Количество этажей"])?.match(/\d+/)?.[0] ?? 0) || undefined;
  const cleanDescription = ad.description.replace(/https?:\/\/\S+/g, "").trim();

  const listing: Listing = {
    id: `ad-${id}`,
    title: ai ? tri(ai.ro.title, ai.ru.title, ai.en.title) : ad.title,
    deal,
    type,
    price,
    ...(ai?.ru.exchange ? { exchangeFor: tri(ai.ro.exchange, ai.ru.exchange, ai.en.exchange) } : {}),
    city: cityOf(ad.location),
    address: ai?.ro.address ?? ad.location.replace(/^Кишин[её]в мун\.,?\s*/, ""),
    area: areaOf(type, ad.chars, ad.title),
    rooms,
    ...(type === "land" && landUseOf(ad.chars) ? { landUse: landUseOf(ad.chars) } : {}),
    ...(ad.category.includes("Действующий бизнес") ? { business: true } : {}),
    ...(floor ? { floor } : {}),
    ...(floors ? { floors } : {}),
    description: ai ? tri(ai.ro.description, ai.ru.description, ai.en.description) : cleanDescription,
    images,
    features: [...new Set((ai?.ro.features ?? "").split(/[\s,]+/))].filter((f) => FEATURES.includes(f)),
    contactName: "",
    contactPhone: "",
    createdAt: new Date().toISOString().slice(0, 10),
  };
  if (!CITIES.includes(listing.city)) listing.city = "moldova";

  await env.DB.batch([
    env.DB.prepare("INSERT OR REPLACE INTO listings (id, data, status, created_at) VALUES (?, ?, 'active', ?)").bind(
      listing.id,
      JSON.stringify(listing),
      listing.createdAt,
    ),
    env.DB.prepare("INSERT OR REPLACE INTO source_ads (ad_id, listing_id) VALUES (?, ?)").bind(id, listing.id),
    ...ad.images.map((h) => env.DB.prepare("INSERT OR IGNORE INTO source_images (hash, listing_id) VALUES (?, ?)").bind(h, listing.id)),
  ]);

  return { kind: "created", listing, notes };
}
