"use client";

import Link from "next/link";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Check, Loader2, Phone, Send } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { sendLead, useSettings } from "@/lib/store";

const digits = (s: string) => s.replace(/\D/g, "");

/** Позвонить / WhatsApp / Viber / Telegram — номера берутся из настроек админки */
export function ContactButtons({ message }: { message?: string }) {
  const { d } = useI18n();
  const settings = useSettings();
  const messenger = digits(settings.messenger || settings.phone);
  const text = message ? encodeURIComponent(message) : "";

  const links = [
    messenger && { href: `https://wa.me/${messenger}${text ? `?text=${text}` : ""}`, label: "WhatsApp", color: "bg-[#25D366]" },
    messenger && { href: `viber://chat?number=%2B${messenger}`, label: "Viber", color: "bg-[#7360F2]" },
    settings.telegram && {
      href: `https://t.me/${settings.telegram.replace(/^@|^https?:\/\/t\.me\//, "")}`,
      label: "Telegram",
      color: "bg-[#229ED9]",
    },
  ].filter(Boolean) as { href: string; label: string; color: string }[];

  return (
    <div className="space-y-2">
      <a
        href={`tel:+${digits(settings.phone)}`}
        className="flex items-center justify-center gap-2 rounded-2xl bg-ink py-4 font-semibold text-white transition-colors hover:bg-accent"
      >
        <Phone className="h-5 w-5" /> {d.contact.call}: {settings.phone}
      </a>
      {links.length > 0 && (
        <div className={`grid gap-2 ${links.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
          {links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`${l.color} rounded-2xl py-3 text-center text-sm font-semibold text-white transition-opacity hover:opacity-85`}
            >
              {l.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

/** Короткая форма заявки: имя, телефон, сообщение → база + Telegram агента */
export function LeadForm({
  kind,
  listingId,
  defaultMessage = "",
  dark = false,
}: {
  kind: "listing" | "contact";
  listingId?: string;
  defaultMessage?: string;
  dark?: boolean;
}) {
  const { d } = useI18n();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState(defaultMessage);
  const [website, setWebsite] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || digits(phone).length < 8) return;
    setState("sending");
    try {
      await sendLead({ kind, name, phone, message, listingId, website });
      setState("sent");
    } catch {
      setState("error");
    }
  }

  const input = `w-full rounded-xl border px-4 py-3 text-[15px] outline-none transition-colors ${
    dark
      ? "border-white/15 bg-white/5 text-white placeholder:text-white/40 focus:border-accent-soft"
      : "border-line bg-ivory/60 placeholder:text-muted/70 focus:border-accent focus:bg-white"
  }`;

  return (
    <AnimatePresence mode="wait" initial={false}>
      {state === "sent" ? (
        <motion.p
          key="sent"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center gap-3 rounded-2xl p-4 font-medium ${dark ? "bg-white/10" : "bg-sand/70"}`}
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent text-white">
            <Check className="h-4 w-4" />
          </span>
          {d.contact.sent}
        </motion.p>
      ) : (
        <motion.form key="form" onSubmit={submit} className="space-y-2.5" exit={{ opacity: 0 }}>
          <input required value={name} onChange={(e) => setName(e.target.value)} placeholder={d.contact.name} className={input} autoComplete="name" />
          <input
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={`${d.contact.phone}: +373 …`}
            inputMode="tel"
            autoComplete="tel"
            className={input}
          />
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={d.contact.messagePh}
            rows={3}
            className={`${input} resize-none`}
          />
          {/* Ловушка для ботов: поле скрыто от людей */}
          <input value={website} onChange={(e) => setWebsite(e.target.value)} tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
          <button
            type="submit"
            disabled={state === "sending"}
            className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-semibold transition-colors disabled:opacity-60 ${
              dark ? "bg-accent text-white hover:bg-accent-soft hover:text-ink" : "bg-accent text-white hover:bg-ink"
            }`}
          >
            {state === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {d.contact.send}
          </button>
          {state === "error" && <p className="text-sm text-red-500">{d.contact.failed}</p>}
          <Consent dark={dark} />
        </motion.form>
      )}
    </AnimatePresence>
  );
}

export function Consent({ dark = false }: { dark?: boolean }) {
  const { d } = useI18n();
  return (
    <p className={`text-xs leading-relaxed ${dark ? "text-white/50" : "text-muted"}`}>
      {d.contact.consent[0]}
      <Link href="/privacy/" className="underline underline-offset-2 hover:text-accent">
        {d.contact.consent[1]}
      </Link>
      .
    </p>
  );
}
