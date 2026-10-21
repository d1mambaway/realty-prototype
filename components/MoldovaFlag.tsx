/** Флаг Молдовы: триколор с упрощённым гербом в центре. */
export function MoldovaFlag({ className = "h-3 w-[18px]" }: { className?: string }) {
  return (
    <svg viewBox="0 0 30 20" className={`shrink-0 overflow-hidden rounded-[2px] ${className}`} aria-label="Moldova" role="img">
      <rect width="10" height="20" fill="#0046AE" />
      <rect x="10" width="10" height="20" fill="#FFD200" />
      <rect x="20" width="10" height="20" fill="#CC092F" />
      {/* Упрощённый герб: орёл со щитом */}
      <path d="M12.2 7.2 L15 5.6 L17.8 7.2 L17 8.2 L15 7.4 L13 8.2 Z" fill="#B07E50" />
      <path d="M13.4 8.6 H16.6 V11.6 Q15 13.6 13.4 11.6 Z" fill="#CC092F" stroke="#B07E50" strokeWidth="0.5" />
      <path d="M13.4 10.1 H16.6 V11.6 Q15 13.6 13.4 11.6 Z" fill="#0046AE" />
    </svg>
  );
}
