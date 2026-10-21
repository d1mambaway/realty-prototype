"use client";

import Link from "next/link";
import { ListingCard } from "@/components/ListingCard";
import { useFavorites, useListingsState } from "@/lib/store";

export function Favorites() {
  const { listings, ready } = useListingsState();
  const { ids } = useFavorites();
  const items = listings.filter((l) => ids.includes(l.id));

  if (!ready) return null;
  if (items.length === 0) {
    return (
      <div className="mt-10 rounded-3xl border border-dashed border-line p-16 text-center">
        <p className="font-serif text-3xl">Здесь пока пусто</p>
        <p className="mt-2 text-muted">Нажмите на сердечко на карточке, чтобы сохранить объявление.</p>
        <Link href="/listings/" className="mt-6 inline-block rounded-full bg-ink px-6 py-3 font-semibold text-white hover:bg-accent">
          В каталог
        </Link>
      </div>
    );
  }
  return (
    <div className="mt-12 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((l, i) => (
        <ListingCard key={l.id} listing={l} index={i} />
      ))}
    </div>
  );
}
