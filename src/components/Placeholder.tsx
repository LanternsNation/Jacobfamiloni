/** Clearly marked placeholder for photos, logo and footage still to be supplied. */
export function PlaceholderMedia({ label, className = '' }: { label: string; className?: string }) {
  return (
    <div className={`placeholder-box flex items-center justify-center text-center text-xs tracking-widest uppercase p-4 ${className}`}>
      <span>[Placeholder] {label}</span>
    </div>
  )
}

/** Wordmark stands in for the logo until the final mark is delivered. */
export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`font-display text-lg leading-none ${className}`} title="Logo placeholder — replace with final logo">
      Dr. Jacob <span className="text-gold">Familoni</span>
    </span>
  )
}
