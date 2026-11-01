import type { Lang } from "./dict";

export type Deal = "sale" | "rent" | "daily" | "exchange";
export type PropertyType = "apartment" | "house" | "townhouse" | "room" | "commercial" | "land";
/** Назначение участка */
export type LandUse = "building" | "agricultural" | "industrial";

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
  /** Только для участков: под строительство / сельхоз / под производство */
  landUse?: LandUse;
  /** Продаётся бизнес, а не недвижимость (помещение в аренде) — без цены за м² */
  business?: boolean;
  contactName: string;
  contactPhone: string;
  createdAt: string;
  featured?: boolean;
  /** active — на сайте, sold — с пометкой «продано», hidden — скрыто (только в админке) */
  status?: "active" | "sold" | "hidden";
  /** true — объявление подано пользователем в этом браузере */
  own?: boolean;
}

export const DEALS: Deal[] = ["sale", "rent", "daily", "exchange"];
export const TYPES: PropertyType[] = ["land", "commercial", "house", "townhouse", "apartment", "room"];
/** Разделы каталога: дома и таунхаусы вместе, квартиры и комнаты — в «Прочее» */
export type Category = "land" | "commercial" | "house" | "other";
export const CATEGORIES: Category[] = ["land", "commercial", "house", "other"];

export function categoryOf(type: PropertyType): Category {
  if (type === "land" || type === "commercial") return type;
  if (type === "house" || type === "townhouse") return "house";
  return "other";
}

/** Раздел из адреса: понимает и старые ссылки вида ?type=townhouse */
export function toCategory(value: string | null): Category | "" {
  if (!value) return "";
  if ((CATEGORIES as string[]).includes(value)) return value as Category;
  if ((TYPES as string[]).includes(value)) return categoryOf(value as PropertyType);
  return "";
}

export const LAND_USES: LandUse[] = ["building", "agricultural", "industrial"];
export const CITIES = ["chisinau", "balti", "orhei", "hincesti", "aneniiNoi", "ialoveni", "straseni", "criuleni", "calarasi", "comrat", "cahul", "ungheni", "vadulLuiVoda", "moldova"];

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
