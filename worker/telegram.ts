// Telegram-бот агентства: принимает ссылки на 999.md и публикует объявления на сайте,
// присылает заявки с сайта. Доступ — после команды /start <пароль панели администратора>.
import { checkPassword } from "./auth";
import { AD_URL, import999 } from "./import999";
import { continuePriceCheck, setListingPrice, startPriceCheck, type PriceState } from "./prices999";

type TgMessage = {
  message_id: number;
  chat: { id: number; first_name?: string; username?: string };
  text?: string;
  reply_markup?: { inline_keyboard: Button[][] };
};
type TgUpdate = {
  update_id: number;
  message?: TgMessage;
  callback_query?: { id: string; data?: string; message?: TgMessage };
};
type Button = { text: string; callback_data?: string; url?: string };

async function tg<T = unknown>(env: AppEnv, method: string, body: unknown): Promise<T> {
  const res = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = (await res.json()) as { ok: boolean; result: T; description?: string };
  if (!data.ok) throw new Error(`${method}: ${data.description}`);
  return data.result;
}

const send = (env: AppEnv, chatId: number, text: string, buttons?: Button[][]) =>
  tg<TgMessage>(env, "sendMessage", {
    chat_id: chatId,
    text,
    disable_web_page_preview: true,
    ...(buttons ? { reply_markup: { inline_keyboard: buttons } } : {}),
  });

/** Секрет вебхука выводится из токена бота — отдельный секрет не нужен */
export async function webhookSecret(env: AppEnv): Promise<string> {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(env.TELEGRAM_BOT_TOKEN!), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, new TextEncoder().encode("rezultat-webhook")));
  return [...sig.slice(0, 24)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

/** Подключение бота из панели администратора: вебхук + команды. Возвращает имя бота. */
export async function setupBot(env: AppEnv, origin: string): Promise<string> {
  const me = await tg<{ username: string }>(env, "getMe", {});
  await tg(env, "setWebhook", {
    url: `${origin}/api/telegram`,
    secret_token: await webhookSecret(env),
    allowed_updates: ["message", "callback_query"],
    drop_pending_updates: true,
  });
  await tg(env, "setMyCommands", {
    commands: [
      { command: "start", description: "Подключиться: /start пароль" },
      { command: "prices", description: "Сверить цены с 999.md" },
      { command: "help", description: "Как пользоваться" },
      { command: "stop", description: "Отключить этот чат" },
    ],
  });
  return me.username;
}

/** Чаты, куда слать заявки: TELEGRAM_CHAT_ID или все подключённые к боту */
export async function leadChats(env: AppEnv): Promise<string[]> {
  if (env.TELEGRAM_CHAT_ID) return [env.TELEGRAM_CHAT_ID];
  const { results } = await env.DB.prepare("SELECT chat_id FROM bot_chats").all<{ chat_id: number }>();
  return results.map((r) => String(r.chat_id));
}

const HELP = [
  "Как пользоваться:",
  "• Пришлите ссылку на объявление 999.md (можно несколько в одном сообщении) — я заберу текст и фото, переведу на румынский и английский и опубликую на сайте.",
  "• Если такой объект уже есть на сайте, я скажу об этом и не создам дубль.",
  "• Под каждым новым объявлением есть кнопки «Скрыть» и «Удалить».",
  "• /prices — сверить цены на сайте с 999.md: я покажу, где цена изменилась, а обновить её можно кнопкой.",
  "• Сюда же приходят заявки с сайта.",
].join("\n");
const PRICES_BUTTON: Button[][] = [[{ text: "🔄 Сверить цены с 999.md", callback_data: "prices" }]];

const fmtPrice = (n: number) => `${n.toLocaleString("ru-RU")} €`;
const ru = (t: unknown) => (typeof t === "string" ? t : ((t as { ru?: string; ro?: string })?.ru ?? (t as { ro?: string })?.ro ?? ""));
const short = (s: string, n = 28) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

// ---------- Сверка цен с 999.md ----------

const priceKey = (chatId: number) => `prices:${chatId}`;

/** Запуск или продолжение сверки: одно сообщение, которое обновляется по ходу */
async function runPriceCheck(env: AppEnv, chatId: number, resume: boolean, messageId?: number) {
  const saved = resume ? await env.MEDIA.get<PriceState>(priceKey(chatId), "json") : null;
  const state = saved ?? (await startPriceCheck(env));
  const edit = (text: string, buttons?: Button[][]) =>
    tg(env, "editMessageText", {
      chat_id: chatId,
      message_id: messageId,
      text,
      disable_web_page_preview: true,
      ...(buttons?.length ? { reply_markup: { inline_keyboard: buttons } } : {}),
    });
  const checked = () => state.total - state.queue.length;
  const progress = `⏳ Сверяю цены с 999.md: проверено ${checked()} из ${state.total}…`;
  if (messageId) await edit(progress);
  else messageId = (await send(env, chatId, progress)).message_id;

  const done = await continuePriceCheck(env, state);
  if (!done) {
    await env.MEDIA.put(priceKey(chatId), JSON.stringify(state), { expirationTtl: 86_400 });
    return edit(`Проверено ${checked()} из ${state.total}. За один раз 999.md отдаёт не всё — нажмите, чтобы продолжить.`, [
      [{ text: "▶️ Продолжить", callback_data: "pmore" }],
    ]);
  }
  await env.MEDIA.delete(priceKey(chatId));
  const [text, buttons] = priceReport(state);
  return edit(text, buttons);
}

function priceReport(state: PriceState): [string, Button[][]] {
  const changed = state.diffs.filter((d) => !d.suspicious);
  const suspicious = state.diffs.filter((d) => d.suspicious);
  const lines = [`💶 Сверка цен с 999.md: проверено ${state.total} объектов.`, `Без изменений: ${state.same}.`];
  if (changed.length) {
    lines.push("", `Цена изменилась (${changed.length}):`);
    for (const d of changed) lines.push(`• ${d.title}: ${fmtPrice(d.old)} → ${fmtPrice(d.price)}${d.converted ? " (пересчёт в евро примерный)" : ""}`);
  }
  if (suspicious.length) {
    lines.push("", "⚠️ Сильно отличаются — похоже, на 999 указана цена за сотку или м². Не трогаю, проверьте в панели:");
    for (const d of suspicious) lines.push(`• ${d.title}: на сайте ${fmtPrice(d.old)}, на 999 ${fmtPrice(d.price)}`);
  }
  if (state.gone.length) {
    lines.push("", `🚫 Объявления сняты с 999.md (${state.gone.length}) — можно скрыть на сайте:`);
    for (const g of state.gone) lines.push(`• ${g.title}`);
  }
  if (state.failed.length) {
    lines.push("", `❓ Не удалось открыть на 999.md (${state.failed.length}), попробуйте сверить позже:`);
    for (const f of state.failed) lines.push(`• ${f.title}`);
  }
  if (!changed.length && !suspicious.length && !state.gone.length) lines.push("", "Все цены совпадают ✅");

  const buttons: Button[][] = [
    ...changed.map((d) => [{ text: `✅ ${short(d.title)}: ${fmtPrice(d.price)}`, callback_data: `pset:${d.id}:${d.price}` }]),
    ...state.gone.map((g) => [{ text: `🙈 Скрыть: ${short(g.title)}`, callback_data: `phide:${g.id}` }]),
  ].slice(0, 60);
  if (changed.length > 1) buttons.unshift([{ text: `Обновить все цены (${changed.length})`, callback_data: "pall" }]);
  let text = lines.join("\n");
  if (text.length > 4000) text = `${text.slice(0, 3990)}\n…`;
  return [text, buttons];
}

/** Нажатия под отчётом сверки: обновить цену, все цены, скрыть снятый объект */
async function handlePriceButton(env: AppEnv, chatId: number, cb: NonNullable<TgUpdate["callback_query"]>) {
  const message = cb.message!;
  const keyboard = message.reply_markup?.inline_keyboard ?? [];
  const data = cb.data!;
  let toast = "";
  let used: (b: Button) => boolean;

  if (data === "pall") {
    const updates = keyboard.flat().filter((b) => b.callback_data?.startsWith("pset:"));
    await env.DB.batch(
      updates.map((b) => {
        const [, id, price] = b.callback_data!.split(":");
        return env.DB.prepare("UPDATE listings SET data = json_set(data, '$.price', ?), updated_at = datetime('now') WHERE id = ?").bind(Number(price), id);
      }),
    );
    toast = `Обновлено цен: ${updates.length}`;
    used = (b) => b.callback_data === "pall" || Boolean(b.callback_data?.startsWith("pset:"));
  } else if (data.startsWith("pset:")) {
    const [, id, price] = data.split(":");
    await setListingPrice(env, id, Number(price));
    toast = `Цена обновлена: ${fmtPrice(Number(price))}`;
    used = (b) => b.callback_data === data;
  } else {
    const id = data.slice("phide:".length);
    await env.DB.prepare("UPDATE listings SET status = 'hidden', updated_at = datetime('now') WHERE id = ?").bind(id).run();
    toast = "Скрыто на сайте";
    used = (b) => b.callback_data === data;
  }

  let rest = keyboard.map((row) => row.filter((b) => !used(b))).filter((row) => row.length);
  // «Обновить все» не нужна, когда осталась одна цена
  if (rest.flat().filter((b) => b.callback_data?.startsWith("pset:")).length < 2) rest = rest.filter((row) => row[0]?.callback_data !== "pall");
  await tg(env, "editMessageReplyMarkup", { chat_id: chatId, message_id: message.message_id, reply_markup: { inline_keyboard: rest } });
  await tg(env, "answerCallbackQuery", { callback_query_id: cb.id, text: toast });
}

async function handleMessage(env: AppEnv, origin: string, msg: TgMessage) {
  const chatId = msg.chat.id;
  const text = (msg.text ?? "").trim();
  const allowed = Boolean(await env.DB.prepare("SELECT 1 FROM bot_chats WHERE chat_id = ?").bind(chatId).first());

  if (text.startsWith("/start")) {
    if (allowed) return send(env, chatId, `Этот чат уже подключён.\n\n${HELP}`, PRICES_BUTTON);
    const password = text.replace(/^\/start(@\w+)?/, "").trim();
    if (!password) return send(env, chatId, "Здравствуйте! Это бот сайта REZULTAT.\nЧтобы подключиться, отправьте: /start пароль\n(пароль — тот же, что от панели администратора).");
    if (!(await checkPassword(env, password))) return send(env, chatId, "Пароль не подошёл. Попробуйте ещё раз: /start пароль");
    await env.DB.prepare("INSERT OR REPLACE INTO bot_chats (chat_id, name) VALUES (?, ?)")
      .bind(chatId, msg.chat.username ?? msg.chat.first_name ?? "")
      .run();
    // Сообщение с паролем лучше не оставлять в переписке
    await tg(env, "deleteMessage", { chat_id: chatId, message_id: msg.message_id }).catch(() => {});
    return send(env, chatId, `Готово, чат подключён ✅\n\n${HELP}`, PRICES_BUTTON);
  }

  if (!allowed) return send(env, chatId, "Чтобы пользоваться ботом, отправьте: /start пароль");

  if (text.startsWith("/stop")) {
    await env.DB.prepare("DELETE FROM bot_chats WHERE chat_id = ?").bind(chatId).run();
    return send(env, chatId, "Чат отключён. Чтобы подключить снова: /start пароль");
  }
  if (text.startsWith("/help")) return send(env, chatId, HELP, PRICES_BUTTON);
  if (text.startsWith("/prices") || /сверить цены/i.test(text)) return runPriceCheck(env, chatId, false);

  const ids = [...new Set([...text.matchAll(AD_URL)].map((m) => m[1]))];
  if (!ids.length) return send(env, chatId, "Пришлите ссылку на объявление 999.md, например https://999.md/ru/105634255");

  for (const id of ids.slice(0, 10)) {
    const status = await send(env, chatId, `⏳ Загружаю объявление ${id}…`);
    const edit = (body: string, buttons?: Button[][]) =>
      tg(env, "editMessageText", {
        chat_id: chatId,
        message_id: status.message_id,
        text: body,
        disable_web_page_preview: true,
        ...(buttons ? { reply_markup: { inline_keyboard: buttons } } : {}),
      });
    try {
      const result = await import999(env, id);
      if (result.kind === "skipped") await edit(`⚠️ ${id}: ${result.reason}`);
      else if (result.kind === "duplicate") {
        await edit(
          `ℹ️ ${id}: ${result.byPhotos ? "это тот же объект, что уже есть на сайте (совпадают фото)" : "это объявление уже есть на сайте"}.\n${origin}/listing/?id=${result.listingId}`,
        );
      } else {
        const l = result.listing;
        const lines = [`✅ Добавлено на сайт: ${ru(l.title)}`, `${fmtPrice(l.price)} · фото: ${l.images.length}`, `${origin}/listing/?id=${l.id}`];
        if (result.notes.length) lines.push("", ...result.notes.map((n) => `• ${n}`));
        await edit(lines.join("\n"), [
          [
            { text: "🙈 Скрыть", callback_data: `hide:${l.id}` },
            { text: "🗑 Удалить", callback_data: `del:${l.id}` },
          ],
          [{ text: "Открыть в панели", url: `${origin}/admin/` }],
        ]);
      }
    } catch (e) {
      console.error(e);
      await edit(`❌ ${id}: не получилось загрузить (${e instanceof Error ? e.message : e}). Попробуйте ещё раз позже.`);
    }
  }
}

async function handleCallback(env: AppEnv, origin: string, cb: NonNullable<TgUpdate["callback_query"]>) {
  const chatId = cb.message?.chat.id;
  const allowed = chatId && (await env.DB.prepare("SELECT 1 FROM bot_chats WHERE chat_id = ?").bind(chatId).first());
  if (!allowed || !cb.data || !cb.message) return tg(env, "answerCallbackQuery", { callback_query_id: cb.id, text: "Нет доступа" });

  if (cb.data === "prices" || cb.data === "pmore") {
    await tg(env, "answerCallbackQuery", { callback_query_id: cb.id });
    // Новая сверка — отдельным сообщением, продолжение — в том же
    return runPriceCheck(env, chatId, cb.data === "pmore", cb.data === "pmore" ? cb.message.message_id : undefined);
  }
  if (/^(pset|pall|phide)/.test(cb.data)) return handlePriceButton(env, chatId, cb);

  const [action, id] = cb.data.split(":");
  const base = (cb.message.text ?? "").split("\n\n")[0].split("\n").filter((l) => !l.startsWith("Статус:")).join("\n");
  let status = "";
  let buttons: Button[][] = [];
  if (action === "hide" || action === "show" || action === "keep") {
    if (action !== "keep") {
      await env.DB.prepare("UPDATE listings SET status = ?, updated_at = datetime('now') WHERE id = ?").bind(action === "hide" ? "hidden" : "active", id).run();
    }
    const row = await env.DB.prepare("SELECT status FROM listings WHERE id = ?").bind(id).first<{ status: string }>();
    const hidden = row?.status === "hidden";
    status = !row ? "Объявление уже удалено" : hidden ? "Статус: скрыто 🙈" : "Статус: на сайте ✅";
    if (row) {
      buttons = [
        [
          hidden ? { text: "👁 Показать", callback_data: `show:${id}` } : { text: "🙈 Скрыть", callback_data: `hide:${id}` },
          { text: "🗑 Удалить", callback_data: `del:${id}` },
        ],
      ];
    }
  } else if (action === "del") {
    buttons = [[{ text: "Да, удалить навсегда", callback_data: `delok:${id}` }, { text: "Отмена", callback_data: `keep:${id}` }]];
    status = "Удалить объявление с сайта?";
  } else if (action === "delok") {
    await env.DB.batch([
      env.DB.prepare("DELETE FROM listings WHERE id = ?").bind(id),
      env.DB.prepare("DELETE FROM source_ads WHERE listing_id = ?").bind(id),
      env.DB.prepare("DELETE FROM source_images WHERE listing_id = ?").bind(id),
    ]);
    status = "Удалено 🗑";
  }
  await tg(env, "editMessageText", {
    chat_id: chatId,
    message_id: cb.message.message_id,
    text: `${base}\n\n${status}`,
    disable_web_page_preview: true,
    ...(buttons.length ? { reply_markup: { inline_keyboard: [...buttons, [{ text: "Открыть в панели", url: `${origin}/admin/` }]] } } : {}),
  });
  await tg(env, "answerCallbackQuery", { callback_query_id: cb.id });
}

export async function telegramWebhook(request: Request, env: AppEnv, ctx: ExecutionContext): Promise<Response> {
  if (!env.TELEGRAM_BOT_TOKEN) return new Response("bot is not configured", { status: 404 });
  if (request.headers.get("X-Telegram-Bot-Api-Secret-Token") !== (await webhookSecret(env))) return new Response("forbidden", { status: 403 });

  const update = (await request.json()) as TgUpdate;
  const origin = new URL(request.url).origin;
  // Загрузка объявления дольше лимита фоновых задач, поэтому обрабатываем прямо в запросе.
  // Если Telegram не дождётся ответа и пришлёт то же обновление повторно — пропускаем его.
  const lock = `tg:update:${update.update_id}`;
  if (await env.MEDIA.get(lock)) return new Response("ok");
  await env.MEDIA.put(lock, "1", { expirationTtl: 86_400 });
  try {
    if (update.message) await handleMessage(env, origin, update.message);
    else if (update.callback_query) await handleCallback(env, origin, update.callback_query);
  } catch (e) {
    console.error("telegram update failed", e);
  }
  return new Response("ok");
}
