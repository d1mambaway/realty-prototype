"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Search } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useCatalogOptions } from "@/lib/store";
import type { Category, Deal } from "@/lib/types";

export function SearchPanel() {
  const { d, city: cityName } = useI18n();
  const router = useRouter();
  const { deals, categories, cities } = useCatalogOptions();
  const labels: Record<Deal, string> = { sale: d.nav.buy, rent: d.nav.rent, daily: d.nav.daily, exchange: d.nav.exchange };
  const tabs = deals.map((deal) => ({ deal, label: labels[deal] }));
  const [deal, setDeal] = useState<Deal>("sale");
  const [city, setCity] = useState("");
  const [type, setType] = useState<Category | "">("");
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
      <div className="inline-flex rounded-t-2xl border border-b-0 border-white/10 bg-deep/70 p-1 backdrop-blur-xl">
        {tabs.map((tab) => (
          <button
            key={tab.deal}
            type="button"
            onClick={() => setDeal(tab.deal)}
            className={`relative rounded-xl px-3.5 py-2 text-sm sm:px-5 font-semibold transition-colors ${
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

      <div className="grid gap-2 rounded-2xl rounded-tl-none border border-white/10 bg-deep/70 p-2 shadow-2xl backdrop-blur-xl sm:grid-cols-[1fr_1fr_1fr_auto]">
        <Field label={d.search.city}>
          <select value={city} onChange={(e) => setCity(e.target.value)} className="w-full bg-transparent outline-none">
            <option value="">{d.search.any}</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {cityName(c)}
              </option>
            ))}
          </select>
        </Field>
        <Field label={d.search.type}>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as Category | "")}
            className="w-full bg-transparent outline-none"
          >
            <option value="">{d.search.any}</option>
            {categories.map((t) => (
              <option key={t} value={t}>
                {d.category[t]}
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
            className="w-full bg-transparent outline-none placeholder:text-white/45"
          />
        </Field>
        <button
          type="submit"
          className="group inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-8 py-4 font-semibold text-white transition-all duration-300 hover:bg-accent-soft hover:text-ink"
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
    <label className="block rounded-xl bg-white/[0.06] px-4 py-2.5 text-white transition-colors hover:bg-white/[0.12] [&_option]:text-ink">
      <span className="block text-xs font-bold uppercase tracking-[0.15em] text-accent-soft">{label}</span>
      <span className="mt-0.5 block text-[15px] font-medium">{children}</span>
    </label>
  );
}
