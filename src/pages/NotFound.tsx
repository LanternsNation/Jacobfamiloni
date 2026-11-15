import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <section className="grain min-h-[80vh] grid place-items-center text-center px-6 pt-24">
      <div className="relative z-[2]">
        <p className="eyebrow">404</p>
        <h1 className="text-5xl md:text-7xl mt-5">This page isn&rsquo;t here.</h1>
        <Link to="/" className="btn-gold mt-10">Back home</Link>
      </div>
    </section>
  )
}
