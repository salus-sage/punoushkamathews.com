import type { Site } from '../content/schema'
import type { Theme } from '../theme'

interface ContactRow {
  label: string
  value: string
  href: string
}

export default function Contact({ contact, t }: { contact: Site['contact']; t: Theme }) {
  const [headingFirst, ...headingRest] = (contact.heading ?? '').split('\n')
  const headingSecond = headingRest.join(' ')

  const rows: ContactRow[] = []
  if (contact.phone) {
    rows.push({ label: 'Phone', value: contact.phone, href: `tel:${contact.phone.trim().startsWith('+') ? '+' : ''}${contact.phone.replace(/\D/g, '')}` })
  }
  if (contact.email) {
    rows.push({ label: 'Email', value: contact.email, href: `mailto:${contact.email}` })
  }
  if (contact.instagram) {
    rows.push({
      label: 'Instagram',
      value: `@${contact.instagram}`,
      href: `https://instagram.com/${contact.instagram}`,
    })
  }

  return (
    <section id="contact" className="py-24" style={{ borderTop: `1px solid ${t.border}` }}>
      <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-[220px_1fr] gap-12 lg:gap-20">
        <div>
          <h2 className="text-xs font-medium tracking-widest uppercase" style={{ color: t.textFaint }}>Contact</h2>
        </div>
        <div className="flex flex-col gap-8">
          {contact.heading && (
            <p
              className="text-3xl sm:text-4xl leading-snug"
              style={{ fontFamily: 'Fraunces, Georgia, serif', fontWeight: 300, color: t.text }}
            >
              {headingFirst}
              {headingSecond && (
                <>
                  <br />
                  <span style={{ fontStyle: 'italic' }}>{headingSecond}</span>
                </>
              )}
            </p>
          )}
          <div className="flex flex-col">
            {rows.map(({ label, value, href }) => (
              <a
                key={label}
                href={href}
                target={href.startsWith('http') ? '_blank' : undefined}
                rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                className="group flex items-center gap-4 py-4 transition-colors"
                style={{ borderBottom: `1px solid ${t.border}` }}
              >
                <span
                  className="text-xs font-medium tracking-widest uppercase w-20 shrink-0"
                  style={{ color: t.textFaint }}
                >
                  {label}
                </span>
                <span className="text-sm transition-colors" style={{ color: t.textMuted }}>
                  {value}
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
