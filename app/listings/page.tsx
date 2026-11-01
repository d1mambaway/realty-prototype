import type { Metadata } from "next";
import { Suspense } from "react";
import { Catalog } from "@/components/Catalog";

export const metadata: Metadata = {
  title: "Catalog imobiliar Moldova — vânzare și chirie | REZULTAT",
  description: "Alegeți imobilul după tip, localitate, suprafață și preț. Terenuri, case, spații comerciale de la agenția REZULTAT.",
};

export default function ListingsPage() {
  return (
    <Suspense>
      <Catalog />
    </Suspense>
  );
}
