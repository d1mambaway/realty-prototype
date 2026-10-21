"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Search } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { CITIES, TYPES, type Deal, type PropertyType } from "@/lib/types";

export function SearchPanel() {
  const { d, city: cityName } = useI18n();
  const router = useRouter();
  const tabs: { deal: Deal; label: string }[] = [
    { deal: "sale", label: d.nav.buy },
    { deal: "rent", label: d.nav.rent },
    { deal: "daily", label: d.nav.daily },
  ];
  const [deal, setDeal] = useState<Deal>("sale");
  const [city, setCity] = useState("");
  const [type, setType] = useState<PropertyType | "">("");
  const [maxPrice, setMaxPrice] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams({ deal });
    if (city) params.set("city", city);
    if (type) params.set("type", type);
    if (maxPrice) params.set("max", maxPrice.replace(/\D/g, ""));
    router.push(`/listings/?${params}`);
  }

  return (
    <form onSubmit={submit} className="w-full max-w-4xl">
      <div className="inline-flex rounded-t-2xl bg-white/15 p-1 backdrop-blur-md">
        {tabs.map((tab) => (
          <button
            key={tab.deal}
            type="button"
            onClick={() => setDeal(tab.deal)}
            className={`relative rounded-xl px-5 py-2 text-sm font-semibold transition-colors ${
              deal === tab.deal ? "text-ink" : "text-white hover:text-accent-soft"
            }`}
          >
            {deal === tab.deal && (
              <motion.span
                layoutId="deal-pill"
                className="absolute inset-0 rounded-xl bg-white"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="glass grid gap-2 rounded-2xl rounded-tl-none p-2 shadow-2xl sm:grid-cols-[1fr_1fr_1fr_auto]">
        <Field label={d.search.city}>
          <select value={city} onChange={(e) => setCity(e.target.value)} className="w-full bg-transparent outline-none">
            <option value="">{d.search.any}</option>
            {CITIES.map((c) => (
              <option key={c} value={c}>
                {cityName(c)}
              </option>
            ))}
          </select>
        </Field>
        <Field label={d.search.type}>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as PropertyType | "")}
            className="w-full bg-transparent outline-none"
          >
            <option value="">{d.search.any}</option>
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {d.type[t]}
              </option>
            ))}
          </select>
        </Field>
        <Field label={d.search.maxPrice}>
          <input
            inputMode="numeric"
            placeholder={d.search.noLimit}
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            className="w-full bg-transparent outline-none placeholder:text-muted/70"
          />
        </Field>
        <button
          type="submit"
          className="group inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-8 py-4 font-semibold text-white transition-all duration-300 hover:bg-accent"
        >
          <Search className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
          {d.search.find}
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block rounded-xl px-4 py-2.5 text-ink transition-colors hover:bg-white/70">
      <span className="block text-[11px] font-semibold uppercase tracking-[0.15em] text-muted">{label}</span>
      <span className="mt-0.5 block text-[15px] font-medium">{children}</span>
    </label>
  );
}
