"use client";

import { Clock, Mail, MapPin } from "lucide-react";
import { LeadForm } from "@/components/Contact";
import { PhoneWithMessengers } from "@/components/Messengers";
import { Reveal } from "@/components/Reveal";
import { useI18n } from "@/lib/i18n";
import { usePageMeta } from "@/lib/meta";
import { useSettings } from "@/lib/store";

export function ContactsPage() {
  const { d } = useI18n();
  const settings = useSettings();
  usePageMeta(d.meta.contacts.title, d.meta.contacts.description);
  const phones = [settings.phone, settings.phone2].filter(Boolean);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-32 sm:px-6 lg:px-8">
      <Reveal>
        <p className="text-xs uppercase tracking-[0.3em] text-accent">{d.contactsPage.kicker}</p>
        <h1 className="mt-3 font-serif text-5xl font-medium sm:text-7xl">
          {d.contactsPage.title[0]} <em className="text-accent">{d.contactsPage.title[1]}</em>
        </h1>
        <p className="mt-4 max-w-xl text-lg text-ink/75">{d.contactsPage.sub}</p>
      </Reveal>

      <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_420px]">
        <Reveal className="grid content-start gap-8 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{d.contactsPage.phones}</p>
            <div className="mt-4 grid gap-6 sm:grid-cols-2">
              {phones.map((p) => (
                <PhoneWithMessengers key={p} phone={p} large />
              ))}
            </div>
          </div>
          <Info icon={Mail} label={d.contactsPage.email}>
            <a href={`mailto:${settings.email}`} className="hover:text-accent">
              {settings.email}
            </a>
          </Info>
          <Info icon={MapPin} label={d.contactsPage.address}>
            {settings.address}
          </Info>
          {settings.hours && (
            <Info icon={Clock} label={d.contactsPage.hours}>
              {settings.hours}
            </Info>
          )}
          {(settings.instagram || settings.facebook) && (
            <div className="flex gap-4 text-sm font-semibold">
              {settings.instagram && (
                <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-accent">
                  Instagram
                </a>
              )}
              {settings.facebook && (
                <a href={settings.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-accent">
                  Facebook
                </a>
              )}
            </div>
          )}
        </Reveal>

        <Reveal delay={0.1}>
          <div className="rounded-[2rem] bg-white p-7 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.35)]">
            <p className="mb-4 font-serif text-3xl">{d.contactsPage.formTitle}</p>
            <LeadForm kind="contact" />
          </div>
        </Reveal>
      </div>
    </div>
  );
}

function Info({ icon: Icon, label, children }: { icon: typeof Mail; label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-sand text-accent">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">{label}</p>
        <p className="mt-1 text-lg">{children}</p>
      </div>
    </div>
  );
}
