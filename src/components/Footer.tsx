import type { Theme } from '../theme'

export default function Footer({ name, tagline, t }: { name: string; tagline?: string; t: Theme }) {
  const year = new Date().getFullYear()

  return (
    <footer className="py-8" style={{ borderTop: `1px solid ${t.border}` }}>
      <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <p className="text-xs" style={{ color: t.textFaint }}>© {year} {name}</p>
        {tagline && (
          <p className="text-xs" style={{ color: t.textFaint }}>{tagline}</p>
        )}
      </div>
    </footer>
  )
}
