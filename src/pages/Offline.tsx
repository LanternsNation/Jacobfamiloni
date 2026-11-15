import { Link } from 'react-router-dom'

/** Offline fallback: shown when a page needs data that isn't saved on this device yet. */
export default function Offline() {
  return (
    <section className="grain min-h-[80vh] grid place-items-center text-center px-6 pt-24">
      <div className="relative z-[2] max-w-md">
        <p className="eyebrow">No connection</p>
        <h1 className="text-5xl mt-5">You&rsquo;re offline.</h1>
        <p className="mt-5 text-ivory-2">
          His story and the pages you have already opened are saved on this device. Applying and sponsoring need a connection. We&rsquo;ll be right here when you&rsquo;re back.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link to="/" className="btn-ghost">Home</Link>
          <Link to="/story" className="btn-ghost">His Story</Link>
          <button className="btn-gold" onClick={() => window.location.reload()}>Try again</button>
        </div>
      </div>
    </section>
  )
}
