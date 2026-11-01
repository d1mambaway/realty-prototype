"use client";

import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { MessageCircle, Phone, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useSettings } from "@/lib/store";

const digitsOf = (phone: string) => phone.replace(/\D/g, "");

/** Ссылки на мессенджеры для номера: WhatsApp, Viber, Telegram */
export function messengerLinks(phone: string) {
  const digits = digitsOf(phone);
  return [
    { label: "WhatsApp", href: `https://wa.me/${digits}`, color: "bg-[#25D366]" },
    { label: "Viber", href: `viber://chat?number=%2B${digits}`, color: "bg-[#7360F2]" },
    { label: "Telegram", href: `https://t.me/+${digits}`, color: "bg-[#229ED9]" },
  ];
}

/** Номер телефона (ссылка на звонок) и кнопки мессенджеров под ним */
export function PhoneWithMessengers({ phone, dark = false, large = false }: { phone: string; dark?: boolean; large?: boolean }) {
  return (
    <div className="space-y-2">
      <a
        href={`tel:+${digitsOf(phone)}`}
        className={`block font-semibold ${large ? "font-serif text-3xl" : "text-base"} ${dark ? "text-white/90 hover:text-white" : "hover:text-accent"}`}
      >
        {phone}
      </a>
      <div className="flex flex-wrap gap-1.5">
        {messengerLinks(phone).map((m) => (
          <a
            key={m.label}
            href={m.href}
            target="_blank"
            rel="noopener noreferrer"
            className={`${m.color} rounded-full px-3 py-1 text-xs font-semibold text-white transition-opacity hover:opacity-85`}
          >
            {m.label}
          </a>
        ))}
      </div>
    </div>
  );
}

/** Плавающая кнопка связи в углу экрана: звонок и мессенджеры по первому номеру */
export function FloatingContact() {
  const { d } = useI18n();
  const settings = useSettings();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  if (pathname.startsWith("/admin") || !settings.phone) return null;

  const items = [{ label: d.contact.call, href: `tel:+${digitsOf(settings.phone)}`, color: "bg-ink" }, ...messengerLinks(settings.phone)];

  return (
    <div
      className="fixed z-40 flex flex-col items-end gap-2"
      style={{ right: "max(16px, env(safe-area-inset-right, 0px))", bottom: "calc(16px + env(safe-area-inset-bottom, 0px))" }}
    >
      <AnimatePresence>
        {open &&
          items.map((item, i) => (
            <motion.a
              key={item.label}
              href={item.href}
              target={item.href.startsWith("tel:") ? undefined : "_blank"}
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 12, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.9 }}
              transition={{ duration: 0.25, delay: (items.length - 1 - i) * 0.04, ease: [0.16, 1, 0.3, 1] }}
              className={`${item.color} inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold text-white shadow-lg`}
            >
              {item.href.startsWith("tel:") && <Phone className="h-4 w-4" />}
              {item.label}
            </motion.a>
          ))}
      </AnimatePresence>
      <button
        type="button"
        aria-label={open ? d.floating.close : d.floating.open}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-accent text-white shadow-[0_12px_30px_-8px_rgba(0,0,0,0.45)] transition-transform hover:scale-105 active:scale-95"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  );
}
