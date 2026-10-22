"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ExternalLink, Inbox, Home, LogOut, Settings } from "lucide-react";
import { Logo } from "@/components/Logo";
import { adminFetch, jsonBody, Unauthorized } from "./api";
import { ListingsTab } from "./ListingsTab";
import { LeadsTab } from "./LeadsTab";
import { SettingsTab } from "./SettingsTab";

const TABS = [
  { id: "listings", label: "Объявления", icon: Home },
  { id: "leads", label: "Заявки", icon: Inbox },
  { id: "settings", label: "Настройки", icon: Settings },
] as const;
type Tab = (typeof TABS)[number]["id"];

export function AdminApp() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>("listings");

  useEffect(() => {
    adminFetch("me")
      .then(() => setAuthed(true))
      .catch(() => setAuthed(false));
  }, []);

  // Любой запрос, получивший 401, возвращает на экран входа
  const onError = useCallback((e: unknown) => {
    if (e instanceof Unauthorized) setAuthed(false);
    else alert(`Ошибка: ${e instanceof Error ? e.message : e}`);
  }, []);

  if (authed === null) return <div className="min-h-screen bg-ivory" />;
  if (!authed) return <Login onDone={() => setAuthed(true)} />;

  return (
    <div className="min-h-screen bg-ivory">
      <header className="sticky top-0 z-40 border-b border-line bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-4">
            <Logo compact />
            <span className="hidden rounded-full bg-sand px-3 py-1 text-xs font-semibold sm:inline">Панель администратора</span>
          </div>
          <div className="flex items-center gap-1">
            <Link href="/" target="_blank" className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium hover:bg-sand">
              <ExternalLink className="h-4 w-4" /> <span className="hidden sm:inline">Открыть сайт</span>
            </Link>
            <button
              type="button"
              onClick={async () => {
                await adminFetch("logout", { method: "POST" }).catch(() => {});
                setAuthed(false);
              }}
              className="inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium hover:bg-sand"
            >
              <LogOut className="h-4 w-4" /> <span className="hidden sm:inline">Выйти</span>
            </button>
          </div>
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 px-4">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-semibold transition-colors ${
                tab === t.id ? "border-ink text-ink" : "border-transparent text-muted hover:text-ink"
              }`}
            >
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {tab === "listings" && <ListingsTab onError={onError} />}
        {tab === "leads" && <LeadsTab onError={onError} />}
        {tab === "settings" && <SettingsTab onError={onError} />}
      </main>
    </div>
  );
}

function Login({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await adminFetch("login", { method: "POST", ...jsonBody({ password }) });
      onDone();
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      setError(
        msg === "too many attempts"
          ? "Слишком много попыток. Попробуйте через час."
          : msg === "admin password is not set"
            ? "Пароль панели администратора ещё не задан на сервере."
            : "Неверный пароль",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ivory px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-[2rem] bg-white p-8 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.35)]">
        <div className="text-center">
          <Logo compact />
          <p className="mt-6 font-serif text-3xl">Вход в панель администратора</p>
        </div>
        <input
          type="password"
          autoFocus
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Пароль"
          className="mt-6 w-full rounded-xl border border-line bg-ivory/60 px-4 py-3.5 outline-none focus:border-accent focus:bg-white"
        />
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={busy || !password}
          className="mt-4 w-full rounded-xl bg-ink py-3.5 font-semibold text-white transition-colors hover:bg-accent disabled:opacity-50"
        >
          Войти
        </button>
      </form>
    </div>
  );
}
