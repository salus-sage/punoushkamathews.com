import type { Category } from '../content/categories'
import type { Project } from '../content/schema'
import type { Theme } from '../theme'
import CategoryBar from './CategoryBar'
import CyanotypeGallery from './CyanotypeGallery'
import ProjectCard from './ProjectCard'

export default function Work({
  projects,
  visible,
  writingTags,
  activeCategory,
  onCategoryChange,
  writingFilter,
  onWritingFilterChange,
  cyanotypeIntro,
  t,
}: {
  /** Every project, used for the per-category counts in the bar. */
  projects: Project[]
  /** Projects in the active category, already sorted. */
  visible: Project[]
  /** Distinct tags found on Writing projects, first-seen order. */
  writingTags: string[]
  activeCategory: Category
  onCategoryChange: (c: Category) => void
  writingFilter: string | null
  onWritingFilterChange: (tag: string | null) => void
  cyanotypeIntro?: string
  t: Theme
}) {
  const filtered = visible.filter((p) => {
    if (activeCategory === 'Writing' && writingFilter) return p.tags?.includes(writingFilter)
    return true
  })

  return (
    <section id="work" className="py-24" style={{ borderTop: `1px solid ${t.border}` }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-10">
          <p className="text-xs font-medium tracking-widest uppercase mb-3" style={{ color: t.textFaint }}>
            Selected Work
          </p>
          <h2
            className="text-4xl sm:text-5xl"
            style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 300, color: t.text }}
          >
            Portfolio
          </h2>
        </div>

        {/* Category filter */}
        <div className="mb-10 pb-0" style={{ borderBottom: `1px solid ${t.border}` }}>
          <CategoryBar active={activeCategory} onChange={onCategoryChange} projects={projects} t={t} />
        </div>

        {/* Writing sub-filter */}
        {activeCategory === 'Writing' && writingTags.length > 0 && (
          <div className="flex gap-2 mb-8">
            {[null, ...writingTags].map((tag) => (
              <button
                key={String(tag)}
                onClick={() => onWritingFilterChange(tag)}
                className="px-4 py-1.5 text-xs font-medium transition-all duration-150 rounded-full"
                style={{
                  background: writingFilter === tag ? t.accent : t.muted,
                  color: writingFilter === tag ? t.accentFg : t.textMuted,
                }}
              >
                {tag ?? 'All'}
              </button>
            ))}
          </div>
        )}

        {visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
            <p
              className="text-3xl"
              style={{ fontFamily: 'Fraunces, Georgia, serif', fontStyle: 'italic', color: t.textFaint }}
            >
              Coming soon
            </p>
            <p className="text-sm max-w-xs" style={{ color: t.textFaint }}>
              {activeCategory} work will be added here shortly.
            </p>
          </div>
        ) : activeCategory === 'Cyanotypes' ? (
          <CyanotypeGallery projects={visible} intro={cyanotypeIntro} t={t} />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p) => (
              <ProjectCard key={p.slug} project={p} t={t} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
