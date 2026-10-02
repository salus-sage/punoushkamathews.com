import React, { useRef, useEffect } from 'react'
import { CATEGORIES, type Category } from '../content/categories'
import type { Project } from '../content/schema'
import { THEMES, type Theme } from '../theme'

export default function CategoryBar({
  active,
  onChange,
  projects,
  t: tProp,
}: {
  active: Category
  onChange: (c: Category) => void
  projects: Project[]
  t: Theme
}) {
  const t = tProp ?? THEMES[0]
  const scrollRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const el = activeRef.current
      const container = scrollRef.current
      container.scrollTo({
        left: el.offsetLeft - container.offsetWidth / 2 + el.offsetWidth / 2,
        behavior: 'smooth',
      })
    }
  }, [active])

  return (
    <div
      ref={scrollRef}
      className="flex gap-1 overflow-x-auto pb-0.5"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' } as React.CSSProperties}
    >
      {CATEGORIES.map((cat) => {
        const isActive = cat === active
        const count = projects.filter((p) => p.category === cat).length
        return (
          <button
            key={cat}
            ref={isActive ? activeRef : undefined}
            onClick={() => onChange(cat)}
            aria-pressed={isActive}
            className="shrink-0 flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-all duration-200 whitespace-nowrap"
            style={{
              background: isActive ? t.accent : 'transparent',
              color: isActive ? t.accentFg : t.textFaint,
              border: isActive ? `1px solid ${t.accent}` : `1px solid transparent`,
            }}
          >
            {cat}
            {count > 0 && (
              <span
                className="text-xs px-1.5 py-0.5 rounded-full"
                style={{
                  background: isActive ? 'rgba(255,255,255,0.2)' : t.tagBg,
                  color: isActive ? t.accentFg : t.tagText,
                }}
              >
                {count}
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
