import { useEffect, useState } from 'react'
import { site, projects, projectsIn, tagsIn, type Category } from './content'
import { THEMES, type Theme } from './theme'
import Nav from './components/Nav'
import Hero from './components/Hero'
import Work from './components/Work'
import About from './components/About'
import Contact from './components/Contact'
import Footer from './components/Footer'

const THEME_STORAGE_KEY = 'theme'

// A stored choice wins; otherwise mobile follows the OS preference and desktop
// defaults to dark.
function initialTheme(): Theme {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    const match = THEMES.find((theme) => theme.id === stored)
    if (match) return match
  } catch {
    // localStorage unavailable (private mode, blocked storage): fall through
  }
  const isMobile = window.matchMedia('(max-width: 768px)').matches
  if (isMobile) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    return prefersDark ? THEMES[1] : THEMES[0]
  }
  return THEMES[1] // dark by default on desktop
}

export default function App() {
  const [activeCategory, setActiveCategory] = useState<Category>('Films')
  const [writingFilter, setWritingFilter] = useState<string | null>(null)
  const [theme, setTheme] = useState<Theme>(initialTheme)

  useEffect(() => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme.id)
    } catch {
      // ignore: persistence is a convenience, not a requirement
    }
  }, [theme])

  const t = theme
  const fullName = `${site.hero.firstName} ${site.hero.lastName}`

  return (
    <div
      className="min-h-screen transition-colors duration-500"
      style={{ background: t.bg, color: t.text }}
    >
      <Nav name={fullName} t={t} onThemeChange={setTheme} />
      <Hero hero={site.hero} t={t} />
      <Work
        projects={projects}
        visible={projectsIn(activeCategory)}
        writingTags={tagsIn('Writing')}
        activeCategory={activeCategory}
        onCategoryChange={(c) => {
          setActiveCategory(c)
          setWritingFilter(null)
        }}
        writingFilter={writingFilter}
        onWritingFilterChange={setWritingFilter}
        cyanotypeIntro={site.work.cyanotypeIntro}
        t={t}
      />
      <About about={site.about} education={site.education} t={t} />
      <Contact contact={site.contact} t={t} />
      <Footer name={fullName} tagline={site.footer.tagline} t={t} />
    </div>
  )
}
