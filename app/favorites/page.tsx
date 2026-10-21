import type { Metadata } from "next";
import { Favorites } from "@/components/Favorites";

export const metadata: Metadata = { title: "Избранное — REZULTAT" };

export default function FavoritesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-32 sm:px-6 lg:px-8">
      <p className="text-xs uppercase tracking-[0.3em] text-accent">Сохранённое</p>
      <h1 className="mt-3 font-serif text-5xl font-medium sm:text-7xl">Избранное</h1>
      <Favorites />
    </div>
  );
}
