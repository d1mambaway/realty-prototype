# REZULTAT — Tranzactii Imobiliare

Прототип сайта агентства недвижимости: каталог объявлений (продажа, аренда, посуточно), страница объекта с галереей, подача объявления в 4 шага, избранное.

Стек: Next.js (статическая сборка), Tailwind CSS, Motion для анимаций.

## Запуск локально

```bash
npm install
npm run dev
```

Сайт откроется на http://localhost:3000.

## Как устроено

- **Сайт** — статическая сборка Next.js (`out/`), RO/RU/EN.
- **Worker** (`worker/`) — API, вход в панель администратора, заявки, фото, SEO-теги для страниц объявлений, `sitemap.xml`.
- **База D1** `rezultat-db` — объявления, заявки, настройки (схема и начальные данные в `migrations/`).
- **KV** `MEDIA` — фото, загруженные через панель администратора. Фото первых объявлений лежат в `public/listings/`.

Панель администратора: `/admin/`.

## Telegram-бот

Бот принимает ссылки на 999.md и сам публикует объявления: забирает текст и фото, проверяет дубли (по номеру объявления и по совпадающим фото), переводит тексты на RO/RU/EN через Workers AI. Сюда же приходят заявки с сайта.

1. Создать бота в @BotFather и задать токен: `npx wrangler secret put TELEGRAM_BOT_TOKEN`.
2. В панели администратора → «Настройки» → «Подключить бота».
3. Написать боту `/start пароль` (пароль панели администратора).

То же самое умеет поле «Добавить с 999.md» во вкладке «Объявления».

## Деплой

```bash
npm run build
npx wrangler deploy
```

Секреты задаются один раз:

```bash
npx wrangler secret put ADMIN_PASSWORD      # пароль панели администратора
npx wrangler secret put TELEGRAM_BOT_TOKEN  # бот для заявок (необязательно)
npx wrangler secret put TELEGRAM_CHAT_ID    # чат агента (необязательно)
```

Новые миграции базы: `npx wrangler d1 migrations apply rezultat-db --remote`.

## Локальная разработка с API

```bash
npx wrangler d1 migrations apply rezultat-db --local
npm run build && npx wrangler dev
```

Пароль для локального входа — в `.dev.vars` (`ADMIN_PASSWORD=...`, файл не коммитится).
