"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Heart, Menu, Plus, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { LangSwitcher } from "./LangSwitcher";
import { Logo } from "./Logo";

export function Header() {
  const { d } = useI18n();
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const nav = [
    { href: "/listings/?deal=sale", label: d.nav.buy },
    { href: "/listings/?deal=rent", label: d.nav.rent },
    { href: "/listings/?deal=daily", label: d.nav.daily },
    { href: "/listings/?type=commercial", label: d.nav.commercial },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  // На главной шапка прозрачная поверх героя, пока не начали скроллить
  const overHero = pathname === "/" && !scrolled && !open;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-out-expo ${
        overHero ? "py-6 text-white" : "glass border-b border-line/70 py-3 text-ink shadow-[0_8px_30px_-20px_rgba(0,0,0,0.3)]"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" aria-label={d.nav.home} className="transition-opacity duration-300 hover:opacity-70">
          <Logo compact />
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium lg:flex">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="group relative py-1">
              {item.label}
              <span className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-current transition-transform duration-500 ease-out-expo group-hover:scale-x-100" />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <LangSwitcher light={overHero} />
          <Link
            href="/favorites/"
            aria-label={d.nav.favorites}
            className={`hidden rounded-full p-2.5 transition-colors sm:inline-flex ${overHero ? "hover:bg-white/15" : "hover:bg-sand"}`}
          >
            <Heart className="h-5 w-5" />
          </Link>
          <Link
            href="/new/"
            className={`hidden items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 hover:-translate-y-0.5 sm:inline-flex ${
              overHero ? "bg-white text-ink hover:bg-accent-soft" : "bg-ink text-white hover:bg-accent"
            }`}
          >
            <Plus className="h-4 w-4" />
            {d.cta.post}
          </Link>
          <button
            type="button"
            aria-label={d.nav.menu}
            onClick={() => setOpen((v) => !v)}
            className="rounded-full p-2.5 lg:hidden"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden lg:hidden"
          >
            <div className="flex flex-col gap-1 px-4 pb-4 pt-3">
              {[...nav, { href: "/favorites/", label: d.nav.favorites }].map((item) => (
                <Link key={item.href} href={item.href} className="rounded-xl px-3 py-3 font-serif text-2xl hover:bg-sand">
                  {item.label}
                </Link>
              ))}
              <Link href="/new/" className="mt-2 rounded-full bg-ink px-5 py-3 text-center font-semibold text-white">
                {d.cta.post}
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
