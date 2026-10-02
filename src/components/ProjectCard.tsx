import { useState } from 'react'
import { assetUrl, linkLabelFor } from '../content'
import type { Project } from '../content/schema'
import { THEMES, type Theme } from '../theme'
import ProjectPlaceholder from './ProjectPlaceholder'

export default function ProjectCard({ project, t: tProp }: { project: Project; t: Theme }) {
  const t = tProp ?? THEMES[0]
  const [hovered, setHovered] = useState(false)
  const [imageFailed, setImageFailed] = useState(false)

  const label = linkLabelFor(project)
  const accessibleName = `${label} ${project.title}`
  const showImage = Boolean(project.thumbnail) && !imageFailed

  const media = (
    <div className="relative overflow-hidden aspect-video" style={{ background: t.muted }}>
      {showImage ? (
        <>
          <img
            loading="lazy"
            src={assetUrl(project.thumbnail!)}
            alt={project.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            onError={() => setImageFailed(true)}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </>
      ) : (
        <ProjectPlaceholder title={project.title} category={project.category} t={t} />
      )}
    </div>
  )

  return (
    <article
      className="group flex flex-col overflow-hidden transition-all duration-300"
      style={{
        background: t.surface,
        boxShadow: hovered
          ? `0 8px 32px rgba(0,0,0,${t.id === 'light' ? '0.10' : '0.30'})`
          : `0 1px 4px rgba(0,0,0,${t.id === 'light' ? '0.06' : '0.20'})`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {project.link ? (
        <a
          href={project.link}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={accessibleName}
          tabIndex={-1}
          className="block"
        >
          {media}
        </a>
      ) : (
        media
      )}
      <div className="flex flex-col flex-1 p-5 gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {project.client && (
            <p className="text-xs font-medium tracking-widest uppercase" style={{ color: t.textFaint }}>
              {project.client}
            </p>
          )}
          {project.tags?.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded-full"
              style={{ background: t.tagBg, color: t.tagText }}
            >
              {tag}
            </span>
          ))}
        </div>
        <h3
          className="text-lg leading-snug"
          style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 400, color: t.text }}
        >
          {project.title}
        </h3>
        <p className="text-sm leading-relaxed flex-1" style={{ color: t.textMuted }}>
          {project.description}
        </p>
        {project.role && (
          <p
            className="text-xs font-medium pt-2"
            style={{ color: t.textMuted, borderTop: `1px solid ${t.border}` }}
          >
            Role: {project.role}
          </p>
        )}
        {project.year && (
          <p className="text-xs" style={{ color: t.textFaint }}>{project.year}</p>
        )}
        {project.link && (
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={accessibleName}
            className="self-start inline-flex items-center gap-1 text-xs font-medium pt-2 transition-opacity hover:opacity-70"
            style={{ color: t.accent }}
          >
            {label}
            <span aria-hidden="true">↗</span>
          </a>
        )}
      </div>
    </article>
  )
}
