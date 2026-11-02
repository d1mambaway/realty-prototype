import type { Lang } from "@/lib/dict";
import { MoldovaFlag } from "./MoldovaFlag";

const FLAG = "shrink-0 overflow-hidden rounded-[2px] h-3 w-[18px]";

/** Флаг рядом с языком: RO — Молдова, RU — Россия, EN — Великобритания */
export function LangFlag({ lang }: { lang: Lang }) {
  if (lang === "ro") return <MoldovaFlag />;
  if (lang === "ru") {
    return (
      <svg viewBox="0 0 30 20" className={`${FLAG} ring-1 ring-black/10`} aria-label="Русский" role="img">
        <rect width="30" height="20" fill="#FFFFFF" />
        <rect y="6.67" width="30" height="6.67" fill="#0039A6" />
        <rect y="13.33" width="30" height="6.67" fill="#D52B1E" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 60 40" className={FLAG} aria-label="English" role="img">
      <clipPath id="uk-flag">
        <rect width="60" height="40" />
      </clipPath>
      <g clipPath="url(#uk-flag)">
        <rect width="60" height="40" fill="#012169" />
        <path d="M0 0 L60 40 M60 0 L0 40" stroke="#FFFFFF" strokeWidth="8" />
        <path d="M0 0 L60 40 M60 0 L0 40" stroke="#C8102E" strokeWidth="3" />
        <path d="M30 0 V40 M0 20 H60" stroke="#FFFFFF" strokeWidth="12" />
        <path d="M30 0 V40 M0 20 H60" stroke="#C8102E" strokeWidth="7" />
      </g>
    </svg>
  );
}
