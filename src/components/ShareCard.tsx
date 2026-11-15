import { useEffect, useState } from 'react'

/** Draws a 1080×1350 share card on a canvas (no server, no image downloads). */
async function drawCard(headline: string, sub: string): Promise<Blob | null> {
  const W = 1080
  const H = 1350
  const c = document.createElement('canvas')
  c.width = W
  c.height = H
  const ctx = c.getContext('2d')
  if (!ctx) return null
  try {
    await document.fonts.ready
  } catch {
    /* ignore */
  }

  const g = ctx.createRadialGradient(W * 0.7, H * 0.15, 50, W * 0.5, H * 0.5, H)
  g.addColorStop(0, '#2a2416')
  g.addColorStop(0.45, '#121828')
  g.addColorStop(1, '#0B0F1A')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, W, H)

  ctx.strokeStyle = 'rgba(201,162,74,0.55)'
  ctx.lineWidth = 2
  ctx.strokeRect(60, 60, W - 120, H - 120)

  ctx.fillStyle = '#C9A24A'
  ctx.font = '500 28px Inter, system-ui, sans-serif'
  ctx.letterSpacing = '8px'
  ctx.fillText('DR. JACOB FAMILONI', 120, 180)
  ctx.letterSpacing = '0px'

  ctx.fillStyle = '#F5F1E8'
  ctx.font = '400 92px Fraunces, Georgia, serif'
  wrap(ctx, headline, 120, 420, W - 240, 104)

  ctx.fillStyle = '#C9A24A'
  ctx.fillRect(120, H - 330, 120, 3)
  ctx.fillStyle = '#E9E3D5'
  ctx.font = '400 36px Inter, system-ui, sans-serif'
  wrap(ctx, sub, 120, H - 260, W - 240, 50)

  ctx.fillStyle = '#A39D90'
  ctx.font = '400 30px Inter, system-ui, sans-serif'
  ctx.fillText(window.location.host, 120, H - 120)

  return new Promise((res) => c.toBlob((b) => res(b), 'image/png'))
}

function wrap(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lh: number) {
  const words = text.split(' ')
  let line = ''
  for (const w of words) {
    const test = line ? line + ' ' + w : w
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, y)
      line = w
      y += lh
    } else line = test
  }
  if (line) ctx.fillText(line, x, y)
}

export function ShareCard({ headline, sub, shareText }: { headline: string; sub: string; shareText: string }) {
  const [url, setUrl] = useState<string | null>(null)
  const [blob, setBlob] = useState<Blob | null>(null)

  useEffect(() => {
    let u: string | null = null
    drawCard(headline, sub).then((b) => {
      if (!b) return
      setBlob(b)
      u = URL.createObjectURL(b)
      setUrl(u)
    })
    return () => {
      if (u) URL.revokeObjectURL(u)
    }
  }, [headline, sub])

  const file = blob ? new File([blob], 'familoni-share.png', { type: 'image/png' }) : null
  const canShareFile = Boolean(file && navigator.canShare?.({ files: [file] }))
  const link = `${window.location.origin}/support`

  return (
    <div className="grid md:grid-cols-2 gap-8 items-start">
      {url ? (
        <img src={url} alt={headline} className="w-full rounded-sm border border-gold/20" />
      ) : (
        <div className="aspect-[4/5] bg-ink-2 rounded-sm" />
      )}
      <div className="space-y-3">
        {canShareFile && file && (
          <button className="btn-gold w-full" onClick={() => navigator.share({ files: [file], text: `${shareText} ${link}` }).catch(() => {})}>
            Share card
          </button>
        )}
        <a className="btn-ghost w-full" href={`https://wa.me/?text=${encodeURIComponent(`${shareText} ${link}`)}`} target="_blank" rel="noopener noreferrer">
          Share on WhatsApp
        </a>
        <a
          className="btn-ghost w-full"
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(link)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Share on X
        </a>
        {url && (
          <a className="btn-ghost w-full" href={url} download="familoni-share.png">
            Download image
          </a>
        )}
      </div>
    </div>
  )
}
