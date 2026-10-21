import type { Metadata } from "next";
import { Favorites } from "@/components/Favorites";

export const metadata: Metadata = { title: "Favorite — REZULTAT" };

export default function FavoritesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-32 sm:px-6 lg:px-8">
      <Favorites />
    </div>
  );
}
