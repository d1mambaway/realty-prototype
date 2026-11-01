"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { DEFAULT_SETTINGS, type SiteSettings } from "@/lib/settings";
import { adminFetch, jsonBody } from "./api";

const FIELDS: { key: keyof SiteSettings; label: string; hint?: string }[] = [
  { key: "agentName", label: "Имя агента или название", hint: "Показывается рядом с кнопками связи" },
  { key: "phone", label: "Телефон", hint: "Например: +373 69 123 456" },
  { key: "phone2", label: "Второй телефон", hint: "Необязательно — покажется второй кнопкой «Позвонить»" },
  { key: "messenger", label: "Номер для WhatsApp и Viber", hint: "Если пусто — используется телефон выше" },
  { key: "telegram", label: "Telegram", hint: "Имя пользователя, например @rezultat_md (необязательно)" },
  { key: "email", label: "Email" },
  { key: "address", label: "Адрес офиса" },
  { key: "hours", label: "Часы работы", hint: "Например: Пн–Пт 9:00–18:00, Сб 10:00–14:00 (необязательно)" },
  { key: "instagram", label: "Instagram", hint: "Полная ссылка (необязательно)" },
  { key: "facebook", label: "Facebook", hint: "Полная ссылка (необязательно)" },
  { key: "legalName", label: "Юридическое название фирмы", hint: "Показывается внизу сайта и в политике конфиденциальности" },
  { key: "idno", label: "IDNO фирмы" },
];

export function SettingsTab({ onError }: { onError: (e: unknown) => void }) {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState("");
  const [bot, setBot] = useState<{ state: "idle" | "busy" | "ok" | "error"; username?: string; chats?: number; message?: string }>({ state: "idle" });

  useEffect(() => {
    // Публичные настройки + значения по умолчанию
    fetch("/api/settings")
      .then((r) => r.json())
      .then((s: SiteSettings) => setSettings({ ...DEFAULT_SETTINGS, ...s }))
      .catch(onError);
  }, [onError]);

  async function save() {
    if (!settings) return;
    setSaving(true);
    try {
      await adminFetch("settings", { method: "PUT", ...jsonBody(settings) });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      onError(e);
    } finally {
      setSaving(false);
    }
  }

  async function testTelegram() {
    setTesting("…");
    try {
      await adminFetch("telegram-test", { method: "POST" });
      setTesting("Отправлено — проверьте Telegram");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "";
      setTesting(
        msg === "telegram is not configured"
          ? "Токен бота ещё не задан на сервере"
          : msg === "no chats"
            ? "К боту ещё не подключён ни один чат: отправьте боту /start пароль"
            : "Не получилось отправить",
      );
    }
  }

  async function connectBot() {
    setBot({ state: "busy" });
    try {
      const r = await adminFetch<{ username: string; chats: number }>("telegram-setup", { method: "POST" });
      setBot({ state: "ok", username: r.username, chats: r.chats });
    } catch (e) {
      setBot({ state: "error", message: e instanceof Error && e.message === "telegram is not configured" ? "Токен бота ещё не задан на сервере." : `Не получилось: ${e instanceof Error ? e.message : e}` });
    }
  }

  if (!settings) return <p className="text-muted">Загрузка…</p>;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-serif text-3xl">Настройки</h1>
      <p className="mt-1 text-sm text-muted">Контакты агентства — они показываются на сайте и в кнопках связи.</p>

      <div className="mt-8 space-y-4 rounded-3xl border border-line bg-white p-6">
        {FIELDS.map((f) => (
          <label key={f.key} className="block">
            <span className="block text-sm font-semibold">{f.label}</span>
            {f.hint && <span className="block text-xs text-muted">{f.hint}</span>}
            <input
              value={settings[f.key]}
              onChange={(e) => setSettings({ ...settings, [f.key]: e.target.value })}
              className="mt-1.5 w-full rounded-xl border border-line px-4 py-3 outline-none focus:border-accent"
            />
          </label>
        ))}
        <div className="flex items-center justify-end gap-3 pt-2">
          {saved && <span className="text-sm font-medium text-emerald-700">Сохранено</span>}
          <button type="button" onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-ink px-7 py-3 font-semibold text-white hover:bg-accent disabled:opacity-50">
            {saving && <Loader2 className="h-4 w-4 animate-spin" />} Сохранить
          </button>
        </div>
      </div>

      <div className="mt-6 rounded-3xl border border-line bg-white p-6">
        <h2 className="font-serif text-2xl">Telegram-бот</h2>
        <p className="mt-1 text-sm text-muted">
          Бот добавляет объявления по ссылке с 999.md и присылает заявки с сайта. Нажмите «Подключить», затем откройте бота в Telegram и отправьте
          ему <b>/start пароль</b> (пароль — тот же, что от этой панели).
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={connectBot}
            disabled={bot.state === "busy"}
            className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent disabled:opacity-50"
          >
            {bot.state === "busy" && <Loader2 className="h-4 w-4 animate-spin" />} Подключить бота
          </button>
          {bot.state === "ok" && (
            <span className="text-sm">
              Бот подключён:{" "}
              <a href={`https://t.me/${bot.username}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-accent underline">
                @{bot.username}
              </a>
              {bot.chats ? ` · чатов: ${bot.chats}` : " · отправьте ему /start пароль"}
            </span>
          )}
          {bot.state === "error" && <span className="text-sm text-red-600">{bot.message}</span>}
        </div>
        <div className="mt-3 flex items-center gap-3">
          <button type="button" onClick={testTelegram} className="rounded-full border border-line px-5 py-2.5 text-sm font-semibold hover:border-ink">
            Отправить тестовое сообщение
          </button>
          {testing && <span className="text-sm text-muted">{testing}</span>}
        </div>
      </div>
    </div>
  );
}
