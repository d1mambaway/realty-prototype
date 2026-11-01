/** Контакты агентства — редактируются в админке (вкладка «Настройки») */
export interface SiteSettings {
  agentName: string;
  phone: string;
  /** Второй номер для звонков (необязательно) */
  phone2: string;
  /** Номер для WhatsApp и Viber в международном формате, только цифры (373...) */
  messenger: string;
  telegram: string;
  email: string;
  address: string;
  instagram: string;
  facebook: string;
  /** Например: «Пн–Пт 9:00–18:00, Сб 10:00–14:00» */
  hours: string;
  /** Юридическое лицо — для подвала и политики конфиденциальности */
  legalName: string;
  idno: string;
}

export const DEFAULT_SETTINGS: SiteSettings = {
  agentName: "REZULTAT",
  phone: "+373 22 000 000",
  phone2: "",
  messenger: "",
  telegram: "",
  email: "office@rezultat.md",
  address: "Chișinău, Moldova",
  instagram: "",
  facebook: "",
  hours: "",
  legalName: "",
  idno: "",
};

export type LeadKind = "listing" | "sell" | "contact";

export interface Lead {
  id: number;
  kind: LeadKind;
  name: string;
  phone: string;
  message: string | null;
  listing_id: string | null;
  data: string | null;
  status: "new" | "done";
  created_at: string;
}

export type ListingStatus = "active" | "sold" | "hidden";
