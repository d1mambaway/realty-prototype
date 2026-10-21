"use client";

import { useCallback, useEffect, useState } from "react";
import { SEED_LISTINGS } from "./seed";
import { CITIES, DEALS, TYPES, matchesDeal, type Listing } from "./types";

// Пока нет базы, объявления пользователя и избранное живут в localStorage браузера.
const LISTINGS_KEY = "realty:listings";
const FAVORITES_KEY = "realty:favorites";
const CHANGE_EVENT = "realty:change";

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function useStoreVersion() {
  const [version, setVersion] = useState(0);
  useEffect(() => {
    const bump = () => setVersion((v) => v + 1);
    bump();
    window.addEventListener(CHANGE_EVENT, bump);
    window.addEventListener("storage", bump);
    return () => {
      window.removeEventListener(CHANGE_EVENT, bump);
      window.removeEventListener("storage", bump);
    };
  }, []);
  return version;
}

/** Все объявления: свои (сверху) + демо. ready=false, пока localStorage ещё не прочитан. */
export function useListingsState(): { listings: Listing[]; ready: boolean } {
  const version = useStoreVersion();
  const [state, setState] = useState({ listings: SEED_LISTINGS, ready: false });
  useEffect(() => {
    if (version === 0) return;
    setState({ listings: [...read<Listing[]>(LISTINGS_KEY, []), ...SEED_LISTINGS], ready: true });
  }, [version]);
  return state;
}

export function useListings(): Listing[] {
  return useListingsState().listings;
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

export function addListing(listing: Listing) {
  const own = read<Listing[]>(LISTINGS_KEY, []);
  // Может бросить QuotaExceededError, если фото слишком много — ловим в форме
  write(LISTINGS_KEY, [{ ...listing, own: true }, ...own]);
}

export function removeListing(id: string) {
  write(
    LISTINGS_KEY,
    read<Listing[]>(LISTINGS_KEY, []).filter((l) => l.id !== id),
  );
}

export function useFavorites() {
  const version = useStoreVersion();
  const [ids, setIds] = useState<string[]>([]);
  useEffect(() => {
    if (version === 0) return;
    setIds(read<string[]>(FAVORITES_KEY, []));
  }, [version]);

  const toggle = useCallback((id: string) => {
    const current = read<string[]>(FAVORITES_KEY, []);
    write(FAVORITES_KEY, current.includes(id) ? current.filter((x) => x !== id) : [...current, id]);
  }, []);

  return { ids, toggle, has: (id: string) => ids.includes(id) };
}
