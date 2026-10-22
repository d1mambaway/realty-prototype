import type { Listing } from "../lib/types";
import { DEFAULT_SETTINGS, type LeadKind, type ListingStatus, type SiteSettings } from "../lib/settings";
import { checkPassword, clearCookie, isAuthed, loginRateLimited, sessionCookie } from "./auth";

type Row = { id: string; data: string; status: ListingStatus; created_at: string };

const json = (data: unknown, init: ResponseInit = {}) =>
  Response.json(data, { ...init, headers: { "Cache-Control": "no-store", ...init.headers } });
const error = (status: number, message: string) => json({ error: message }, { status });

function toListing(row: Row): Listing {
  return { ...(JSON.parse(row.data) as Listing), id: row.id, status: row.status };
}

async function publicListings(env: AppEnv): Promise<Listing[]> {
  const { results } = await env.DB.prepare(
    "SELECT id, data, status, created_at FROM listings WHERE status != 'hidden' ORDER BY created_at DESC",
  ).all<Row>();
  return results.map(toListing);
}

async function getSettings(env: AppEnv): Promise<SiteSettings> {
  const row = await env.DB.prepare("SELECT value FROM settings WHERE key = 'site'").first<{ value: string }>();
  return { ...DEFAULT_SETTINGS, ...(row ? (JSON.parse(row.value) as Partial<SiteSettings>) : {}) };
}

const ro = (text: Listing["title"]) => (typeof text === "string" ? text : (text.ro ?? text.ru ?? text.en ?? ""));
const escapeHtml = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);
// Встраиваем JSON в <script>: экранируем "<", чтобы текст объявления не мог закрыть тег
const safeJson = (data: unknown) => JSON.stringify(data).replace(/</g, "\\u003c");

// ---------- Заявки ----------

async function notifyTelegram(env: AppEnv, text: string) {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) return;
  await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text, disable_web_page_preview: true }),
  });
}

const KIND_LABEL: Record<LeadKind, string> = {
  listing: "Вопрос по объявлению",
  sell: "Хочет продать / сдать / обменять",
  contact: "Обратная связь",
};

async function createLead(request: Request, env: AppEnv, ctx: ExecutionContext): Promise<Response> {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return error(400, "bad json");
  // Ловушка для ботов: скрытое поле, которое человек не заполняет
  if (body.website) return json({ ok: true });

  const kind = (["listing", "sell", "contact"] as const).find((k) => k === body.kind);
  const name = String(body.name ?? "").trim().slice(0, 100);
  const phone = String(body.phone ?? "").trim().slice(0, 40);
  const message = String(body.message ?? "").trim().slice(0, 2000);
  const listingId = body.listingId ? String(body.listingId).slice(0, 100) : null;
  const data = body.data && typeof body.data === "object" ? JSON.stringify(body.data).slice(0, 5000) : null;
  if (!kind || !name || phone.replace(/\D/g, "").length < 8) return error(400, "invalid lead");

  await env.DB.prepare("INSERT INTO leads (kind, name, phone, message, listing_id, data) VALUES (?, ?, ?, ?, ?, ?)")
    .bind(kind, name, phone, message || null, listingId, data)
    .run();

  const origin = new URL(request.url).origin;
  const lines = [`🏠 Новая заявка: ${KIND_LABEL[kind]}`, `Имя: ${name}`, `Телефон: ${phone}`];
  if (message) lines.push(`Сообщение: ${message}`);
  if (listingId) lines.push(`Объявление: ${origin}/listing/?id=${listingId}`);
  if (data) {
    for (const [key, value] of Object.entries(JSON.parse(data) as Record<string, unknown>)) {
      if (value !== "" && value != null) lines.push(`${key}: ${Array.isArray(value) ? value.join(", ") : value}`);
    }
  }
  lines.push(`Все заявки: ${origin}/admin/`);
  ctx.waitUntil(notifyTelegram(env, lines.join("\n")).catch(() => {}));
  return json({ ok: true });
}

// ---------- Админка ----------

const MAX_UPLOAD = 4 * 1024 * 1024;

async function admin(request: Request, env: AppEnv, path: string): Promise<Response> {
  const method = request.method;

  if (path === "login" && method === "POST") {
    if (await loginRateLimited(request, env, false)) return error(429, "too many attempts");
    const { password } = ((await request.json().catch(() => ({}))) ?? {}) as { password?: string };
    if (!(await checkPassword(env, String(password ?? "")))) {
      await loginRateLimited(request, env, true);
      return error(401, env.ADMIN_PASSWORD ? "wrong password" : "admin password is not set");
    }
    return json({ ok: true }, { headers: { "Set-Cookie": await sessionCookie(env) } });
  }
  if (path === "logout" && method === "POST") {
    return json({ ok: true }, { headers: { "Set-Cookie": clearCookie() } });
  }

  if (!(await isAuthed(request, env))) return error(401, "unauthorized");

  if (path === "me") return json({ ok: true });

  if (path === "listings" && method === "GET") {
    const { results } = await env.DB.prepare("SELECT id, data, status, created_at FROM listings ORDER BY created_at DESC").all<Row>();
    return json(results.map(toListing));
  }

  const listingMatch = path.match(/^listings\/([a-z0-9-]{1,100})$/);
  if (listingMatch && method === "PUT") {
    const id = listingMatch[1];
    const { status = "active", ...listing } = (await request.json()) as Listing & { status?: ListingStatus };
    if (!["active", "sold", "hidden"].includes(status)) return error(400, "bad status");
    const { own: _own, ...data } = { ...listing, id };
    await env.DB.prepare(
      `INSERT INTO listings (id, data, status, created_at) VALUES (?1, ?2, ?3, ?4)
       ON CONFLICT(id) DO UPDATE SET data = ?2, status = ?3, updated_at = datetime('now')`,
    )
      .bind(id, JSON.stringify(data), status, listing.createdAt || new Date().toISOString().slice(0, 10))
      .run();
    return json({ ok: true });
  }
  if (listingMatch && method === "DELETE") {
    await env.DB.prepare("DELETE FROM listings WHERE id = ?").bind(listingMatch[1]).run();
    return json({ ok: true });
  }

  if (path === "upload" && method === "POST") {
    const type = request.headers.get("Content-Type") ?? "";
    if (!/^image\/(jpeg|png|webp)$/.test(type)) return error(415, "only images");
    const body = await request.arrayBuffer();
    if (body.byteLength > MAX_UPLOAD) return error(413, "image too large");
    const key = `${crypto.randomUUID()}.${type.split("/")[1].replace("jpeg", "jpg")}`;
    await env.MEDIA.put(`img:${key}`, body, { metadata: { type } });
    return json({ url: `/media/${key}` });
  }

  if (path === "leads" && method === "GET") {
    const { results } = await env.DB.prepare("SELECT * FROM leads ORDER BY created_at DESC LIMIT 500").all();
    return json(results);
  }
  const leadMatch = path.match(/^leads\/(\d+)$/);
  if (leadMatch && method === "PATCH") {
    const { status } = (await request.json()) as { status?: string };
    if (status !== "new" && status !== "done") return error(400, "bad status");
    await env.DB.prepare("UPDATE leads SET status = ? WHERE id = ?").bind(status, Number(leadMatch[1])).run();
    return json({ ok: true });
  }
  if (leadMatch && method === "DELETE") {
    await env.DB.prepare("DELETE FROM leads WHERE id = ?").bind(Number(leadMatch[1])).run();
    return json({ ok: true });
  }

  if (path === "settings" && method === "PUT") {
    const incoming = (await request.json()) as Partial<SiteSettings>;
    const settings = Object.fromEntries(
      Object.keys(DEFAULT_SETTINGS).map((k) => [k, String(incoming[k as keyof SiteSettings] ?? "").slice(0, 300)]),
    );
    await env.DB.prepare("INSERT INTO settings (key, value) VALUES ('site', ?1) ON CONFLICT(key) DO UPDATE SET value = ?1")
      .bind(JSON.stringify(settings))
      .run();
    return json({ ok: true });
  }

  if (path === "telegram-test" && method === "POST") {
    if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) return error(400, "telegram is not configured");
    await notifyTelegram(env, "✅ Сайт REZULTAT подключён: сюда будут приходить заявки.");
    return json({ ok: true });
  }

  return error(404, "not found");
}

// ---------- HTML: подстановка данных и SEO ----------

async function page(request: Request, env: AppEnv, url: URL): Promise<Response> {
  const asset = await env.ASSETS.fetch(request);
  const type = asset.headers.get("Content-Type") ?? "";
  if (!asset.ok || !type.includes("text/html")) return asset;

  const [listings, settings] = await Promise.all([publicListings(env), getSettings(env)]);
  const bootstrap = `<script>window.__RZ__=${safeJson({ listings, settings })}</script>`;
  let rewriter = new HTMLRewriter().on("head", {
    element(el) {
      el.append(bootstrap, { html: true });
    },
  });

  // Превью в Telegram/Viber/Google для страницы объявления
  const id = url.pathname.startsWith("/listing") ? url.searchParams.get("id") : null;
  const listing = id ? listings.find((l) => l.id === id) : undefined;
  if (listing) {
    const title = `${ro(listing.title)} — REZULTAT`;
    const description = ro(listing.description).replace(/\s+/g, " ").slice(0, 200);
    const image = listing.images[0] ? new URL(listing.images[0], url.origin).href : "";
    const meta = [
      ["og:title", title],
      ["og:description", description],
      ["og:image", image],
      ["og:url", url.href],
      ["og:type", "website"],
    ]
      .filter(([, v]) => v)
      .map(([p, v]) => `<meta property="${p}" content="${escapeHtml(v)}">`)
      .join("");
    rewriter = rewriter
      .on("title", {
        element(el) {
          el.setInnerContent(title);
        },
      })
      .on('meta[name="description"]', {
        element(el) {
          el.setAttribute("content", description);
        },
      })
      .on("head", {
        element(el) {
          el.append(`${meta}<meta name="twitter:card" content="summary_large_image">`, { html: true });
        },
      });
  }

  const response = rewriter.transform(asset);
  const headers = new Headers(response.headers);
  headers.set("Cache-Control", "no-cache");
  return new Response(response.body, { status: response.status, headers });
}

async function sitemap(env: AppEnv, origin: string): Promise<Response> {
  const listings = await publicListings(env);
  const urls = ["/", "/listings/", "/new/", "/privacy/", ...listings.map((l) => `/listing/?id=${l.id}`)];
  const xml =
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">` +
    urls.map((u) => `<url><loc>${escapeHtml(origin + u)}</loc></url>`).join("") +
    `</urlset>`;
  return new Response(xml, { headers: { "Content-Type": "application/xml" } });
}

export default {
  async fetch(request, env: AppEnv, ctx): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;

    try {
      if (pathname === "/api/listings") return json(await publicListings(env));
      if (pathname === "/api/settings") return json(await getSettings(env));
      if (pathname === "/api/leads" && request.method === "POST") return await createLead(request, env, ctx);
      if (pathname.startsWith("/api/admin/")) return await admin(request, env, pathname.slice("/api/admin/".length));
      if (pathname.startsWith("/api/")) return error(404, "not found");
    } catch (e) {
      console.error(e);
      return error(500, "server error");
    }

    if (pathname.startsWith("/media/")) {
      const { value, metadata } = await env.MEDIA.getWithMetadata<{ type: string }>(`img:${pathname.slice(7)}`, "stream");
      if (!value) return new Response("Not found", { status: 404 });
      return new Response(value, {
        headers: { "Content-Type": metadata?.type ?? "image/jpeg", "Cache-Control": "public, max-age=31536000, immutable" },
      });
    }

    if (pathname === "/sitemap.xml") return sitemap(env, url.origin);
    if (pathname === "/robots.txt") {
      return new Response(`User-agent: *\nDisallow: /admin/\nDisallow: /api/\nSitemap: ${url.origin}/sitemap.xml\n`);
    }

    return page(request, env, url);
  },
} satisfies ExportedHandler<AppEnv>;
