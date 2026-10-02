import type { Site } from '../content/schema'
import type { Theme } from '../theme'

export default function About({
  about,
  education,
  t,
}: {
  about: Site['about']
  education: Site['education']
  t: Theme
}) {
  return (
    <section id="about" className="py-24" style={{ borderTop: `1px solid ${t.border}` }}>
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-[220px_1fr] gap-12 lg:gap-20">
        <div>
          <h2 className="text-xs font-medium tracking-widest uppercase" style={{ color: t.textFaint }}>About</h2>
        </div>
        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-4">
            <p className="text-xl leading-relaxed" style={{ color: t.textMuted }}>
              {about.lead}
            </p>
            {about.paragraphs?.map((paragraph, i) => (
              <p key={i} className="leading-relaxed" style={{ color: t.textMuted }}>
                {paragraph}
              </p>
            ))}
          </div>

          {education.length > 0 && (
            <div className="pt-10" style={{ borderTop: `1px solid ${t.border}` }}>
              <h3 className="text-xs font-medium tracking-widest uppercase mb-6" style={{ color: t.textFaint }}>Education</h3>
              <div className="flex flex-col">
                {education.map((edu) => (
                  <div
                    key={`${edu.degree}-${edu.institution}`}
                    className="py-5 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1"
                    style={{ borderBottom: `1px solid ${t.divider}` }}
                  >
                    <div>
                      <p className="text-sm" style={{ color: t.textMuted }}>{edu.degree}</p>
                      <p className="text-sm font-medium mt-0.5" style={{ color: t.text }}>{edu.institution}</p>
                    </div>
                    {edu.year && (
                      <span className="text-xs shrink-0" style={{ color: t.textFaint }}>{edu.year}</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
