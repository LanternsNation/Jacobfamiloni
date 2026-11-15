/** Clearly marked (but quiet) placeholder for photos, logo and footage still to be supplied. */
export function PlaceholderMedia({ label, className = '' }: { label: string; className?: string }) {
  return (
    <div className={`placeholder-frame flex flex-col items-center justify-center text-center gap-3 p-6 ${className}`}>
      <span className="font-display text-4xl text-gold/30 italic">JF</span>
      <span className="text-[0.62rem] uppercase tracking-[0.25em] text-gold/50">[Placeholder] {label}</span>
    </div>
  )
}

/** Wordmark stands in for the logo until the final mark is delivered. */
export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`font-display text-lg leading-none tracking-tight ${className}`} title="Logo placeholder — replace with final logo">
      <span className="italic text-gold font-light">Dr.</span> Jacob Familoni
    </span>
  )
}
