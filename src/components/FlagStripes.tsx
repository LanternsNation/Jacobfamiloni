import { useReducedMotion } from 'framer-motion'

/**
 * USA theme: animated red-and-white stripes with a navy star field,
 * used as a background texture behind the hero portrait. Thirteen stripes sweep in and out
 * in a staggered wave; pure CSS transforms, cheap on mid-range phones.
 */
export function FlagStripes() {
  const reduce = useReducedMotion()
  const stripes = Array.from({ length: 13 }, (_, i) => i)
  return (
    <div
      aria-hidden
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{
        WebkitMaskImage: 'radial-gradient(120% 90% at 55% 40%, #000 30%, transparent 85%)',
        maskImage: 'radial-gradient(120% 90% at 55% 40%, #000 30%, transparent 85%)',
      }}
    >
      <div className={`absolute inset-[-4%] flex flex-col ${reduce ? '' : 'flag-wave'}`}>
        {stripes.map((i) => (
          <div key={i} className="relative flex-1 overflow-hidden">
            <div
              className={`absolute inset-0 ${i % 2 === 0 ? 'bg-[#B22234]' : 'bg-[#F5F1E8]'} ${reduce ? '' : 'flag-stripe'}`}
              style={{
                opacity: i % 2 === 0 ? 0.32 : 0.1,
                animationDelay: `${i * 0.22}s`,
              }}
            />
          </div>
        ))}
      </div>
      {/* Navy canton with a soft star field */}
      <div
        className={`absolute left-0 top-0 h-[54%] w-[42%] ${reduce ? '' : 'flag-canton'}`}
        style={{
          background:
            'radial-gradient(circle, rgba(245,241,232,0.55) 0 1.4px, transparent 1.8px) 0 0 / 34px 30px, radial-gradient(circle, rgba(245,241,232,0.55) 0 1.4px, transparent 1.8px) 17px 15px / 34px 30px, #2A2A5E',
          opacity: 0.55,
        }}
      />
    </div>
  )
}
