"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Heart, MapPin, Maximize2, BedDouble } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useFavorites } from "@/lib/store";
import { hasRooms, type Listing } from "@/lib/types";

export function ListingCard({ listing, index = 0 }: { listing: Listing; index?: number }) {
  const { d, tx, city, price } = useI18n();
  const { has, toggle } = useFavorites();
  const liked = has(listing.id);
  const title = tx(listing.title);
  const [first, second] = listing.images;

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.8, delay: (index % 3) * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className="group relative"
    >
      <Link href={`/listing/?id=${listing.id}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-sand">
          {first && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={first}
              alt={title}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.2s] ease-out-expo group-hover:scale-110"
            />
          )}
          {second && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={second}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full scale-110 object-cover opacity-0 transition-all duration-[1.2s] ease-out-expo group-hover:scale-100 group-hover:opacity-100"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />

          <div className="absolute left-4 right-16 top-4 flex flex-wrap gap-2">
            <span className="glass rounded-full px-3 py-1 text-xs font-semibold">{d.deal[listing.deal]}</span>
            {listing.status === "sold" && (
              <span className="rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white">{d.card.sold}</span>
            )}
            {listing.exchangeFor && listing.deal !== "exchange" && listing.status !== "sold" && (
              <span className="rounded-full bg-ink/80 px-3 py-1 text-xs font-semibold text-white backdrop-blur">{d.card.exchangePossible}</span>
            )}
            {listing.own && <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-white">{d.card.own}</span>}
          </div>

          <p className="absolute bottom-4 left-4 font-serif text-2xl font-semibold text-white drop-shadow">
            {price(listing.price, listing.deal)}
          </p>
        </div>
      </Link>

      <button
        type="button"
        aria-label={liked ? d.card.removeFav : d.card.addFav}
        onClick={() => toggle(listing.id)}
        className="glass absolute right-4 top-4 rounded-full p-2.5 transition-transform duration-300 hover:scale-110 active:scale-90"
      >
        <motion.span key={String(liked)} initial={{ scale: 0.6 }} animate={{ scale: 1 }} className="block">
          <Heart className={`h-4 w-4 ${liked ? "fill-red-500 text-red-500" : "text-ink"}`} />
        </motion.span>
      </button>

      <Link href={`/listing/?id=${listing.id}`} className="mt-4 block px-1">
        <p className="text-xs uppercase tracking-[0.18em] text-muted">{d.type[listing.type]}</p>
        <h3 className="mt-1 text-lg font-semibold leading-snug transition-colors group-hover:text-accent">{title}</h3>
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-4 w-4" />
            {city(listing.city)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Maximize2 className="h-4 w-4" />
            {listing.area.toLocaleString("ru-RU")} m²
          </span>
          {listing.type !== "commercial" && hasRooms(listing) && (
            <span className="inline-flex items-center gap-1.5">
              <BedDouble className="h-4 w-4" />
              {d.rooms(listing.rooms)}
            </span>
          )}
        </div>
      </Link>
    </motion.article>
  );
}
