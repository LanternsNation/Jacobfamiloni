import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Wordmark } from './Placeholder'
import { site } from '../lib/content'

const nav = [
  { to: '/story', label: 'His Story' },
  { to: '/initiatives', label: 'Initiatives' },
  { to: '/impact', label: 'Impact & Gallery' },
  { to: '/media', label: 'Media' },
  { to: '/get-involved', label: 'Get Involved' },
]

export function Layout() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { pathname } = useLocation()

  useEffect(() => {
    setOpen(false)
    window.scrollTo(0, 0)
  }, [pathname])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="min-h-dvh flex flex-col">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 btn-gold">
        Skip to content
      </a>
      <header
        className={`fixed inset-x-0 top-0 z-40 transition-colors duration-500 ${
          scrolled || open ? 'bg-ink/92 backdrop-blur-md border-b border-white/5' : 'bg-transparent'
        }`}
      >
        <div className="container-x flex h-16 items-center justify-between">
          <Link to="/" aria-label="Home">
            <Wordmark />
          </Link>
          <nav className="hidden lg:flex items-center gap-8 text-sm text-ivory-2">
            {nav.map((n) => (
              <NavLink key={n.to} to={n.to} className={({ isActive }) => (isActive ? 'text-gold' : 'hover:text-ivory')}>
                {n.label}
              </NavLink>
            ))}
            <Link to="/support" className="btn-gold !min-h-10 !px-5 text-sm">
              Sponsor a Seat
            </Link>
          </nav>
          <button
            className="lg:hidden -mr-2 p-2 text-ivory"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            <span className="block w-6 h-px bg-current mb-1.5 transition" style={{ transform: open ? 'translateY(3.5px) rotate(45deg)' : '' }} />
            <span className="block w-6 h-px bg-current transition" style={{ transform: open ? 'translateY(-3.5px) rotate(-45deg)' : '' }} />
          </button>
        </div>
        <AnimatePresence>
          {open && (
            <motion.nav
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35 }}
              className="lg:hidden overflow-hidden border-t border-white/5"
            >
              <div className="container-x py-6 flex flex-col gap-5">
                {nav.map((n) => (
                  <NavLink key={n.to} to={n.to} className="font-display text-3xl">
                    {n.label}
                  </NavLink>
                ))}
                <div className="flex gap-3 pt-3">
                  <Link to="/apply" className="btn-ghost flex-1">Apply</Link>
                  <Link to="/support" className="btn-gold flex-1">Sponsor</Link>
                </div>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </header>

      <main id="main" className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  )
}

function Footer() {
  return (
    <footer className="grain bg-ink border-t border-white/5">
      <div className="container-x py-16 grid gap-12 md:grid-cols-3 relative z-[2]">
        <div>
          <Wordmark className="text-2xl" />
          <p className="mt-4 text-sm text-muted max-w-xs">{site.legacyStatement}</p>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm text-ivory-2">
          <Link to="/story">His Story</Link>
          <Link to="/initiatives">Initiatives</Link>
          <Link to="/apply">Apply to the AI School</Link>
          <Link to="/support">Sponsor a Seat</Link>
          <Link to="/impact">Impact & Gallery</Link>
          <Link to="/media">Media</Link>
          <Link to="/get-involved">Get Involved</Link>
          <Link to="/privacy">Privacy Policy</Link>
        </div>
        <div className="text-xs text-muted leading-relaxed">
          <p>
            All support received through this platform funds Dr. Familoni&rsquo;s initiatives in Nigeria only.
          </p>
          <p className="mt-3">
            {/* PLACEHOLDER: registered entity name and CAC number once the receiving entity is set up */}
            Payments are received by [PLACEHOLDER — registered entity name, CAC RC number].
          </p>
          <p className="mt-6">&copy; {new Date().getFullYear()} Dr. Jacob Familoni</p>
        </div>
      </div>
    </footer>
  )
}
