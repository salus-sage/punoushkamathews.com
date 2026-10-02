import { useState } from 'react'
import type { Theme } from '../theme'
import ThemeSwitcher from './ThemeSwitcher'

export default function Nav({
  name,
  t,
  onThemeChange,
}: {
  name: string
  t: Theme
  onThemeChange: (theme: Theme) => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-colors duration-500"
      style={{ background: t.navBg, borderBottom: `1px solid ${t.border}`, backdropFilter: 'blur(8px)' }}
    >
      <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between gap-6">
        <a
          href="#"
          className="text-sm font-medium shrink-0"
          style={{ letterSpacing: '0.12em', textTransform: 'uppercase', color: t.text }}
        >
          {name}
        </a>

        {/* Desktop links + switcher */}
        <div className="hidden md:flex items-center gap-8 text-sm" style={{ color: t.textMuted }}>
          <a href="#work" className="transition-colors" style={{ color: t.textMuted }}>Work</a>
          <a href="#about" className="transition-colors hover:opacity-100" style={{ color: t.textMuted }}>About</a>
          <a href="#contact" className="transition-colors" style={{ color: t.textMuted }}>Contact</a>
          <ThemeSwitcher current={t} onChange={onThemeChange} />
        </div>

        {/* Mobile: switcher + hamburger */}
        <div className="md:hidden flex items-center gap-3">
          <ThemeSwitcher current={t} onChange={onThemeChange} />
          <button
            className="p-1 transition-colors"
            style={{ color: t.textMuted }}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
              {menuOpen ? (
                <path d="M4 4l14 14M18 4L4 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              ) : (
                <>
                  <line x1="3" y1="7" x2="19" y2="7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="3" y1="13" x2="19" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div
          className="md:hidden px-6 py-4 flex flex-col gap-4 text-sm"
          style={{ borderTop: `1px solid ${t.border}`, background: t.surface, color: t.textMuted }}
        >
          <a href="#work" onClick={() => setMenuOpen(false)}>Work</a>
          <a href="#about" onClick={() => setMenuOpen(false)}>About</a>
          <a href="#contact" onClick={() => setMenuOpen(false)}>Contact</a>
        </div>
      )}
    </nav>
  )
}
