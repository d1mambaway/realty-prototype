"use client";

import { useCallback, useEffect, useState } from "react";
import { DEFAULT_SETTINGS, type SiteSettings } from "./settings";
import { CITIES, DEALS, TYPES, matchesDeal, type Listing } from "./types";

// Объявления и контакты приходят из базы: Worker кладёт их прямо в HTML (window.__RZ__),
// иначе грузим через API. Избранное хранится в localStorage браузера.
const FAVORITES_KEY = "realty:favorites";
const CHANGE_EVENT = "realty:change";

interface SiteData {
  listings: Listing[];
  settings: SiteSettings;
}

declare global {
  interface Window {
    __RZ__?: SiteData;
  }
}

let dataPromise: Promise<SiteData> | null = null;

async function fetchSiteData(): Promise<SiteData> {
  if (window.__RZ__) return window.__RZ__;
  try {
    const [listings, settings] = await Promise.all([
      fetch("/api/listings").then((r) => (r.ok ? r.json() : Promise.reject(r.status))),
      fetch("/api/settings").then((r) => (r.ok ? r.json() : Promise.reject(r.status))),
    ]);
    return { listings, settings };
  } catch {
    // `next dev` без Worker: показываем объявления, с которыми собран сайт
    const { SEED_LISTINGS } = await import("./seed");
    return { listings: SEED_LISTINGS, settings: DEFAULT_SETTINGS };
  }
}

function loadSiteData(): Promise<SiteData> {
  dataPromise ??= fetchSiteData();
  return dataPromise;
}

/** Данные сайта. ready=false, пока они не загрузились (на сервере при сборке — всегда). */
export function useSiteData(): SiteData & { ready: boolean } {
  const [state, setState] = useState<SiteData & { ready: boolean }>({
    listings: [],
    settings: DEFAULT_SETTINGS,
    ready: false,
  });
  useEffect(() => {
    let alive = true;
    loadSiteData().then((data) => alive && setState({ ...data, ready: true }));
    return () => {
      alive = false;
    };
  }, []);
  return state;
}

export function useListingsState(): { listings: Listing[]; ready: boolean } {
  const { listings, ready } = useSiteData();
  return { listings, ready };
}

export function useListings(): Listing[] {
  return useSiteData().listings;
}

export function useSettings(): SiteSettings {
  return useSiteData().settings;
}

/** Сделки, типы и города, по которым есть хоть одно объявление — пустые разделы не показываем */
export function useCatalogOptions() {
  const listings = useListings();
  return {
    deals: DEALS.filter((d) => listings.some((l) => matchesDeal(l, d))),
    types: TYPES.filter((t) => listings.some((l) => l.type === t)),
    cities: CITIES.filter((c) => listings.some((l) => l.city === c)),
  };
}

export async function sendLead(lead: {
  kind: "listing" | "sell" | "contact";
  name: string;
  phone: string;
  message?: string;
  listingId?: string;
  data?: Record<string, unknown>;
  website?: string;
}): Promise<void> {
  const res = await fetch("/api/leads", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(lead),
  });
  if (!res.ok) throw new Error(`lead failed: ${res.status}`);
}

function readFavorites(): string[] {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

export function useFavorites() {
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => {
    const sync = () => setIds(readFavorites());
    sync();
    window.addEventListener(CHANGE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const toggle = useCallback((id: string) => {
    const current = readFavorites();
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(current.includes(id) ? current.filter((x) => x !== id) : [...current, id]));
    } catch {}
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }, []);

  return { ids, toggle, has: (id: string) => ids.includes(id) };
}
