"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/lib/i18n";
import { useCatalogOptions, useSettings } from "@/lib/store";
import { Logo } from "./Logo";
import { MoldovaFlag } from "./MoldovaFlag";

export function Footer() {
  const { d } = useI18n();
  const settings = useSettings();
  const { deals } = useCatalogOptions();
  const pathname = usePathname();
  const dealLinks = { sale: d.nav.buy, rent: d.nav.rent, daily: d.nav.daily, exchange: d.nav.exchange };
  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="bg-deep text-white/70">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="md:col-span-2">
          <Logo className="text-white" />
          <p className="mt-6 max-w-sm text-sm leading-relaxed">{d.footer.about}</p>
        </div>
        <div className="space-y-3 text-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-accent-soft">{d.footer.listings}</p>
          {deals.map((deal) => (
            <Link key={deal} href={`/listings/?deal=${deal}`} className="block hover:text-white">
              {dealLinks[deal]}
            </Link>
          ))}
          <Link href="/new/" className="block hover:text-white">{d.cta.post}</Link>
        </div>
        <div className="space-y-3 text-sm">
          <p className="text-xs uppercase tracking-[0.2em] text-accent-soft">{d.footer.contacts}</p>
          <a href={`tel:+${settings.phone.replace(/\D/g, "")}`} className="block hover:text-white">
            {settings.phone}
          </a>
          <a href={`mailto:${settings.email}`} className="block hover:text-white">
            {settings.email}
          </a>
          <p>{settings.address}</p>
          {(settings.instagram || settings.facebook) && (
            <div className="flex gap-4 pt-1">
              {settings.instagram && (
                <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                  Instagram
                </a>
              )}
              {settings.facebook && (
                <a href={settings.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-white">
                  Facebook
                </a>
              )}
            </div>
          )}
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-xs sm:px-6 lg:px-8">
          <p>
            © 2026 REZULTAT · Tranzactii Imobiliare. {d.footer.prototype}{" "}
            <Link href="/privacy/" className="underline-offset-2 hover:text-white hover:underline">
              {d.privacy.link}
            </Link>
          </p>
          <p className="inline-flex items-center gap-2">
            <MoldovaFlag />
            {d.footer.madeIn}
          </p>
        </div>
      </div>
    </footer>
  );
}
