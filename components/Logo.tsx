/** Текстовый логотип REZULTAT — повторяет фирменный знак, чётко смотрится на любом фоне. */
export function Logo({ compact = false, className = "" }: { compact?: boolean; className?: string }) {
  return (
    <span className={`inline-flex flex-col items-center leading-none ${className}`}>
      <span className={`font-serif font-medium tracking-[0.42em] ${compact ? "text-xl" : "text-4xl"} mr-[-0.42em]`}>
        REZULTAT
      </span>
      <span className={`mt-1.5 font-serif tracking-[0.5em] opacity-80 ${compact ? "text-[7px]" : "text-[10px]"} mr-[-0.5em]`}>
        TRANZACTII IMOBILIARE
      </span>
    </span>
  );
}
