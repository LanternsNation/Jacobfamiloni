import { useEffect, useState, type FormEvent } from 'react'
import { NavLink, Route, Routes, Navigate, Link } from 'react-router-dom'
import type { Session } from '@supabase/supabase-js'
import { supabase, supabaseConfigured } from '../lib/supabase'
import { Wordmark } from '../components/Placeholder'
import Overview from './Overview'
import Applicants from './Applicants'
import Payments from './Payments'
import Sponsorships from './Sponsorships'
import Requests from './Requests'
import InitiativesAdmin from './InitiativesAdmin'
import GalleryAdmin from './GalleryAdmin'
import SettingsAdmin from './SettingsAdmin'

const tabs = [
  ['', 'Overview'],
  ['applicants', 'Applicants'],
  ['payments', 'Payments'],
  ['sponsorships', 'Sponsorships'],
  ['requests', 'Get Involved'],
  ['initiatives', 'Initiatives'],
  ['gallery', 'Gallery'],
  ['settings', 'Settings & cohorts'],
] as const

export default function Admin() {
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)

  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)
    supabase.auth.getSession().then(({ data }) => setSession(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s))
    return () => {
      sub.subscription.unsubscribe()
      meta.remove()
    }
  }, [])

  useEffect(() => {
    if (!session) {
      setIsAdmin(null)
      return
    }
    supabase.rpc('is_admin').then(({ data }) => setIsAdmin(Boolean(data)))
  }, [session])

  if (!supabaseConfigured) return <Shell><p className="text-muted">Supabase is not configured (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).</p></Shell>
  if (session === undefined || (session && isAdmin === null)) return <Shell><p className="text-muted">Loading…</p></Shell>
  if (!session) return <Login />
  if (!isAdmin)
    return (
      <Shell>
        <p>This account ({session.user.email}) does not have admin access.</p>
        <button className="btn-ghost mt-6" onClick={() => supabase.auth.signOut()}>Sign out</button>
      </Shell>
    )

  return (
    <div className="min-h-dvh bg-ink text-ivory">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-ink/95 backdrop-blur">
        <div className="flex items-center justify-between px-4 h-14">
          <Link to="/admin" className="flex items-baseline gap-2"><Wordmark /><span className="text-xs text-muted">Admin</span></Link>
          <div className="flex items-center gap-3 text-xs text-muted">
            <span className="hidden sm:inline">{session.user.email}</span>
            <Link to="/" className="hover:text-gold">View site</Link>
            <button className="hover:text-gold" onClick={() => supabase.auth.signOut()}>Sign out</button>
          </div>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-2 [scrollbar-width:none]">
          {tabs.map(([to, label]) => (
            <NavLink
              key={to}
              to={`/admin/${to}`}
              end={to === ''}
              className={({ isActive }) => `whitespace-nowrap rounded-full px-3 py-1.5 text-sm ${isActive ? 'bg-gold text-ink' : 'text-ivory-2 hover:bg-white/5'}`}
            >
              {label}
            </NavLink>
          ))}
        </nav>
      </header>
      <main className="mx-auto max-w-7xl p-4 md:p-6">
        <Routes>
          <Route index element={<Overview />} />
          <Route path="applicants" element={<Applicants />} />
          <Route path="payments" element={<Payments />} />
          <Route path="sponsorships" element={<Sponsorships />} />
          <Route path="requests" element={<Requests />} />
          <Route path="initiatives" element={<InitiativesAdmin />} />
          <Route path="gallery" element={<GalleryAdmin />} />
          <Route path="settings" element={<SettingsAdmin />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </main>
    </div>
  )
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh grid place-items-center bg-ink px-6">
      <div className="w-full max-w-sm">
        <Wordmark className="text-2xl" />
        <div className="mt-8">{children}</div>
      </div>
    </div>
  )
}

function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setErr(null)
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (error) setErr('Sign-in failed. Check your email and password.')
    setBusy(false)
  }
  return (
    <Shell>
      <form onSubmit={submit} className="space-y-4">
        <p className="eyebrow">Admin sign in</p>
        <input className="field" type="email" autoComplete="username" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="field" type="password" autoComplete="current-password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
        {err && <p className="text-sm text-red-300">{err}</p>}
        <button className="btn-gold w-full" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </Shell>
  )
}
