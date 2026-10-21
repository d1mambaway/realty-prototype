"use client";

import Link from "next/link";
import { ListingCard } from "@/components/ListingCard";
import { useI18n } from "@/lib/i18n";
import { useFavorites, useListingsState } from "@/lib/store";

export function Favorites() {
  const { d } = useI18n();
  const { listings, ready } = useListingsState();
  const { ids } = useFavorites();
  const items = listings.filter((l) => ids.includes(l.id));

  const heading = (
    <>
      <p className="text-xs uppercase tracking-[0.3em] text-accent">{d.favorites.kicker}</p>
      <h1 className="mt-3 font-serif text-5xl font-medium sm:text-7xl">{d.favorites.title}</h1>
    </>
  );

  if (!ready) return heading;
  if (items.length === 0) {
    return (
      <>
      {heading}
      <div className="mt-10 rounded-3xl border border-dashed border-line p-16 text-center">
        <p className="font-serif text-3xl">{d.favorites.emptyTitle}</p>
        <p className="mt-2 text-muted">{d.favorites.emptyText}</p>
        <Link href="/listings/" className="mt-6 inline-block rounded-full bg-ink px-6 py-3 font-semibold text-white hover:bg-accent">
          {d.detail.toCatalog}
        </Link>
      </div>
      </>
    );
  }
  return (
    <>
    {heading}
    <div className="mt-12 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((l, i) => (
        <ListingCard key={l.id} listing={l} index={i} />
      ))}
    </div>
    </>
  );
}
