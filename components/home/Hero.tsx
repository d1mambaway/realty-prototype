"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowDown } from "lucide-react";
import { img } from "@/lib/format";
import { useI18n } from "@/lib/i18n";
import { usePageMeta } from "@/lib/meta";
import { SearchPanel } from "./SearchPanel";

// Поля и город на рассвете с дрона (Unsplash, оригинал 13 000 px)
const HERO = "1775762951334-8db09e259811";

export function Hero() {
  const { d, lang } = useI18n();
  const lines = d.hero.lines;
  usePageMeta(d.meta.home.title, d.meta.home.description);
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  // Параллакс: фото уезжает медленнее страницы и чуть приближается, текст тает
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1.05, 1.2]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);
  // На телефоне поиск высокий: если текст уезжает вниз при прокрутке, он обрезается — там без этого эффекта
  const [wide, setWide] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const update = () => setWide(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <section ref={ref} className="relative flex min-h-[100svh] items-center overflow-hidden bg-deep">
      <motion.div style={{ y: imageY, scale: imageScale }} className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={img(HERO, 2400)}
          srcSet={[1280, 1920, 2560, 3200].map((w) => `${img(HERO, w)} ${w}w`).join(", ")}
          sizes="100vw"
          alt=""
          fetchPriority="high"
          className="h-full w-full object-cover object-[50%_60%]"
        />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-black/70" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/25 to-transparent" />

      <motion.div
        style={wide ? { y: contentY, opacity: contentOpacity } : undefined}
        className="relative mx-auto w-full max-w-7xl px-4 pb-16 pt-32 sm:px-6 lg:px-8"
      >
        <motion.p
          initial={{ opacity: 0, letterSpacing: "0.6em" }}
          animate={{ opacity: 1, letterSpacing: "0.3em" }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          className="text-xs uppercase text-accent-soft sm:text-sm"
        >
          {d.hero.kicker}
        </motion.p>

        {/* Лозунг в две строки одним начертанием: первая белая, вторая золотая */}
        <h1 className="mt-6 max-w-4xl font-serif text-4xl font-bold leading-[1.08] text-white [text-shadow:0_2px_30px_rgba(0,0,0,0.35)] sm:text-6xl lg:text-7xl">
          {lines.map((line, li) => (
            <span key={`${lang}-${li}`} className={`block ${li > 0 ? "text-accent-soft" : ""}`}>
              {line.map((word, wi) => {
                const i = lines.slice(0, li).flat().length + wi;
                return (
                  <span key={wi} className="hero-word mr-[0.2em] inline-block pb-2" style={{ animationDelay: `${0.1 + i * 0.08}s` }}>
                    {word}
                  </span>
                );
              })}
            </span>
          ))}
        </h1>

        {/* Направления работы агентства — по строке на каждое */}
        <ul className="mt-6 max-w-xl space-y-1.5 text-base leading-snug text-white/90 [text-shadow:0_1px_12px_rgba(0,0,0,0.5)] sm:text-lg">
          {d.hero.sub.map((item) => (
            <li key={item} className="flex gap-3">
              <span className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full bg-accent-soft" />
              {item}
            </li>
          ))}
        </ul>

        {/* Оплата в USDT — отдельной плашкой в фирменном цвете Tether, чтобы выделялась */}
        <p className="mt-5 inline-flex items-center gap-2.5 rounded-full border border-[#26A17B]/60 bg-[#26A17B]/20 py-1.5 pl-1.5 pr-4 text-sm font-semibold text-white backdrop-blur-md sm:text-base">
          <svg viewBox="0 0 32 32" className="h-7 w-7 shrink-0" aria-hidden="true">
            <circle cx="16" cy="16" r="16" fill="#26A17B" />
            <path
              fill="#fff"
              d="M17.92 17.38v-.01c-.11.01-.68.04-1.95.04-1.01 0-1.73-.03-1.98-.04-3.9-.17-6.81-.85-6.81-1.66s2.91-1.49 6.81-1.66v2.65c.26.02.99.06 2 .06 1.21 0 1.82-.05 1.93-.06v-2.65c3.89.17 6.8.85 6.8 1.66s-2.91 1.49-6.8 1.67m0-3.6V11.4h5.43V7.78H8.56v3.62h5.43v2.37c-4.42.2-7.74 1.08-7.74 2.13s3.32 1.93 7.74 2.13v7.6h3.93v-7.6c4.41-.2 7.72-1.08 7.72-2.13s-3.31-1.93-7.72-2.13"
            />
          </svg>
          {d.hero.usdt}
        </p>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, delay: 1, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10"
        >
          <SearchPanel />
        </motion.div>
      </motion.div>

      <motion.a
        href="#featured"
        aria-label={d.hero.scroll}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, y: [0, 8, 0] }}
        transition={{ opacity: { delay: 1.6 }, y: { duration: 2, repeat: Infinity, ease: "easeInOut" } }}
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 rounded-full border border-white/40 p-3 text-white sm:block"
      >
        <ArrowDown className="h-4 w-4" />
      </motion.a>
    </section>
  );
}
