import type { Metadata } from "next";
import { ContactsPage } from "@/components/ContactsPage";

export const metadata: Metadata = {
  title: "Contactele agenției imobiliare REZULTAT",
  description: "Contactați REZULTAT prin telefon, WhatsApp, Viber sau Telegram. Cumpărare, vânzare, chirie sau schimb de imobile în Moldova.",
};

export default function Contacts() {
  return <ContactsPage />;
}
