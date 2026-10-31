// Генерирует migrations/0004_bot.sql: таблицы бота и привязку объявлений/фото 999.md
// к уже опубликованным объявлениям — чтобы бот не создавал дубли.
// Запуск: node scripts/sources-sql.mts
import { readFileSync, writeFileSync } from "node:fs";

const ads = JSON.parse(readFileSync(new URL("../data/999-scrape-2026-10-31.json", import.meta.url), "utf8")) as { id: string; images: string[] }[];
const imported = new Set((JSON.parse(readFileSync(new URL("../data/import-999-2026-10-31.json", import.meta.url), "utf8")) as { src: string }[]).map((x) => x.src));

// Первые 25 объявлений были перенесены вручную под своими id
const FIRST: Record<string, string> = {
  "105634255": "hincesti-townhouses", "105631328": "anenii-noi-block", "105614398": "office-botanica",
  "105686499": "land-peresecina", "105686759": "land-ivancea", "105686448": "land-airport",
  "105656459": "dumbrava-unfinished-house", "105653362": "hincesti-townhouse", "105647210": "garage-riscani",
  "105586786": "land-bostancea", "105583339": "land-astercon", "105569641": "hazelnut-farm",
  "105565893": "bulboaca-factory", "105542645": "five-flat-house", "105542470": "land-buiucani",
  "105521628": "walnut-plantation", "105518270": "land-danceni", "105470320": "land-sculeanca",
  "105239594": "land-telecentru", "105129942": "vineyard", "105027294": "land-gratiesti",
  "104804220": "villa-dniester", "104772970": "land-tohatin", "104570903": "dumbrava-garden",
  "104297428": "dumbrava-plot",
};

// Группы «один объект»: общие фото + два дубля, найденных по тексту
const parent = new Map(ads.map((a) => [a.id, a.id]));
const find = (x: string): string => (parent.get(x) === x ? x : (parent.set(x, find(parent.get(x)!)), parent.get(x)!));
const byImage = new Map<string, string[]>();
for (const a of ads) for (const h of a.images) (byImage.get(h) ?? byImage.set(h, []).get(h)!).push(a.id);
for (const ids of byImage.values()) for (const id of ids.slice(1)) parent.set(find(id), find(ids[0]));
for (const [a, b] of [["104772803", "105656459"], ["105660000", "105300196"]]) parent.set(find(a), find(b));

const groups = new Map<string, typeof ads>();
for (const a of ads) (groups.get(find(a.id)) ?? groups.set(find(a.id), []).get(find(a.id))!).push(a);

const q = (s: string) => `'${s}'`;
const adRows: string[] = [];
const imageRows: string[] = [];
for (const g of groups.values()) {
  const first = g.find((a) => FIRST[a.id]);
  const imp = g.find((a) => imported.has(a.id));
  const listingId = first ? FIRST[first.id] : imp ? `ad-${imp.id}` : null;
  if (!listingId) continue;
  for (const a of g) {
    adRows.push(`(${q(a.id)}, ${q(FIRST[a.id] ?? listingId)})`);
    for (const h of a.images) imageRows.push(`(${q(h)}, ${q(FIRST[a.id] ?? listingId)})`);
  }
}

const sql = `-- Сгенерировано scripts/sources-sql.mts
-- Чаты Telegram, подключённые к боту (/start пароль)
CREATE TABLE bot_chats (
  chat_id INTEGER PRIMARY KEY,
  name TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Откуда объявление: номер на 999.md и хэши его фото — для поиска дублей
CREATE TABLE source_ads (
  ad_id TEXT PRIMARY KEY,
  listing_id TEXT NOT NULL
);
CREATE TABLE source_images (
  hash TEXT PRIMARY KEY,
  listing_id TEXT NOT NULL
);
CREATE INDEX source_images_listing ON source_images (listing_id);
CREATE INDEX source_ads_listing ON source_ads (listing_id);

INSERT OR IGNORE INTO source_ads (ad_id, listing_id) VALUES
${adRows.join(",\n")};

INSERT OR IGNORE INTO source_images (hash, listing_id) VALUES
${imageRows.join(",\n")};
`;
writeFileSync(new URL("../migrations/0004_bot.sql", import.meta.url), sql);
console.log(`${adRows.length} ads, ${imageRows.length} images`);
