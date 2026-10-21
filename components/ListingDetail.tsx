"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  BedDouble,
  Building2,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Expand,
  Heart,
  MapPin,
  Maximize2,
  Phone,
  Trash2,
  X,
} from "lucide-react";
import { ListingCard } from "@/components/ListingCard";
import { Reveal } from "@/components/Reveal";
import { formatPrice, roomsLabel } from "@/lib/format";
import { removeListing, useFavorites, useListingsState } from "@/lib/store";
import { DEAL_LABELS, TYPE_LABELS } from "@/lib/types";

export function ListingDetail() {
  const id = useSearchParams().get("id");
  const router = useRouter();
  const { listings, ready } = useListingsState();
  const { has, toggle } = useFavorites();
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [phoneShown, setPhoneShown] = useState(false);

  const listing = listings.find((l) => l.id === id);
  const images = listing?.images ?? [];

  const go = useCallback(
    (dir: number) => setActive((i) => (i + dir + images.length) % images.length),
    [images.length],
  );

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, go]);

  if (!listing) {
    if (!ready) return <div className="min-h-screen" />;
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-4 pt-24 text-center">
        <p className="font-serif text-5xl">Объявление не найдено</p>
        <p className="mt-3 text-muted">Возможно, его сняли с публикации.</p>
        <Link href="/listings/" className="mt-8 rounded-full bg-ink px-6 py-3 font-semibold text-white hover:bg-accent">
          В каталог
        </Link>
      </div>
    );
  }

  const similar = listings
    .filter((l) => l.id !== listing.id && (l.deal === listing.deal || l.type === listing.type))
    .slice(0, 3);
  const liked = has(listing.id);
  const facts = [
    { icon: Maximize2, label: "Площадь", value: `${listing.area} м²` },
    listing.type !== "land" && { icon: BedDouble, label: "Комнат", value: roomsLabel(listing.rooms) },
    listing.floor && { icon: Building2, label: "Этаж", value: `${listing.floor}${listing.floors ? ` из ${listing.floors}` : ""}` },
    !listing.floor && listing.floors && { icon: Building2, label: "Этажей", value: String(listing.floors) },
    { icon: CalendarDays, label: "Опубликовано", value: new Date(listing.createdAt).toLocaleDateString("ru-RU") },
  ].filter(Boolean) as { icon: typeof Maximize2; label: string; value: string }[];

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-28 sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={() => router.back()}
        className="group inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" /> Назад
      </button>

      {/* Галерея */}
      <div className="mt-6 grid gap-3 lg:grid-cols-[1fr_180px]">
        <div className="group relative aspect-[16/10] overflow-hidden rounded-[2rem] bg-sand">
          <AnimatePresence initial={false} mode="popLayout">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <motion.img
              key={active}
              src={images[active]}
              alt={listing.title}
              initial={{ opacity: 0, scale: 1.06 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 h-full w-full cursor-zoom-in object-cover"
              onClick={() => setLightbox(true)}
            />
          </AnimatePresence>
          {images.length > 1 && (
            <>
              <GalleryArrow side="left" onClick={() => go(-1)} />
              <GalleryArrow side="right" onClick={() => go(1)} />
            </>
          )}
          <button
            type="button"
            onClick={() => setLightbox(true)}
            className="glass absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold"
          >
            <Expand className="h-4 w-4" /> {active + 1} / {images.length}
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto lg:flex-col lg:overflow-visible">
          {images.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setActive(i)}
              className={`relative aspect-[4/3] w-28 shrink-0 overflow-hidden rounded-2xl transition-all duration-300 lg:w-full ${
                i === active ? "ring-2 ring-accent ring-offset-2 ring-offset-ivory" : "opacity-60 hover:opacity-100"
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      </div>

      <div className="mt-12 grid gap-12 lg:grid-cols-[1fr_380px]">
        <div>
          <Reveal>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-ink px-3 py-1 text-xs font-semibold text-white">{DEAL_LABELS[listing.deal]}</span>
              <span className="rounded-full border border-line px-3 py-1 text-xs font-semibold">{TYPE_LABELS[listing.type]}</span>
            </div>
            <h1 className="mt-4 font-serif text-4xl font-medium leading-tight sm:text-6xl">{listing.title}</h1>
            <p className="mt-3 inline-flex items-center gap-2 text-muted">
              <MapPin className="h-4 w-4" /> {listing.city}, {listing.address}
            </p>
          </Reveal>

          <Reveal delay={0.1} className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {facts.map((f) => (
              <div key={f.label} className="rounded-3xl border border-line p-5">
                <f.icon className="h-5 w-5 text-accent" />
                <p className="mt-3 text-xs uppercase tracking-[0.15em] text-muted">{f.label}</p>
                <p className="mt-1 text-lg font-semibold">{f.value}</p>
              </div>
            ))}
          </Reveal>

          <Reveal delay={0.15} className="mt-12">
            <h2 className="font-serif text-3xl">Описание</h2>
            <p className="mt-4 whitespace-pre-line text-lg leading-relaxed text-ink/80">{listing.description}</p>
          </Reveal>

          {listing.features.length > 0 && (
            <Reveal delay={0.2} className="mt-12">
              <h2 className="font-serif text-3xl">Удобства</h2>
              <ul className="mt-5 grid gap-3 sm:grid-cols-2">
                {listing.features.map((f) => (
                  <li key={f} className="flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/15 text-accent">
                      <Check className="h-4 w-4" />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
            </Reveal>
          )}
        </div>

        {/* Карточка с ценой и контактом */}
        <aside>
          <div className="sticky top-24 rounded-[2rem] bg-white p-7 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.35)]">
            <p className="text-sm text-muted">{DEAL_LABELS[listing.deal]}</p>
            <p className="mt-1 font-serif text-4xl font-semibold">{formatPrice(listing.price, listing.deal)}</p>
            {listing.deal === "sale" && listing.area > 0 && (
              <p className="mt-1 text-sm text-muted">
                {Math.round(listing.price / listing.area).toLocaleString("ru-RU")} ₽ за м²
              </p>
            )}

            <div className="mt-6 flex items-center gap-3 border-t border-line pt-6">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-sand font-serif text-xl">
                {listing.contactName.charAt(0)}
              </span>
              <div>
                <p className="font-semibold">{listing.contactName}</p>
                <p className="text-sm text-muted">{listing.own ? "Ваше объявление" : "Собственник"}</p>
              </div>
            </div>

            {phoneShown ? (
              <a
                href={`tel:${listing.contactPhone.replace(/[^\d+]/g, "")}`}
                className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-accent py-4 font-semibold text-white"
              >
                <Phone className="h-5 w-5" /> {listing.contactPhone}
              </a>
            ) : (
              <button
                type="button"
                onClick={() => setPhoneShown(true)}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-ink py-4 font-semibold text-white transition-colors hover:bg-accent"
              >
                <Phone className="h-5 w-5" /> Показать телефон
              </button>
            )}
            <button
              type="button"
              onClick={() => toggle(listing.id)}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-line py-4 font-semibold transition-colors hover:border-ink"
            >
              <Heart className={`h-5 w-5 ${liked ? "fill-red-500 text-red-500" : ""}`} />
              {liked ? "В избранном" : "В избранное"}
            </button>
            {listing.own && (
              <button
                type="button"
                onClick={() => {
                  if (confirm("Снять объявление с публикации?")) {
                    removeListing(listing.id);
                    router.push("/listings/");
                  }
                }}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold text-red-600 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" /> Снять с публикации
              </button>
            )}
          </div>
        </aside>
      </div>

      {similar.length > 0 && (
        <section className="mt-24">
          <Reveal>
            <h2 className="font-serif text-4xl font-medium">Похожие объявления</h2>
          </Reveal>
          <div className="mt-10 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((l, i) => (
              <ListingCard key={l.id} listing={l} index={i} />
            ))}
          </div>
        </section>
      )}

      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 p-4"
            onClick={() => setLightbox(false)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <motion.img
              key={active}
              src={images[active]}
              alt=""
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="max-h-full max-w-full rounded-2xl object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button type="button" aria-label="Закрыть" className="absolute right-5 top-5 rounded-full bg-white/10 p-3 text-white hover:bg-white/20">
              <X className="h-6 w-6" />
            </button>
            {images.length > 1 && (
              <>
                <GalleryArrow side="left" onClick={() => go(-1)} dark />
                <GalleryArrow side="right" onClick={() => go(1)} dark />
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function GalleryArrow({ side, onClick, dark }: { side: "left" | "right"; onClick: () => void; dark?: boolean }) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;
  return (
    <button
      type="button"
      aria-label={side === "left" ? "Предыдущее фото" : "Следующее фото"}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`absolute top-1/2 -translate-y-1/2 rounded-full p-3 transition-all duration-300 hover:scale-110 ${
        side === "left" ? "left-4" : "right-4"
      } ${dark ? "bg-white/10 text-white hover:bg-white/20" : "glass opacity-0 group-hover:opacity-100"}`}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}
