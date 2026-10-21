"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { DICTS, LANGS, type Dict, type Lang } from "./dict";
import type { Deal, Localized } from "./types";

const LANG_KEY = "realty:lang";

interface I18n {
  lang: Lang;
  d: Dict;
  setLang: (lang: Lang) => void;
  /** Текст объявления на текущем языке (с запасным вариантом) */
  tx: (text: Localized) => string;
  city: (key: string) => string;
  feature: (key: string) => string;
  price: (price: number, deal: Deal) => string;
  date: (iso: string) => string;
}

const I18nContext = createContext<I18n | null>(null);

function detectLang(): Lang {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === "ro" || saved === "ru" || saved === "en") return saved;
  } catch {}
  const browser = navigator.language.slice(0, 2);
  if (browser === "ru") return "ru";
  if (browser === "en") return "en";
  return "ro";
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  // Статический HTML собирается на румынском, после загрузки подставляем язык посетителя
  const [lang, setLangState] = useState<Lang>("ro");

  useEffect(() => setLangState(detectLang()), []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    try {
      localStorage.setItem(LANG_KEY, next);
    } catch {}
  }, []);

  const d = DICTS[lang];
  const locale = LANGS.find((l) => l.code === lang)!.locale;
  const number = new Intl.NumberFormat(locale, { maximumFractionDigits: 0 });

  const value: I18n = {
    lang,
    d,
    setLang,
    tx: (text) => (typeof text === "string" ? text : (text[lang] ?? text.ro ?? text.ru ?? text.en ?? "")),
    city: (key) => (d.city as Record<string, string>)[key] ?? key,
    feature: (key) => (d.feature as Record<string, string>)[key] ?? key,
    price: (price, deal) => {
      const base = `${number.format(price)} €`;
      if (deal === "rent") return `${base} ${d.price.perMonth}`;
      if (deal === "daily") return `${base} ${d.price.perDay}`;
      return base;
    },
    date: (iso) => new Date(iso).toLocaleDateString(locale),
  };

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18n {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
