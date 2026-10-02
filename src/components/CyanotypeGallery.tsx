import { assetUrl } from '../content'
import type { Project } from '../content/schema'
import type { Theme } from '../theme'

// Masonry image gallery for the Cyanotypes tab. Projects without a thumbnail
// are skipped: a gallery of placeholders has no value.
export default function CyanotypeGallery({
  projects,
  intro,
  t,
}: {
  projects: Project[]
  intro?: string
  t: Theme
}) {
  const withImages = projects.filter(
    (p): p is Project & { thumbnail: string } => Boolean(p.thumbnail),
  )

  return (
    <div>
      {intro && (
        <p className="text-sm mb-8 max-w-lg" style={{ color: t.textFaint }}>
          {intro}
        </p>
      )}
      <div className="columns-2 sm:columns-3 lg:columns-4 gap-4 space-y-4">
        {withImages.map((p) => (
          <div key={p.slug} className="break-inside-avoid overflow-hidden group" style={{ background: t.muted }}>
            <img
              loading="lazy"
              src={assetUrl(p.thumbnail)}
              alt={p.title}
              className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
