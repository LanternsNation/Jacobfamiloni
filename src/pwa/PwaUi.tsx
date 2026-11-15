import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { onAppUpdated } from './registerSW'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

let deferred: BeforeInstallPromptEvent | null = null
const subs = new Set<() => void>()
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferred = e as BeforeInstallPromptEvent
    subs.forEach((f) => f())
  })
  window.addEventListener('appinstalled', () => {
    deferred = null
    subs.forEach((f) => f())
  })
}

const isStandalone = () =>
  window.matchMedia?.('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent)

/** Hook for any "Install app" button (also used on the application confirmation screen). */
export function useInstall() {
  const [, force] = useState(0)
  useEffect(() => {
    const f = () => force((n) => n + 1)
    subs.add(f)
    return () => {
      subs.delete(f)
    }
  }, [])
  const installed = typeof window !== 'undefined' && isStandalone()
  return {
    canPrompt: Boolean(deferred) && !installed,
    iosHint: !installed && typeof window !== 'undefined' && isIOS(),
    installed,
    async install() {
      if (!deferred) return false
      await deferred.prompt()
      const { outcome } = await deferred.userChoice
      deferred = null
      subs.forEach((f) => f())
      return outcome === 'accepted'
    },
  }
}

const DISMISS_KEY = 'jf_install_dismissed_at'

/** Small bottom sheet offering to install. Appears after a short delay, and not again for 7 days if dismissed. */
export function InstallPrompt() {
  const { canPrompt, iosHint, install } = useInstall()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!canPrompt && !iosHint) return
    let dismissedAt = 0
    try {
      dismissedAt = Number(localStorage.getItem(DISMISS_KEY) || 0)
    } catch {
      /* ignore */
    }
    if (Date.now() - dismissedAt < 7 * 24 * 3600 * 1000) return
    const t = window.setTimeout(() => setVisible(true), 12000)
    return () => window.clearTimeout(t)
  }, [canPrompt, iosHint])

  const dismiss = () => {
    setVisible(false)
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()))
    } catch {
      /* ignore */
    }
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="dialog"
          aria-label="Install app"
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-3 bottom-3 z-50 md:left-auto md:right-6 md:bottom-6 md:w-96 rounded-2xl bg-ink-2/95 backdrop-blur border border-gold/30 p-5 shadow-2xl"
          style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom))' }}
        >
          <div className="flex items-start gap-4">
            <img src="/icons/icon-192.png" alt="" width={48} height={48} className="rounded-xl" />
            <div className="flex-1">
              <p className="font-display text-xl">Keep his story close</p>
              {canPrompt ? (
                <p className="text-sm text-ivory-2 mt-1">Install the app. It opens fast and works with weak data.</p>
              ) : (
                <p className="text-sm text-ivory-2 mt-1">
                  On iPhone: tap <span className="text-gold">Share</span>, then <span className="text-gold">Add to Home Screen</span>.
                </p>
              )}
            </div>
          </div>
          <div className="mt-4 flex gap-3">
            <button onClick={dismiss} className="btn-ghost flex-1 !min-h-11">Not now</button>
            {canPrompt && (
              <button
                onClick={async () => {
                  await install()
                  setVisible(false)
                }}
                className="btn-gold flex-1 !min-h-11"
              >
                Install app
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/** "New version available, refreshing" toast. */
export function UpdateToast() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const off = onAppUpdated(() => setShow(true))
    return () => {
      off()
    }
  }, [])
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          role="status"
          aria-live="polite"
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          className="fixed top-3 left-1/2 -translate-x-1/2 z-[60] rounded-full bg-gold text-ink px-5 py-2.5 text-sm font-medium shadow-xl"
        >
          New version available, refreshing…
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/** Thin banner when the device goes offline. */
export function OfflineBanner() {
  const [offline, setOffline] = useState(typeof navigator !== 'undefined' && !navigator.onLine)
  useEffect(() => {
    const on = () => setOffline(false)
    const off = () => setOffline(true)
    window.addEventListener('online', on)
    window.addEventListener('offline', off)
    return () => {
      window.removeEventListener('online', on)
      window.removeEventListener('offline', off)
    }
  }, [])
  if (!offline) return null
  return (
    <div className="fixed bottom-0 inset-x-0 z-[55] bg-ink-3 text-ivory-2 text-xs text-center py-2 border-t border-gold/30">
      You&rsquo;re offline. Showing saved pages. Applications and payments need a connection.
    </div>
  )
}
