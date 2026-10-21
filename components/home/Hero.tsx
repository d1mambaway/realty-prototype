"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { ArrowDown } from "lucide-react";
import { img } from "@/lib/format";
import { SearchPanel } from "./SearchPanel";

const WORDS = ["Дом,", "в", "котором", "хочется", "жить"];

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  // Параллакс: фото уезжает медленнее страницы и чуть приближается, текст тает
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "25%"]);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1.05, 1.2]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section ref={ref} className="relative flex min-h-[100svh] items-center overflow-hidden bg-deep">
      <motion.div style={{ y: imageY, scale: imageScale }} className="absolute inset-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img("1600596542815-ffad4c1539a9", 2400)} alt="" className="h-full w-full object-cover" />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-black/70" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/25 to-transparent" />

      <motion.div
        style={{ y: contentY, opacity: contentOpacity }}
        className="relative mx-auto w-full max-w-7xl px-4 pb-16 pt-32 sm:px-6 lg:px-8"
      >
        <motion.p
          initial={{ opacity: 0, letterSpacing: "0.6em" }}
          animate={{ opacity: 1, letterSpacing: "0.3em" }}
          transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
          className="text-xs uppercase text-accent-soft sm:text-sm"
        >
          Покупка · Продажа · Аренда
        </motion.p>

        <h1 className="mt-6 max-w-4xl font-serif text-5xl font-medium leading-[1.02] text-white sm:text-7xl lg:text-8xl">
          {WORDS.map((word, i) => (
            <span key={i} className="inline-block overflow-hidden pb-2 align-bottom">
              <motion.span
                className={`mr-[0.25em] inline-block ${i === WORDS.length - 1 ? "italic text-accent-soft" : ""}`}
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{ duration: 1.1, delay: 0.2 + i * 0.09, ease: [0.16, 1, 0.3, 1] }}
              >
                {word}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg"
        >
          Квартиры, дома и офисы от собственников и проверенных агентов. Найдите своё — или разместите объявление за пару минут.
        </motion.p>

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
        aria-label="Листать вниз"
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
