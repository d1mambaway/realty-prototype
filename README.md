# REZULTAT — Tranzactii Imobiliare

Прототип сайта агентства недвижимости: каталог объявлений (продажа, аренда, посуточно), страница объекта с галереей, подача объявления в 4 шага, избранное.

Стек: Next.js (статическая сборка), Tailwind CSS, Motion для анимаций.

## Запуск локально

```bash
npm install
npm run dev
```

Сайт откроется на http://localhost:3000.

## Деплой на Cloudflare (Workers)

- Проект создан как Worker, настройки в `wrangler.jsonc` (сайт раздаётся из `out/`)
- Build command: `npm run build`
- Deploy command: `npx wrangler deploy`
- Переменная окружения: `NODE_VERSION` = `22`

Каждый пуш в `main` обновляет сайт автоматически.

## Ограничения прототипа

Поданные объявления и избранное хранятся в `localStorage` браузера — другие посетители их не видят. Следующий шаг — база Cloudflare D1.
