"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, ChevronDown } from "lucide-react";
import { LANGS } from "@/lib/dict";
import { useI18n } from "@/lib/i18n";
import { MoldovaFlag } from "./MoldovaFlag";

export function LangSwitcher({ light = false }: { light?: boolean }) {
  const { lang, setLang, d } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={d.lang}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold uppercase transition-colors ${
          light ? "hover:bg-white/15" : "hover:bg-sand"
        }`}
      >
        {lang === "ro" && <MoldovaFlag />}
        {lang}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="absolute right-0 top-full mt-2 w-44 origin-top-right overflow-hidden rounded-2xl border border-line bg-white p-1.5 text-ink shadow-xl"
          >
            {LANGS.map((l) => (
              <li key={l.code}>
                <button
                  type="button"
                  onClick={() => {
                    setLang(l.code);
                    setOpen(false);
                  }}
                  className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-medium hover:bg-sand"
                >
                  <span className="w-6 text-xs font-bold uppercase text-muted">{l.code}</span>
                  <span className="flex-1">{l.label}</span>
                  {l.code === "ro" && <MoldovaFlag />}
                  {l.code === lang && <Check className="h-4 w-4 text-accent" />}
                </button>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
