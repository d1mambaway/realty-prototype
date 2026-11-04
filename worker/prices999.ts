// Сверка цен на сайте с объявлениями 999.md, из которых объекты были импортированы.
// Ничего не меняет сама: бот показывает расхождения, а цену обновляют кнопкой.
import { TO_EUR } from "./import999";

export type PriceCheck =
  | { kind: "ok"; price: number; currency: string }
  | { kind: "gone" }
  | { kind: "error" };

/** Только цена объявления: страница 999.md большая, остальное не разбираем */
export async function fetchPrice999(id: string): Promise<PriceCheck> {
  try {
    const res = await fetch(`https://999.md/ru/${id}`, { headers: { "User-Agent": "Mozilla/5.0", "Accept-Language": "ru" } });
    if (res.status === 404 || res.status === 410) return { kind: "gone" };
    if (!res.ok) return { kind: "error" };
    const html = await res.text();
    const ldRaw = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map((m) => m[1]).find((t) => t.includes('"Product"'));
    if (!ldRaw) return { kind: "gone" };
    const offers = (JSON.parse(ldRaw) as { offers?: { price?: string; priceCurrency?: string } }).offers;
    const price = Number(offers?.price ?? 0);
    return price ? { kind: "ok", price, currency: offers?.priceCurrency ?? "EUR" } : { kind: "error" };
  } catch (e) {
    // Лимит запросов на один вызов исчерпан — пусть проверка продолжится следующим нажатием
    if (String(e).includes("Too many subrequests")) throw e;
    return { kind: "error" };
  }
}

export interface PriceDiff {
  id: string;
  title: string;
  old: number;
  price: number;
  /** На 999 цена в 5+ раз отличается — скорее всего, там цена за сотку или м², автоматически не обновляем */
  suspicious: boolean;
  /** Цена на 999 не в евро и пересчитана по примерному курсу */
  converted: boolean;
}

export interface PriceState {
  queue: string[];
  total: number;
  diffs: PriceDiff[];
  gone: { id: string; title: string }[];
  failed: { id: string; title: string }[];
  same: number;
}

type Row = { listing_id: string; ad_id: string; data: string; price: number };

/** Список объектов для проверки: у каждого — объявления 999.md, основное первым */
export async function startPriceCheck(env: AppEnv): Promise<PriceState> {
  const { results } = await env.DB.prepare(
    "SELECT DISTINCT s.listing_id FROM source_ads s JOIN listings l ON l.id = s.listing_id WHERE l.status = 'active' ORDER BY s.listing_id",
  ).all<{ listing_id: string }>();
  const queue = results.map((r) => r.listing_id);
  return { queue, total: queue.length, diffs: [], gone: [], failed: [], same: 0 };
}

const ruTitle = (data: string) => {
  const t = (JSON.parse(data) as { title: unknown }).title;
  return typeof t === "string" ? t : ((t as { ru?: string; ro?: string }).ru ?? (t as { ro?: string }).ro ?? "");
};

/**
 * Проверяет объекты из очереди, пока не кончится время или лимит запросов
 * (на бесплатном тарифе Cloudflare — около 50 внешних запросов за одно нажатие).
 * Возвращает true, если очередь пройдена до конца.
 */
export async function continuePriceCheck(env: AppEnv, state: PriceState, budgetMs = 25_000, maxFetches = 44): Promise<boolean> {
  const started = Date.now();
  let fetches = 0;
  let stopped = false;
  const timeLeft = () => !stopped && fetches < maxFetches && Date.now() - started < budgetMs;

  async function checkOne(listingId: string, rows: Row[]) {
    // Сначала объявление, из которого объект создан, потом его повторы на 999.md
    rows.sort((a, b) => Number(`ad-${b.ad_id}` === listingId) - Number(`ad-${a.ad_id}` === listingId));
    const title = ruTitle(rows[0].data);
    const old = Number(rows[0].price) || 0;
    let result: PriceCheck = { kind: "gone" };
    for (const row of rows) {
      if (fetches >= maxFetches) throw new Error("fetch budget");
      fetches++;
      result = await fetchPrice999(row.ad_id);
      if (result.kind !== "gone") break;
    }
    if (result.kind === "gone") state.gone.push({ id: listingId, title });
    else if (result.kind === "error") state.failed.push({ id: listingId, title });
    else {
      const converted = result.currency !== "EUR";
      const price = converted ? Math.round(result.price * (TO_EUR[result.currency] ?? 1)) : result.price;
      // Пересчёт из лей или долларов примерный: разницу до 5% не считаем изменением
      const same = converted ? Math.abs(price - old) <= old * 0.05 : price === old;
      if (same) state.same++;
      else {
        const ratio = old ? price / old : 1;
        state.diffs.push({ id: listingId, title, old, price, suspicious: ratio < 0.2 || ratio > 5, converted });
      }
    }
  }

  while (state.queue.length && timeLeft()) {
    const batch = state.queue.slice(0, 40);
    const placeholders = batch.map(() => "?").join(",");
    const { results } = await env.DB.prepare(
      `SELECT s.listing_id, s.ad_id, l.data, json_extract(l.data, '$.price') AS price
       FROM source_ads s JOIN listings l ON l.id = s.listing_id WHERE s.listing_id IN (${placeholders})`,
    )
      .bind(...batch)
      .all<Row>();
    const byListing = new Map<string, Row[]>();
    for (const r of results) byListing.set(r.listing_id, [...(byListing.get(r.listing_id) ?? []), r]);

    // По несколько объявлений параллельно: страницы 999.md отдаются медленно
    const pending = [...batch];
    async function worker() {
      while (pending.length && timeLeft()) {
        const id = pending.shift()!;
        const rows = byListing.get(id);
        try {
          if (rows?.length) await checkOne(id, rows);
          state.queue = state.queue.filter((q) => q !== id);
        } catch (e) {
          // Лимит запросов: этот объект проверим при следующем нажатии
          if (String(e) !== "Error: fetch budget") console.error("price check stopped", e);
          stopped = true;
        }
      }
    }
    await Promise.all(Array.from({ length: 4 }, worker));
  }
  return state.queue.length === 0;
}

export async function setListingPrice(env: AppEnv, id: string, price: number) {
  await env.DB.prepare("UPDATE listings SET data = json_set(data, '$.price', ?), updated_at = datetime('now') WHERE id = ?").bind(price, id).run();
}
