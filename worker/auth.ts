// Вход в панель администратора: один пароль (секрет ADMIN_PASSWORD), сессия — подписанная HMAC-кука.
// Смена пароля автоматически разлогинивает все сессии, потому что ключ подписи — сам пароль.

const COOKIE = "rz_admin";
const SESSION_DAYS = 30;
const encoder = new TextEncoder();

async function hmac(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return btoa(String.fromCharCode(...new Uint8Array(signature))).replace(/=+$/, "");
}

/** Сравнение без утечки по времени */
function safeEqual(a: string, b: string): boolean {
  const ab = encoder.encode(a);
  const bb = encoder.encode(b);
  let diff = ab.length ^ bb.length;
  for (let i = 0; i < Math.max(ab.length, bb.length); i++) diff |= (ab[i] ?? 0) ^ (bb[i] ?? 0);
  return diff === 0;
}

export async function checkPassword(env: AppEnv, password: string): Promise<boolean> {
  if (!env.ADMIN_PASSWORD) return false;
  return safeEqual(password, env.ADMIN_PASSWORD);
}

export async function sessionCookie(env: AppEnv): Promise<string> {
  const expires = Date.now() + SESSION_DAYS * 86_400_000;
  const value = `${expires}.${await hmac(env.ADMIN_PASSWORD!, String(expires))}`;
  return `${COOKIE}=${value}; Path=/api/admin; HttpOnly; Secure; SameSite=Strict; Max-Age=${SESSION_DAYS * 86_400}`;
}

export function clearCookie(): string {
  return `${COOKIE}=; Path=/api/admin; HttpOnly; Secure; SameSite=Strict; Max-Age=0`;
}

export async function isAuthed(request: Request, env: AppEnv): Promise<boolean> {
  if (!env.ADMIN_PASSWORD) return false;
  const cookie = request.headers.get("Cookie") ?? "";
  const match = cookie.match(new RegExp(`(?:^|;\\s*)${COOKIE}=([^;]+)`));
  if (!match) return false;
  const [expires, signature] = match[1].split(".");
  if (!expires || !signature || Number(expires) < Date.now()) return false;
  return safeEqual(signature, await hmac(env.ADMIN_PASSWORD, expires));
}

/** Не больше 10 неудачных попыток входа в час с одного IP */
export async function loginRateLimited(request: Request, env: AppEnv, failed: boolean): Promise<boolean> {
  const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
  const key = `rl:login:${ip}`;
  const count = Number((await env.MEDIA.get(key)) ?? 0);
  if (failed) await env.MEDIA.put(key, String(count + 1), { expirationTtl: 3600 });
  return count >= 10;
}
