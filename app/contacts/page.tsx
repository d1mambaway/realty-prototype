import type { Metadata } from "next";
import { ContactsPage } from "@/components/ContactsPage";

export const metadata: Metadata = { title: "Contacte — REZULTAT" };

export default function Contacts() {
  return <ContactsPage />;
}
