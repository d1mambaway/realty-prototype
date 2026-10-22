-- Объявления хранятся целиком в JSON (их немного, фильтрация на клиенте)
CREATE TABLE listings (
  id TEXT PRIMARY KEY,
  data TEXT NOT NULL,
  -- active — на сайте, sold — на сайте с пометкой «продано», hidden — скрыто
  status TEXT NOT NULL DEFAULT 'active',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Заявки с сайта
CREATE TABLE leads (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kind TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  message TEXT,
  listing_id TEXT,
  data TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX leads_created ON leads (created_at DESC);

-- Настройки сайта: контакты агентства и т. п. (одна запись key = 'site')
CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
