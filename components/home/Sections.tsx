"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView, useScroll, useTransform } from "motion/react";
import { ArrowUpRight, Camera, FileText, Sparkles } from "lucide-react";
import { ListingCard } from "@/components/ListingCard";
import { Reveal } from "@/components/Reveal";
import { img } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { useCatalogOptions, useListings } from "@/lib/store";

export function CityMarquee() {
  const { city } = useI18n();
  const { cities } = useCatalogOptions();
  const items = [...cities, ...cities, ...cities];
  return (
    <div className="overflow-hidden border-y border-line bg-ivory py-6">
      <div className="marquee flex w-max gap-12">
        {[...items, ...items].map((c, i) => (
          <span key={i} className="flex items-center gap-12 font-serif text-3xl italic text-ink/70">
            {city(c)}
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          </span>
        ))}
      </div>
    </div>
  );
}

export function Featured() {
  const { d } = useI18n();
  const listings = useListings();
  const featured = listings.filter((l) => l.featured || l.own).slice(0, 6);
  return (
    <section id="featured" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-24 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.3em] text-accent">{d.home.featuredKicker}</p>
          <h2 className="mt-3 font-serif text-4xl font-medium sm:text-6xl">
            {d.home.featuredTitle[0]} <em className="text-accent">{d.home.featuredTitle[1]}</em>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <Link href="/listings/" className="group inline-flex items-center gap-2 font-semibold">
            {d.home.allListings}
            <ArrowUpRight className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
          </Link>
        </Reveal>
      </div>
      <div className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        {featured.map((listing, i) => (
          <ListingCard key={listing.id} listing={listing} index={i} />
        ))}
      </div>
    </section>
  );
}

export function Categories() {
  const { d } = useI18n();
  const listings = useListings();
  const { types } = useCatalogOptions();
  // Обложка категории — фото избранного объявления этого типа (или первого попавшегося)
  const cover = (type: string) =>
    (listings.find((l) => l.type === type && l.featured) ?? listings.find((l) => l.type === type))?.images[0] ?? "";
  const categories = types.map((type) => ({ type, image: cover(type) }));
  return (
    <section className="bg-sand/60 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="font-serif text-4xl font-medium sm:text-6xl">{d.home.categoriesTitle}</h2>
        </Reveal>
        <div className={`mt-12 grid gap-4 sm:grid-cols-2 ${categories.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"}`}>
          {categories.map((cat, i) => (
            <Reveal key={cat.type} delay={i * 0.08}>
              <Link href={`/listings/?type=${cat.type}`} className="group relative block aspect-[3/4] overflow-hidden rounded-3xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cat.image}
                  alt={d.typePlural[cat.type]}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.4s] ease-out-expo group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent transition-opacity duration-500 group-hover:opacity-80" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6 text-white">
                  <div>
                    <p className="font-serif text-3xl">{d.typePlural[cat.type]}</p>
                    <p className="mt-1 text-sm text-white/70">{d.listingsCount(listings.filter((l) => l.type === cat.type).length)}</p>
                  </div>
                  <span className="rounded-full bg-white/20 p-3 backdrop-blur transition-all duration-500 group-hover:rotate-45 group-hover:bg-white group-hover:text-ink">
                    <ArrowUpRight className="h-5 w-5" />
                  </span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const { lang } = useI18n();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const controls = animate(0, to, { duration: 2, ease: [0.16, 1, 0.3, 1], onUpdate: (v) => setValue(Math.round(v)) });
    return () => controls.stop();
  }, [inView, to]);
  return (
    <span ref={ref}>
      {value.toLocaleString(lang === "en" ? "en-GB" : "ru-RU")}
      {suffix}
    </span>
  );
}

export function Stats() {
  const { d } = useI18n();
  const listings = useListings();
  // Цифры считаются по реальным объявлениям
  const landHectares = listings.filter((l) => l.type === "land").reduce((sum, l) => sum + l.area, 0) / 10_000;
  const stats = [
    { to: listings.length, suffix: "" },
    { to: new Set(listings.map((l) => l.city)).size, suffix: "" },
    { to: listings.filter((l) => l.exchangeFor).length, suffix: "" },
    { to: Math.round(landHectares), suffix: "" },
  ];
  return (
    <section className="mx-auto grid max-w-7xl gap-10 px-4 py-24 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
      {stats.map((s, i) => (
        <Reveal key={i} delay={i * 0.08} className="border-t border-ink pt-6">
          <p className="font-serif text-6xl font-medium">
            <Counter to={s.to} suffix={s.suffix} />
          </p>
          <p className="mt-2 text-muted">{d.home.stats[i]}</p>
        </Reveal>
      ))}
    </section>
  );
}

const STEP_ICONS = [FileText, Camera, Sparkles];

export function HowItWorks() {
  const { d } = useI18n();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["-12%", "12%"]);

  return (
    <section className="bg-deep py-24 text-white">
      <div ref={ref} className="mx-auto grid max-w-7xl items-center gap-16 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem]">
          <motion.div style={{ y }} className="absolute -inset-y-[12%] inset-x-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img("1600210492486-724fe5c67fb0", 1400)} alt="" loading="lazy" className="h-full w-full object-cover" />
          </motion.div>
        </div>
        <div>
          <Reveal>
            <p className="text-xs uppercase tracking-[0.3em] text-accent-soft">{d.home.howKicker}</p>
            <h2 className="mt-3 font-serif text-4xl font-medium sm:text-6xl">
              {d.home.howTitle[0]} <em className="text-accent-soft">{d.home.howTitle[1]}</em>
            </h2>
          </Reveal>
          <div className="mt-12 space-y-8">
            {d.home.steps.map((step, i) => {
              const Icon = STEP_ICONS[i];
              return (
                <Reveal key={i} delay={0.1 + i * 0.1} className="flex gap-5">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/20 text-accent-soft">
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-xl font-semibold">
                      <span className="mr-2 font-serif text-accent-soft">0{i + 1}</span>
                      {step.title}
                    </p>
                    <p className="mt-1 text-white/60">{step.text}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
          <Reveal delay={0.4}>
            <Link
              href="/new/"
              className="mt-12 inline-flex items-center gap-2 rounded-full bg-accent px-8 py-4 font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-accent-soft hover:text-ink"
            >
              {d.cta.post}
              <ArrowUpRight className="h-5 w-5" />
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
