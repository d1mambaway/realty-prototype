import type { Metadata } from "next";
import { Suspense } from "react";
import { ListingDetail } from "@/components/ListingDetail";

export const metadata: Metadata = { title: "Объявление — REZULTAT" };

// Объявление выбирается по ?id=, чтобы работали и демо, и поданные пользователем
export default function ListingPage() {
  return (
    <Suspense>
      <ListingDetail />
    </Suspense>
  );
}
