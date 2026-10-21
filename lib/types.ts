export type Deal = "sale" | "rent" | "daily";
export type PropertyType = "apartment" | "house" | "room" | "commercial" | "land";

export interface Listing {
  id: string;
  title: string;
  deal: Deal;
  type: PropertyType;
  price: number;
  city: string;
  address: string;
  area: number;
  rooms: number;
  floor?: number;
  floors?: number;
  description: string;
  images: string[];
  features: string[];
  contactName: string;
  contactPhone: string;
  createdAt: string;
  featured?: boolean;
  /** true — объявление подано пользователем в этом браузере */
  own?: boolean;
}

export const DEAL_LABELS: Record<Deal, string> = {
  sale: "Продажа",
  rent: "Аренда",
  daily: "Посуточно",
};

export const TYPE_LABELS: Record<PropertyType, string> = {
  apartment: "Квартира",
  house: "Дом",
  room: "Комната",
  commercial: "Коммерция",
  land: "Участок",
};

export const FEATURES = [
  "Парковка",
  "Балкон",
  "Лифт",
  "Мебель",
  "Техника",
  "Кондиционер",
  "Охрана",
  "Вид на воду",
  "Терраса",
  "Бассейн",
  "Можно с животными",
  "Рядом метро",
];

export const CITIES = ["Москва", "Санкт-Петербург", "Сочи", "Казань", "Калининград", "Екатеринбург"];
