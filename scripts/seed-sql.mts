// Генерирует migrations/0002_seed.sql из lib/real.ts — начальное наполнение базы.
// Запуск: node scripts/seed-sql.mts
import { writeFileSync } from "node:fs";
import { REAL_LISTINGS } from "../lib/real.ts";

const q = (s: string) => `'${s.replace(/'/g, "''")}'`;

const rows = REAL_LISTINGS.map(({ own: _own, status: _status, ...listing }) =>
  `INSERT INTO listings (id, data, status, created_at) VALUES (${q(listing.id)}, ${q(JSON.stringify(listing))}, 'active', ${q(listing.createdAt)});`,
);

writeFileSync(new URL("../migrations/0002_seed.sql", import.meta.url), `-- Сгенерировано scripts/seed-sql.mts\n${rows.join("\n")}\n`);
console.log(`${rows.length} listings`);
