"use client";

import Link from "next/link";
import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { SlidersHorizontal, X } from "lucide-react";
import { ListingCard } from "@/components/ListingCard";
import { useI18n } from "@/lib/i18n";
import { useListings } from "@/lib/store";
import { CITIES, DEALS, TYPES, type Deal, type PropertyType } from "@/lib/types";

const SORTS = ["new", "cheap", "expensive", "area"] as const;
type Sort = (typeof SORTS)[number];

export function Catalog() {
  const { d, city: cityName } = useI18n();
  const listings = useListings();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const deal = (params.get("deal") ?? "") as Deal | "";
  const type = (params.get("type") ?? "") as PropertyType | "";
  const city = params.get("city") ?? "";
  const min = params.get("min") ?? "";
  const max = params.get("max") ?? "";
  const rooms = params.get("rooms") ?? "";
  const sort = (params.get("sort") ?? "new") as Sort;

  function set(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.replace(`${pathname}?${next}`, { scroll: false });
  }

  const results = useMemo(() => {
    const filtered = listings.filter((l) => {
      if (deal && l.deal !== deal) return false;
      if (type && l.type !== type) return false;
      if (city && l.city !== city) return false;
      if (min && l.price < Number(min)) return false;
      if (max && l.price > Number(max)) return false;
      if (rooms) {
        const r = Number(rooms);
        if (r === 4 ? l.rooms < 4 : l.rooms !== r) return false;
      }
      return true;
    });
    return filtered.sort((a, b) => {
      if (sort === "cheap") return a.price - b.price;
      if (sort === "expensive") return b.price - a.price;
      if (sort === "area") return b.area - a.area;
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [listings, deal, type, city, min, max, rooms, sort]);

  const hasFilters = Boolean(deal || type || city || min || max || rooms);
  const title = deal ? d.deal[deal] : d.catalog.all;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-32 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <p className="text-xs uppercase tracking-[0.3em] text-accent">{d.catalog.kicker}</p>
        <h1 className="mt-3 font-serif text-5xl font-medium sm:text-7xl">
          {title}
          {type && <em className="text-accent"> · {d.type[type].toLowerCase()}</em>}
        </h1>
      </motion.div>

      {/* Панель фильтров */}
      <div className="relative z-30 -mx-4 mt-10 lg:sticky lg:top-[68px] px-4 py-3 sm:mx-0 sm:px-0">
        <div className="glass flex flex-col gap-3 rounded-3xl border border-line p-3 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.35)]">
          <div className="flex flex-wrap items-center gap-2">
            <Chip active={!deal} onClick={() => set("deal", "")}>{d.catalog.allShort}</Chip>
            {DEALS.map((x) => (
              <Chip key={x} active={deal === x} onClick={() => set("deal", x)} group="deal">
                {d.deal[x]}
              </Chip>
            ))}
            <span className="mx-1 hidden h-6 w-px bg-line sm:block" />
            {TYPES.map((t) => (
              <Chip key={t} active={type === t} onClick={() => set("type", type === t ? "" : t)} subtle>
                {d.type[t]}
              </Chip>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2 md:grid-cols-[1fr_1fr_1fr_1fr_1fr_auto]">
            <Select value={city} onChange={(v) => set("city", v)} label={d.search.city}>
              <option value="">{d.catalog.anyCity}</option>
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {cityName(c)}
                </option>
              ))}
            </Select>
            <Select value={rooms} onChange={(v) => set("rooms", v)} label={d.detail.rooms}>
              <option value="">{d.catalog.anyRooms}</option>
              {[0, 1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>
                  {d.catalog.roomsOption(n)}
                </option>
              ))}
            </Select>
            <NumberInput value={min} onChange={(v) => set("min", v)} placeholder={d.catalog.priceFrom} />
            <NumberInput value={max} onChange={(v) => set("max", v)} placeholder={d.catalog.priceTo} />
            <Select value={sort} onChange={(v) => set("sort", v === "new" ? "" : v)} label={d.catalog.sortLabel}>
              {SORTS.map((value) => (
                <option key={value} value={value}>
                  {d.catalog.sort[value]}
                </option>
              ))}
            </Select>
            {hasFilters ? (
              <button
                type="button"
                onClick={() => router.replace(pathname, { scroll: false })}
                className="inline-flex items-center justify-center gap-1.5 rounded-2xl px-4 py-2.5 text-sm font-semibold text-muted transition-colors hover:bg-sand hover:text-ink"
              >
                <X className="h-4 w-4" /> {d.catalog.reset}
              </button>
            ) : (
              <span className="hidden items-center justify-center px-4 text-muted md:inline-flex">
                <SlidersHorizontal className="h-4 w-4" />
              </span>
            )}
          </div>
        </div>
      </div>

      <p className="mt-6 text-sm text-muted">
        {d.catalog.found}: <span className="font-semibold text-ink">{results.length}</span>
      </p>

      <motion.div layout className="mt-8 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {results.map((listing, i) => (
            <motion.div
              key={listing.id}
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <ListingCard listing={listing} index={i} />
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {results.length === 0 && (
        <div className="mt-10 rounded-3xl border border-dashed border-line p-16 text-center">
          <p className="font-serif text-3xl">{d.catalog.emptyTitle}</p>
          <p className="mt-2 text-muted">{d.catalog.emptyText}</p>
          <Link href="/new/" className="mt-6 inline-block rounded-full bg-ink px-6 py-3 font-semibold text-white hover:bg-accent">
            {d.cta.post}
          </Link>
        </div>
      )}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
  subtle,
  group,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
  subtle?: boolean;
  group?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
        active ? (subtle ? "bg-accent text-white" : "text-white") : "text-ink hover:bg-sand"
      }`}
    >
      {active && !subtle && (
        <motion.span
          layoutId={`chip-${group ?? "all"}`}
          className="absolute inset-0 rounded-full bg-ink"
          transition={{ type: "spring", stiffness: 420, damping: 34 }}
        />
      )}
      <span className="relative">{children}</span>
    </button>
  );
}

function Select({
  value,
  onChange,
  label,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="rounded-2xl border border-line bg-white/70 px-4 py-2.5 text-sm font-medium outline-none transition-colors hover:border-accent focus:border-accent"
    >
      {children}
    </select>
  );
}

function NumberInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <input
      inputMode="numeric"
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
      className="rounded-2xl border border-line bg-white/70 px-4 py-2.5 text-sm font-medium outline-none transition-colors placeholder:text-muted hover:border-accent focus:border-accent"
    />
  );
}
