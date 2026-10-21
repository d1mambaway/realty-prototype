import type { Lang } from "./dict";

export type Deal = "sale" | "rent" | "daily";
export type PropertyType = "apartment" | "house" | "room" | "commercial" | "land";

/** Текст на одном языке (как ввёл пользователь) или переводы по языкам */
export type Localized = string | Partial<Record<Lang, string>>;

export interface Listing {
  id: string;
  title: Localized;
  deal: Deal;
  type: PropertyType;
  /** Цена в евро */
  price: number;
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

export const DEALS: Deal[] = ["sale", "rent", "daily"];
export const TYPES: PropertyType[] = ["apartment", "house", "room", "commercial", "land"];
export const CITIES = ["chisinau", "balti", "orhei", "cahul", "ungheni", "vadulLuiVoda"];
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
