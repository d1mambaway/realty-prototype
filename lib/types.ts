import type { Lang } from "./dict";

export type Deal = "sale" | "rent" | "daily" | "exchange";
export type PropertyType = "apartment" | "house" | "room" | "commercial" | "land";

/** Текст на одном языке (как ввёл пользователь) или переводы по языкам */
export type Localized = string | Partial<Record<Lang, string>>;

export interface Listing {
  id: string;
  title: Localized;
  deal: Deal;
  type: PropertyType;
  /** Цена в евро (для обмена — оценочная стоимость) */
  price: number;
  /** Обмен: что владелец хочет взамен (у продажи — возможный частичный обмен) */
  exchangeFor?: Localized;
  /** Ключ города из словаря (chisinau, balti…) */
  city: string;
  address: string;
  area: number;
  rooms: number;
  floor?: number;
  floors?: number;
  description: Localized;
  images: string[];
  /** Ключи удобств из словаря (parking, balcony…) */
  features: string[];
  contactName: string;
  contactPhone: string;
  createdAt: string;
  featured?: boolean;
  /** true — объявление подано пользователем в этом браузере */
  own?: boolean;
}

export const DEALS: Deal[] = ["sale", "rent", "daily", "exchange"];
export const TYPES: PropertyType[] = ["apartment", "house", "room", "commercial", "land"];
export const CITIES = ["chisinau", "balti", "orhei", "hincesti", "aneniiNoi", "ialoveni", "cahul", "ungheni", "vadulLuiVoda"];

/** Подходит ли объявление под тип сделки (продажа с возможным обменом попадает и в «Обмен») */
export function matchesDeal(l: Pick<Listing, "deal" | "exchangeFor">, deal: Deal): boolean {
  return l.deal === deal || (deal === "exchange" && Boolean(l.exchangeFor));
}

/** Показывать ли число комнат (для домов и участков без данных — нет) */
export function hasRooms(l: Pick<Listing, "type" | "rooms">): boolean {
  return l.type === "apartment" || l.rooms > 0;
}
export const FEATURES = [
  "parking",
  "balcony",
  "elevator",
  "furniture",
  "appliances",
  "ac",
  "heating",
  "security",
  "waterView",
  "terrace",
  "pool",
  "pets",
  "nearCenter",
];
