import type { Metadata } from "next";
import { Suspense } from "react";
import { Catalog } from "@/components/Catalog";

export const metadata: Metadata = { title: "Каталог — REZULTAT" };

export default function ListingsPage() {
  return (
    <Suspense>
      <Catalog />
    </Suspense>
  );
}
