import { useState } from 'react'

/** Copy / WhatsApp / native share for a link + message. */
export function ShareLink({ url, message }: { url: string; message: string }) {
  const [copied, setCopied] = useState(false)
  const text = `${message} ${url}`
  const canNativeShare = typeof navigator !== 'undefined' && 'share' in navigator

  return (
    <div className="space-y-3">
      <div className="flex items-stretch rounded-lg border border-gold/40 overflow-hidden">
        <input readOnly value={url} className="flex-1 bg-ink-2 px-4 text-sm text-ivory min-w-0" onFocus={(e) => e.currentTarget.select()} aria-label="Your link" />
        <button
          className="px-4 bg-gold text-ink text-sm font-medium"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(url)
              setCopied(true)
              setTimeout(() => setCopied(false), 2000)
            } catch {
              /* ignore */
            }
          }}
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <div className="flex flex-wrap gap-3">
        <a className="btn-ghost" href={`https://wa.me/?text=${encodeURIComponent(text)}`} target="_blank" rel="noopener noreferrer">
          Share on WhatsApp
        </a>
        {canNativeShare && (
          <button className="btn-ghost" onClick={() => navigator.share({ text: message, url }).catch(() => {})}>
            More options
          </button>
        )}
      </div>
    </div>
  )
}
