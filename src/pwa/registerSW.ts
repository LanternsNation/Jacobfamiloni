import { Workbox } from 'workbox-window'

type Listener = () => void
const listeners = new Set<Listener>()

/** Subscribe to "a new version just took over" events (used by the update toast). */
export function onAppUpdated(fn: Listener) {
  listeners.add(fn)
  return () => listeners.delete(fn)
}

/**
 * Registers the service worker. registerType is 'autoUpdate' (skipWaiting + clientsClaim),
 * so a new version activates on its own; we tell the user, then reload so they see it.
 */
export function registerSW() {
  if (!('serviceWorker' in navigator) || import.meta.env.DEV) return

  let wb: Workbox
  try {
    wb = new Workbox('/sw.js', { scope: '/' })
  } catch {
    return
  }

  wb.addEventListener('controlling', (event) => {
    if (!event.isUpdate) return
    listeners.forEach((fn) => fn())
    window.setTimeout(() => window.location.reload(), 1800)
  })

  wb.register().catch(() => undefined).then((reg) => {
    if (!reg) return
    // Check for a new version every hour while the app stays open, and whenever it comes back to the foreground.
    window.setInterval(() => reg.update().catch(() => {}), 60 * 60 * 1000)
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') reg.update().catch(() => {})
    })
  })
}
