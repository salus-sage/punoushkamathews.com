import { assetUrl } from '../content'
import type { Site } from '../content/schema'
import type { Theme } from '../theme'

export default function Hero({ hero, t }: { hero: Site['hero']; t: Theme }) {
  const fullName = `${hero.firstName} ${hero.lastName}`

  return (
    <section className="pt-14">
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-2 min-h-[88vh] items-center gap-12 py-20">
        <div className="flex flex-col gap-6 order-2 md:order-1">
          {hero.eyebrow && (
            <p className="text-xs font-medium tracking-widest uppercase" style={{ color: t.textFaint }}>
              {hero.eyebrow}
            </p>
          )}
          <h1
            className="text-6xl sm:text-7xl lg:text-8xl leading-none"
            style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 300, color: t.text }}
          >
            {hero.firstName}
            <br />
            <span style={{ fontStyle: 'italic' }}>{hero.lastName}</span>
          </h1>
          {hero.intro && (
            <p className="text-lg leading-relaxed max-w-sm" style={{ color: t.textMuted }}>
              {hero.intro}
            </p>
          )}
          <div className="flex gap-4 pt-2">
            <a
              href="#work"
              className="px-6 py-3 text-sm font-medium transition-colors"
              style={{ background: t.accent, color: t.accentFg }}
            >
              View Work
            </a>
            <a
              href="#contact"
              className="px-6 py-3 text-sm font-medium transition-colors"
              style={{ color: t.textMuted, border: `1px solid ${t.border}` }}
            >
              Get in Touch
            </a>
          </div>
        </div>
        <div className="order-1 md:order-2 flex justify-center md:justify-end">
          <div
            className="relative overflow-hidden"
            style={
              hero.portrait
                ? { width: 'min(420px, 100%)', aspectRatio: '3/4' }
                : { width: 'min(420px, 100%)', aspectRatio: '3/4', background: t.muted }
            }
          >
            {hero.portrait && (
              <img
                src={assetUrl(hero.portrait)}
                alt={fullName}
                fetchPriority="high"
                className="w-full h-full object-cover"
              />
            )}
            {t.id === 'dark' && (
              <div className="absolute inset-0 mix-blend-multiply" style={{ background: 'rgba(20,18,16,0.15)' }} />
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
