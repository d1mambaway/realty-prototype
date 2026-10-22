/** Контакты агентства — редактируются в админке (вкладка «Настройки») */
export interface SiteSettings {
  agentName: string;
  phone: string;
  /** Номер для WhatsApp и Viber в международном формате, только цифры (373...) */
  messenger: string;
  telegram: string;
  email: string;
  address: string;
  instagram: string;
  facebook: string;
}

export const DEFAULT_SETTINGS: SiteSettings = {
  agentName: "REZULTAT",
  phone: "+373 22 000 000",
  messenger: "",
  telegram: "",
  email: "office@rezultat.example",
  address: "Chișinău, Moldova",
  instagram: "",
  facebook: "",
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
