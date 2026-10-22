// Bindings из wrangler.jsonc (worker-configuration.d.ts) плюс секреты, которые задаются через `wrangler secret put`
interface AppEnv extends Env {
  ADMIN_PASSWORD?: string;
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_CHAT_ID?: string;
}
