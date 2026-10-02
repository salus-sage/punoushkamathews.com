import type { Category } from '../content/categories'
import type { Theme } from '../theme'

// Typographic stand-in for a missing or failed thumbnail. Fills the card's fixed
// 16:9 container; the title is already rendered as text below, so this is
// hidden from assistive technology.
export default function ProjectPlaceholder({
  title,
  category,
  t,
}: {
  title: string
  category: Category
  t: Theme
}) {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 flex flex-col justify-between p-5"
      style={{ background: t.muted }}
    >
      <p className="text-xs font-medium tracking-widest uppercase" style={{ color: t.textFaint }}>
        {category}
      </p>
      <p
        className="leading-tight line-clamp-3"
        style={{
          fontFamily: 'Fraunces, Georgia, serif',
          fontWeight: 300,
          fontSize: 'clamp(1.25rem, 3vw, 2rem)',
          color: t.textMuted,
        }}
      >
        {title}
      </p>
    </div>
  )
}
