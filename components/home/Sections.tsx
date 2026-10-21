"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView, useScroll, useTransform } from "motion/react";
import { ArrowUpRight, Camera, FileText, Sparkles } from "lucide-react";
import { ListingCard } from "@/components/ListingCard";
import { Reveal } from "@/components/Reveal";
import { img, plural } from "@/lib/format";
import { useListings } from "@/lib/store";
import { CITIES } from "@/lib/types";

export function CityMarquee() {
  const items = [...CITIES, ...CITIES];
  return (
    <div className="overflow-hidden border-y border-line bg-ivory py-6">
      <div className="marquee flex w-max gap-12">
        {[...items, ...items].map((city, i) => (
          <span key={i} className="flex items-center gap-12 font-serif text-3xl italic text-ink/70">
            {city}
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          </span>
        ))}
      </div>
    </div>
  );
}

export function Featured() {
  const listings = useListings();
  const featured = listings.filter((l) => l.featured || l.own).slice(0, 6);
  return (
    <section id="featured" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-24 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.3em] text-accent">Подборка недели</p>
          <h2 className="mt-3 font-serif text-4xl font-medium sm:text-6xl">
            Избранные <em className="text-accent">объекты</em>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <Link href="/listings/" className="group inline-flex items-center gap-2 font-semibold">
            Все объявления
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

const CATEGORIES = [
  { title: "Квартиры", href: "/listings/?type=apartment", image: img("1502672260266-1c1ef2d93688", 1200) },
  { title: "Дома", href: "/listings/?type=house", image: img("1580587771525-78b9dba3b914", 1200) },
  { title: "Коммерция", href: "/listings/?type=commercial", image: img("1486406146926-c627a92ad1ab", 1200) },
  { title: "Участки", href: "/listings/?type=land", image: img("1500382017468-9049fed747ef", 1200) },
];

export function Categories() {
  const listings = useListings();
  const count = (href: string) => listings.filter((l) => href.endsWith(`type=${l.type}`)).length;
  return (
    <section className="bg-sand/60 py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <h2 className="font-serif text-4xl font-medium sm:text-6xl">Что ищете?</h2>
        </Reveal>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((cat, i) => (
            <Reveal key={cat.title} delay={i * 0.08}>
              <Link href={cat.href} className="group relative block aspect-[3/4] overflow-hidden rounded-3xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cat.image}
                  alt={cat.title}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.4s] ease-out-expo group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent transition-opacity duration-500 group-hover:opacity-80" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6 text-white">
                  <div>
                    <p className="font-serif text-3xl">{cat.title}</p>
                    <p className="mt-1 text-sm text-white/70">{count(cat.href)} {plural(count(cat.href), ["объявление", "объявления", "объявлений"])}</p>
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
      {value.toLocaleString("ru-RU")}
      {suffix}
    </span>
  );
}

export function Stats() {
  const stats = [
    { to: 12400, suffix: "+", label: "объявлений" },
    { to: 98, suffix: "%", label: "довольных клиентов" },
    { to: 36, suffix: "", label: "городов" },
    { to: 15, suffix: " мин", label: "среднее время ответа" },
  ];
  return (
    <section className="mx-auto grid max-w-7xl gap-10 px-4 py-24 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
      {stats.map((s, i) => (
        <Reveal key={s.label} delay={i * 0.08} className="border-t border-ink pt-6">
          <p className="font-serif text-6xl font-medium">
            <Counter to={s.to} suffix={s.suffix} />
          </p>
          <p className="mt-2 text-muted">{s.label}</p>
        </Reveal>
      ))}
    </section>
  );
}

const STEPS = [
  { icon: FileText, title: "Опишите объект", text: "Тип, цена, площадь и пара честных слов о том, чем он хорош." },
  { icon: Camera, title: "Добавьте фото", text: "Загрузите снимки — мы аккуратно сожмём их без потери качества." },
  { icon: Sparkles, title: "Публикуйте", text: "Объявление сразу появится в каталоге и подборках." },
];

export function HowItWorks() {
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
            <p className="text-xs uppercase tracking-[0.3em] text-accent-soft">Собственникам и агентам</p>
            <h2 className="mt-3 font-serif text-4xl font-medium sm:text-6xl">
              Разместите объявление <em className="text-accent-soft">за три шага</em>
            </h2>
          </Reveal>
          <div className="mt-12 space-y-8">
            {STEPS.map((step, i) => (
              <Reveal key={step.title} delay={0.1 + i * 0.1} className="flex gap-5">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/20 text-accent-soft">
                  <step.icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-xl font-semibold">
                    <span className="mr-2 font-serif text-accent-soft">0{i + 1}</span>
                    {step.title}
                  </p>
                  <p className="mt-1 text-white/60">{step.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={0.4}>
            <Link
              href="/new/"
              className="mt-12 inline-flex items-center gap-2 rounded-full bg-accent px-8 py-4 font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-accent-soft hover:text-ink"
            >
              Подать объявление
              <ArrowUpRight className="h-5 w-5" />
            </Link>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
