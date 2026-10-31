// Импорт объявлений, перенесённых с 999.md: скачивает фото в public/listings/ad-<id>/
// и генерирует SQL-миграцию для базы.
// Запуск: node scripts/import-999.mts <data.json> <ads.json со списком фото> <migration.sql>
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";

type Text = { ro: string; ru: string; en: string };
interface Item {
  src: string;
  deal: string;
  type: string;
  price: number;
  city: string;
  address: string;
  area: number;
  rooms?: number;
  floor?: number;
  floors?: number;
  features?: string[];
  featured?: boolean;
  title: Text;
  description: Text;
  exchangeFor?: Text;
}

const [dataPath, adsPath, sqlPath] = process.argv.slice(2);
const items = JSON.parse(readFileSync(dataPath, "utf8")) as Item[];
const photos = new Map((JSON.parse(readFileSync(adsPath, "utf8")) as { id: string; images: string[] }[]).map((a) => [a.id, a.images]));
const today = new Date().toISOString().slice(0, 10);
const q = (s: string) => `'${s.replace(/'/g, "''")}'`;

const rows: string[] = [];
for (const item of items) {
  const id = `ad-${item.src}`;
  const dir = new URL(`../public/listings/${id}/`, import.meta.url);
  mkdirSync(dir, { recursive: true });
  const hashes = photos.get(item.src) ?? [];
  const images: string[] = [];
  for (const [i, hash] of hashes.entries()) {
    const file = new URL(`${i + 1}.jpg`, dir);
    if (!existsSync(file)) {
      const res = await fetch(`https://i.simpalsmedia.com/999.md/BoardImages/900x900/${hash}.jpg`);
      if (!res.ok) {
        console.warn(`skip photo ${id} #${i + 1}: HTTP ${res.status}`);
        continue;
      }
      writeFileSync(file, Buffer.from(await res.arrayBuffer()));
    }
    images.push(`/listings/${id}/${i + 1}.jpg`);
  }

  const listing = {
    id,
    title: item.title,
    deal: item.deal,
    type: item.type,
    price: item.price,
    ...(item.exchangeFor ? { exchangeFor: item.exchangeFor } : {}),
    city: item.city,
    address: item.address,
    area: item.area,
    rooms: item.rooms ?? 0,
    ...(item.floor ? { floor: item.floor } : {}),
    ...(item.floors ? { floors: item.floors } : {}),
    description: item.description,
    images,
    features: item.features ?? [],
    contactName: "",
    contactPhone: "",
    createdAt: today,
    ...(item.featured ? { featured: true } : {}),
  };
  rows.push(`INSERT OR IGNORE INTO listings (id, data, status, created_at) VALUES (${q(id)}, ${q(JSON.stringify(listing))}, 'active', ${q(today)});`);
  console.log(`${id}: ${images.length} photos`);
}

writeFileSync(sqlPath, `-- Сгенерировано scripts/import-999.mts\n${rows.join("\n")}\n`);
console.log(`${rows.length} listings → ${sqlPath}`);
