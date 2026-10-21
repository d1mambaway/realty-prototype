import type { Deal } from "./types";

const rub = new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 });

export function formatPrice(price: number, deal: Deal): string {
  const base = `${rub.format(price)} ₽`;
  if (deal === "rent") return `${base} / мес`;
  if (deal === "daily") return `${base} / сутки`;
  return base;
}

export function formatCompact(price: number): string {
  if (price >= 1_000_000) return `${(price / 1_000_000).toLocaleString("ru-RU", { maximumFractionDigits: 1 })} млн`;
  if (price >= 1_000) return `${Math.round(price / 1_000)} тыс`;
  return String(price);
}

export function roomsLabel(rooms: number): string {
  if (rooms === 0) return "Студия";
  return `${rooms}-комн.`;
}

/** plural(5, ["объявление", "объявления", "объявлений"]) → "объявлений" */
export function plural(n: number, forms: [string, string, string]): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms[1];
  return forms[2];
}

export function img(id: string, w = 1600): string {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;
}
