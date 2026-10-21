"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { Logo } from "./Logo";
import { MoldovaFlag } from "./MoldovaFlag";

export function Footer() {
  const { d } = useI18n();
  return (
    <footer className="bg-deep text-white/70">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="md:col-span-2">
          <Logo className="text-white" />
          <p className="mt-6 max-w-sm text-sm leading-relaxed">{d.footer.about}</p>
        </div>
        <div className="space-y-3 text-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-accent-soft">{d.footer.listings}</p>
          <Link href="/listings/?deal=sale" className="block hover:text-white">{d.nav.buy}</Link>
          <Link href="/listings/?deal=rent" className="block hover:text-white">{d.nav.rent}</Link>
          <Link href="/listings/?deal=daily" className="block hover:text-white">{d.nav.daily}</Link>
          <Link href="/new/" className="block hover:text-white">{d.cta.post}</Link>
        </div>
        <div className="space-y-3 text-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-accent-soft">{d.footer.contacts}</p>
          <p>office@rezultat.example</p>
          <p>+373 22 000 000</p>
          <p>{d.city.chisinau}, Moldova</p>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-xs sm:px-6 lg:px-8">
          <p>© 2026 REZULTAT · Tranzactii Imobiliare. {d.footer.prototype}</p>
          <p className="inline-flex items-center gap-2">
            <MoldovaFlag />
            {d.footer.madeIn}
          </p>
        </div>
      </div>
    </footer>
  );
}
