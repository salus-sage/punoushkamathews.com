import { THEMES, type Theme } from '../theme'

export default function ThemeSwitcher({ current, onChange }: { current: Theme; onChange: (t: Theme) => void }) {
  return (
    <div className="flex items-center gap-2">
      {THEMES.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t)}
          title={t.label}
          className="relative transition-transform duration-150 hover:scale-110"
          style={{
            width: 18,
            height: 18,
            borderRadius: '50%',
            background: t.swatch,
            border: current.id === t.id
              ? `2px solid ${current.accent}`
              : `2px solid ${current.border}`,
            boxShadow: current.id === t.id ? `0 0 0 2px ${current.bg}` : 'none',
          }}
          aria-label={`Switch to ${t.label} theme`}
        />
      ))}
    </div>
  )
}
