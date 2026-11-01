"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { SlidersHorizontal, X } from "lucide-react";
import { ListingCard } from "@/components/ListingCard";
import { useI18n } from "@/lib/i18n";
import { usePageMeta } from "@/lib/meta";
import { useCatalogOptions, useListings } from "@/lib/store";
import { LAND_USES, categoryOf, matchesDeal, toCategory, type Category, type Deal, type LandUse } from "@/lib/types";

const PAGE = 24;

const SORTS = ["new", "cheap", "expensive", "area"] as const;
type Sort = (typeof SORTS)[number];

export function Catalog() {
  const { d, city: cityName } = useI18n();
  const listings = useListings();
  const { deals: DEALS, categories: CATS, cities: CITIES } = useCatalogOptions();
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const deal = (params.get("deal") ?? "") as Deal | "";
  const type = toCategory(params.get("type"));
  const city = params.get("city") ?? "";
  const min = params.get("min") ?? "";
  const max = params.get("max") ?? "";
  const rooms = params.get("rooms") ?? "";
  const use = (params.get("use") ?? "") as LandUse | "";
  // Площадь в URL — в м²; для участков поле ввода в сотках
  const amin = params.get("amin") ?? "";
  const amax = params.get("amax") ?? "";
  const sort = (params.get("sort") ?? "new") as Sort;
  const isLand = type === "land";
  const showRooms = !type || type === "house" || type === "other";
  const areaUnit = isLand ? 100 : 1;
  const [limit, setLimit] = useState(PAGE);
  const [sheet, setSheet] = useState(false);
  usePageMeta(d.meta.catalog.title, d.meta.catalog.description);
  const paramsKey = params.toString();
  useEffect(() => setLimit(PAGE), [paramsKey]);

  function set(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.replace(`${pathname}?${next}`, { scroll: false });
  }

  const results = useMemo(() => {
    const filtered = listings.filter((l) => {
      if (deal && !matchesDeal(l, deal)) return false;
      if (type && categoryOf(l.type) !== type) return false;
      if (use && l.landUse !== use) return false;
      if (amin && l.area < Number(amin)) return false;
      if (amax && l.area > Number(amax)) return false;
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
  }, [listings, deal, type, use, city, min, max, rooms, amin, amax, sort]);
  const landUses = LAND_USES.filter((u) => listings.some((l) => l.type === "land" && l.landUse === u));

  const unit = isLand ? d.catalog.unitAre : "m²";
  const range = (from: string, to: string) => `${from || "0"}–${to || "∞"}`;
  // Выбранные условия: метка и какие параметры она сбрасывает
  const active = [
    deal && { label: d.deal[deal], keys: ["deal"] },
    type && { label: d.category[type], keys: ["type", "use", "amin", "amax", "rooms"] },
    use && { label: d.landUse[use], keys: ["use"] },
    city && { label: cityName(city), keys: ["city"] },
    rooms && { label: d.catalog.roomsOption(Number(rooms)), keys: ["rooms"] },
    (amin || amax) && {
      label: `${range(amin && String(Number(amin) / areaUnit), amax && String(Number(amax) / areaUnit))} ${unit}`,
      keys: ["amin", "amax"],
    },
    (min || max) && { label: `${range(min, max)} €`, keys: ["min", "max"] },
  ].filter(Boolean) as { label: string; keys: string[] }[];

  function clear(keys: string[]) {
    const next = new URLSearchParams(params.toString());
    for (const k of keys) next.delete(k);
    router.replace(`${pathname}?${next}`, { scroll: false });
  }

  function pickType(t: Category) {
    // Смена категории сбрасывает её подкатегорию и площадь (у участков она в сотках)
    const next = new URLSearchParams(params.toString());
    for (const k of ["use", "amin", "amax", "rooms"]) next.delete(k);
    if (type === t) next.delete("type");
    else next.set("type", t);
    router.replace(`${pathname}?${next}`, { scroll: false });
  }

  // Одни и те же фильтры для панели на компьютере и экрана на телефоне (prefix разводит анимации)
  const filters = (prefix: string) => (
    <div className="flex flex-col gap-4">
      <FilterRow label={d.catalog.dealLabel}>
        <Chip active={!deal} onClick={() => set("deal", "")} group={`${prefix}-deal`}>{d.catalog.allShort}</Chip>
        {DEALS.map((x) => (
          <Chip key={x} active={deal === x} onClick={() => set("deal", x)} group={`${prefix}-deal`}>
            {d.deal[x]}
          </Chip>
        ))}
      </FilterRow>
      <FilterRow label={d.catalog.typeLabel}>
        <Chip active={!type} onClick={() => clear(["type", "use", "amin", "amax", "rooms"])} group={`${prefix}-type`}>{d.catalog.allShort}</Chip>
        {CATS.map((t) => (
          <Chip key={t} active={type === t} onClick={() => pickType(t)} group={`${prefix}-type`}>
            {d.category[t]}
          </Chip>
        ))}
      </FilterRow>
      {isLand && landUses.length > 1 && (
        <FilterRow label={d.type.land}>
          <Chip active={!use} onClick={() => set("use", "")} group={`${prefix}-use`} subtle>
            {d.catalog.allShort}
          </Chip>
          {landUses.map((u) => (
            <Chip key={u} active={use === u} onClick={() => set("use", u)} group={`${prefix}-use`} subtle>
              {d.landUse[u]}
            </Chip>
          ))}
        </FilterRow>
      )}
      <div className={`grid grid-cols-2 gap-2 border-t border-line/70 pt-4 ${showRooms ? "md:grid-cols-3 lg:grid-cols-6" : "md:grid-cols-5"}`}>
        <div className="col-span-2 md:col-span-1">
          <Select value={city} onChange={(v) => set("city", v)} label={d.search.city}>
            <option value="">{d.catalog.anyCity}</option>
            {CITIES.map((c) => (
              <option key={c} value={c}>
                {cityName(c)}
              </option>
            ))}
          </Select>
        </div>
        {showRooms && (
          <div className="col-span-2 md:col-span-1">
            <Select value={rooms} onChange={(v) => set("rooms", v)} label={d.detail.rooms}>
              <option value="">{d.catalog.anyRooms}</option>
              {[0, 1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>
                  {d.catalog.roomsOption(n)}
                </option>
              ))}
            </Select>
          </div>
        )}
        <NumberInput
          value={amin ? String(Math.round(Number(amin) / areaUnit)) : ""}
          onChange={(v) => set("amin", v ? String(Number(v) * areaUnit) : "")}
          placeholder={`${d.catalog.area} ${d.catalog.areaFrom}, ${unit}`}
        />
        <NumberInput
          value={amax ? String(Math.round(Number(amax) / areaUnit)) : ""}
          onChange={(v) => set("amax", v ? String(Number(v) * areaUnit) : "")}
          placeholder={`${d.catalog.area} ${d.catalog.areaTo}, ${unit}`}
        />
        <NumberInput value={min} onChange={(v) => set("min", v)} placeholder={d.catalog.priceFrom} />
        <NumberInput value={max} onChange={(v) => set("max", v)} placeholder={d.catalog.priceTo} />
      </div>
    </div>
  );

  const hasFilters = Boolean(deal || type || use || city || min || max || rooms || amin || amax);
  const title = deal ? d.deal[deal] : d.catalog.all;

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-32 sm:px-6 lg:px-8">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>
        <p className="text-xs uppercase tracking-[0.3em] text-accent">{d.catalog.kicker}</p>
        <h1 className="mt-3 font-serif text-3xl font-semibold sm:text-5xl">
          {title}
          {type && <em className="not-italic text-accent"> · {(isLand && use ? d.landUse[use] : d.category[type]).toLowerCase()}</em>}
        </h1>
      </motion.div>

      {/* Фильтры: на компьютере — панель, на телефоне — отдельный экран по кнопке */}
      <div className="glass mt-10 hidden rounded-3xl border border-line p-4 shadow-[0_20px_50px_-30px_rgba(0,0,0,0.35)] md:block">
        {filters("desk")}
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setSheet(true)}
          className="inline-flex items-center gap-2 rounded-full bg-ink px-4 py-2.5 text-sm font-semibold text-white md:hidden"
        >
          <SlidersHorizontal className="h-4 w-4" />
          {d.catalog.filters}
          {active.length > 0 && <span className="rounded-full bg-white/20 px-2 text-xs">{active.length}</span>}
        </button>
        <p className="order-last w-full text-sm text-muted md:order-none md:w-auto">
          {d.catalog.found}: <span className="font-semibold text-ink">{results.length}</span>
        </p>
        <div className="ml-auto flex items-center gap-2 md:gap-2">
          {hasFilters && (
            <button
              type="button"
              onClick={() => router.replace(pathname, { scroll: false })}
              className="hidden items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-muted transition-colors hover:bg-sand hover:text-ink md:inline-flex"
            >
              <X className="h-4 w-4" /> {d.catalog.reset}
            </button>
          )}
<div className="w-40 sm:w-52">
          <Select value={sort} onChange={(v) => set("sort", v === "new" ? "" : v)} label={d.catalog.sortLabel}>
            {SORTS.map((value) => (
              <option key={value} value={value}>
                {d.catalog.sort[value]}
              </option>
            ))}
          </Select>
          </div>
        </div>
      </div>

      {/* Выбранные условия компактными метками (на телефоне) */}
      {active.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2 md:hidden">
          {active.map((a) => (
            <button
              key={a.label}
              type="button"
              onClick={() => clear(a.keys)}
              className="inline-flex items-center gap-1 rounded-full border border-line bg-white px-3 py-1.5 text-xs font-semibold"
            >
              {a.label} <X className="h-3.5 w-3.5 text-muted" />
            </button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {sheet && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="fixed inset-0 z-[60] flex flex-col bg-ivory md:hidden"
          >
            <div className="flex items-center justify-between border-b border-line px-4 py-4">
              <p className="font-serif text-3xl">{d.catalog.filters}</p>
              <button type="button" aria-label={d.detail.close} onClick={() => setSheet(false)} className="rounded-full p-2 hover:bg-sand">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-5">{filters("sheet")}</div>
            <div className="flex gap-3 border-t border-line px-4 pt-3" style={{ paddingBottom: "calc(12px + env(safe-area-inset-bottom, 0px))" }}>
              {hasFilters && (
                <button
                  type="button"
                  onClick={() => router.replace(pathname, { scroll: false })}
                  className="rounded-2xl border border-line px-5 py-3.5 font-semibold"
                >
                  {d.catalog.reset}
                </button>
              )}
              <button type="button" onClick={() => setSheet(false)} className="flex-1 rounded-2xl bg-ink py-3.5 font-semibold text-white">
                {d.catalog.showResults(results.length)}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div layout className="mt-8 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {results.slice(0, limit).map((listing, i) => (
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

      {results.length > limit && (
        <div className="mt-14 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => setLimit((n) => n + PAGE)}
            className="rounded-full border border-ink px-8 py-3.5 font-semibold transition-colors hover:bg-ink hover:text-white"
          >
            {d.catalog.showMore}
          </button>
          <p className="text-sm text-muted">{d.catalog.shown(limit, results.length)}</p>
        </div>
      )}

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

function FilterRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2 md:flex-row md:items-center md:gap-4">
      <p className="w-36 shrink-0 text-xs font-semibold uppercase tracking-[0.15em] text-ink/60">{label}</p>
      <div className="flex flex-wrap gap-1.5">{children}</div>
    </div>
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
      className="w-full min-w-0 rounded-2xl border border-line bg-white/70 px-4 py-2.5 text-sm font-medium outline-none transition-colors hover:border-accent focus:border-accent"
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
      className="w-full min-w-0 rounded-2xl border border-line bg-white/70 px-4 py-2.5 text-sm font-medium outline-none transition-colors placeholder:text-ink/50 hover:border-accent focus:border-accent"
    />
  );
}
