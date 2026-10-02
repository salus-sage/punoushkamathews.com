/**
 * migrate-content.ts
 *
 * ONE-SHOT migration script (TASK-002, FEAT-PORTFOLIO-001).
 *
 * Reads the `projects` and `education` array literals out of `src/App.tsx`, writes one JSON
 * file per real project to `content/projects/`, writes `content/site.json`, downloads each
 * Unsplash thumbnail into `public/media/<slug>.jpg`, and generates `public/media/placeholder.jpg`.
 *
 * It was run once to seed `content/` and `public/media/` and is kept in the repo for
 * reference only. It is idempotent: re-running overwrites the same files with the same
 * content. After TASK-004 removes the arrays from `src/App.tsx` this script will no longer
 * find anything to migrate and should not be run.
 *
 * Usage:  pnpm tsx scripts/migrate-content.ts
 */

import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import vm from 'node:vm'
import sharp from 'sharp'

// ─── Paths ────────────────────────────────────────────────────────────────────

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const APP_TSX = path.join(ROOT, 'src', 'App.tsx')
const CONTENT_DIR = path.join(ROOT, 'content')
const PROJECTS_DIR = path.join(CONTENT_DIR, 'projects')
const MEDIA_DIR = path.join(ROOT, 'public', 'media')
const PLACEHOLDER = '/media/placeholder.jpg'

// ─── Types (local to the script; the real schema arrives in TASK-003) ────────

interface SourceProject {
  category: string
  client?: string
  title: string
  description: string
  role?: string
  tags?: string[]
  thumbnail?: string
  year?: string
}

interface SourceEducation {
  degree: string
  year?: string
  institution: string
}

/** Fixed key order required by the acceptance criteria. */
const PROJECT_KEYS = [
  'title',
  'category',
  'client',
  'description',
  'role',
  'year',
  'link',
  'linkLabel',
  'thumbnail',
  'tags',
  'order',
] as const

type ProjectKey = (typeof PROJECT_KEYS)[number]
type OutputProject = Partial<Record<ProjectKey, unknown>>

// ─── Extract arrays from App.tsx ─────────────────────────────────────────────

/**
 * Slice the source of a top-level array literal that starts with `marker` and ends at the
 * first `]` sitting at column 0 (the arrays in App.tsx are formatted that way). The slice
 * is then evaluated in an isolated vm context. Comments inside the literal are fine for V8.
 */
function extractArray<T>(source: string, marker: string): T[] {
  const start = source.indexOf(marker)
  if (start === -1) throw new Error(`Could not find "${marker}" in src/App.tsx`)
  const arrayStart = start + marker.length - 1 // index of the opening "["
  const end = source.indexOf('\n]', arrayStart)
  if (end === -1) throw new Error(`Could not find the closing "]" for "${marker}"`)
  const literal = source.slice(arrayStart, end + 2)
  const result = vm.runInNewContext(`(${literal})`, Object.create(null), {
    filename: `App.tsx:${marker}`,
    timeout: 1000,
  })
  if (!Array.isArray(result)) throw new Error(`"${marker}" did not evaluate to an array`)
  return result as T[]
}

// ─── Slugs ───────────────────────────────────────────────────────────────────

function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // strip diacritics
    .replace(/['‘’#]/g, '') // apostrophes (straight and curly) and # removed
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

interface SlugResult {
  slug: string
  collision?: string
}

function assignSlug(project: SourceProject, taken: Set<string>): SlugResult {
  const base = slugify(project.title)
  if (!taken.has(base)) {
    taken.add(base)
    return { slug: base }
  }
  const clientSlug = project.client ? slugify(project.client) : ''
  const withClient = clientSlug ? `${base}-${clientSlug}` : base
  if (withClient !== base && !taken.has(withClient)) {
    taken.add(withClient)
    return { slug: withClient, collision: `"${project.title}" -> ${withClient} (client appended)` }
  }
  for (let n = 2; ; n++) {
    const candidate = `${withClient}-${n}`
    if (!taken.has(candidate)) {
      taken.add(candidate)
      return { slug: candidate, collision: `"${project.title}" -> ${candidate} (numeric suffix)` }
    }
  }
}

// ─── Thumbnails ──────────────────────────────────────────────────────────────

const UNSPLASH_HOST = 'images.unsplash.com'
const UNSPLASH_QUERY = 'w=1600&q=85&fit=crop&auto=format'

function unsplashDownloadUrl(thumbnail: string): string | null {
  let url: URL
  try {
    url = new URL(thumbnail)
  } catch {
    return null
  }
  if (url.hostname !== UNSPLASH_HOST) return null
  url.search = `?${UNSPLASH_QUERY}`
  return url.toString()
}

async function fetchImage(url: string): Promise<Buffer> {
  const res = await fetch(url, { redirect: 'follow', headers: { accept: 'image/jpeg,image/*' } })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const buf = Buffer.from(await res.arrayBuffer())
  if (buf.length < 1024) throw new Error(`response too small (${buf.length} bytes)`)
  return buf
}

async function downloadWithRetry(url: string, dest: string): Promise<void> {
  let lastError: unknown
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const buf = await fetchImage(url)
      await writeFile(dest, buf)
      return
    } catch (err) {
      lastError = err
      if (attempt === 1) await new Promise((r) => setTimeout(r, 1500))
    }
  }
  throw lastError
}

/** Run async jobs with a fixed concurrency limit. */
async function runPool<T>(items: T[], limit: number, worker: (item: T) => Promise<void>) {
  let next = 0
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const item = items[next++]
      await worker(item)
    }
  })
  await Promise.all(runners)
}

async function writePlaceholder(dest: string): Promise<void> {
  const buf = await sharp({
    create: { width: 1600, height: 900, channels: 3, background: '#EDE9E3' },
  })
    .jpeg({ quality: 80 })
    .toBuffer()
  await writeFile(dest, buf)
}

// ─── Site copy (prose scattered through JSX in App.tsx, copied verbatim) ─────

const site = {
  hero: {
    eyebrow: 'Filmmaker · Writer · Cyanotype Artist',
    firstName: 'Anoushka',
    lastName: 'Mathews',
    intro:
      'Bangalore-based documentary filmmaker with 12 years of directing, writing, and teaching across India.',
    portrait: PLACEHOLDER,
  },
  about: {
    lead: 'Anoushka Mathews is a Bangalore-based filmmaker, writer, and cyanotype artist who has grown up across the country.',
    paragraphs: [
      'Over the past 12 years, she has directed and edited both short and feature-length documentaries, and non-fiction films for multiple organisations and institutions.',
      'She has also written for multiple print and online publications, and has taught, mentored, and facilitated workshops for diverse audiences.',
    ],
  },
  education: [] as Array<{ degree: string; institution: string; year?: string }>,
  contact: {
    heading: "Let's work\ntogether.",
    phone: '+91-7042845737',
    email: 'anoushka.mathews@gmail.com',
    instagram: 'punoushka',
  },
  work: {
    cyanotypeIntro:
      'Samples of original cyanotype prints — a photographic process using UV light and iron-based chemistry to produce Prussian blue images on paper.',
  },
  footer: {
    tagline: 'Filmmaker · Writer · Cyanotype Artist · Bangalore',
  },
  meta: {
    title: 'Anoushka Mathews',
    description:
      'Portfolio of Anoushka Mathews, a Bangalore-based documentary filmmaker, writer and cyanotype artist, showcasing films, series, news features, writing, exhibitions, workshops and cyanotype prints.',
  },
}

// ─── Main ────────────────────────────────────────────────────────────────────

function toJson(value: unknown): string {
  return JSON.stringify(value, null, 2) + '\n'
}

function isEmpty(value: unknown): boolean {
  if (value === undefined || value === null) return true
  if (typeof value === 'string') return value.trim() === ''
  if (Array.isArray(value)) return value.length === 0
  return false
}

async function main() {
  const source = await readFile(APP_TSX, 'utf8')
  const projects = extractArray<SourceProject>(source, 'const projects: Project[] = [')
  const education = extractArray<SourceEducation>(source, 'const education = [')

  await mkdir(PROJECTS_DIR, { recursive: true })
  await mkdir(MEDIA_DIR, { recursive: true })

  // Placeholder image
  await writePlaceholder(path.join(MEDIA_DIR, 'placeholder.jpg'))

  const real = projects.filter((p) => p.title !== 'Coming Soon')
  const skippedSentinels = projects.length - real.length

  // Slugs
  const taken = new Set<string>()
  const collisions: string[] = []
  const entries = real.map((project) => {
    const { slug, collision } = assignSlug(project, taken)
    if (collision) collisions.push(collision)
    return { project, slug }
  })

  // Downloads
  type Job = { slug: string; url: string }
  const jobs: Job[] = []
  const thumbnails = new Map<string, string | undefined>() // slug -> final thumbnail value
  let placeholderCount = 0

  for (const { project, slug } of entries) {
    const thumb = project.thumbnail
    if (!thumb) {
      thumbnails.set(slug, undefined)
      continue
    }
    const url = unsplashDownloadUrl(thumb)
    if (url) {
      jobs.push({ slug, url })
    } else if (thumb.startsWith('/')) {
      // Local path that does not exist in the repo: use the shared placeholder.
      const local = path.join(ROOT, 'public', thumb)
      thumbnails.set(slug, existsSync(local) ? thumb : PLACEHOLDER)
      if (!existsSync(local)) placeholderCount++
    } else {
      console.warn(`  ! Unexpected thumbnail for "${project.title}": ${thumb} (dropped)`)
      thumbnails.set(slug, undefined)
    }
  }

  const failed: Array<{ slug: string; url: string; error: string }> = []
  let ok = 0
  await runPool(jobs, 4, async ({ slug, url }) => {
    const dest = path.join(MEDIA_DIR, `${slug}.jpg`)
    try {
      await downloadWithRetry(url, dest)
      thumbnails.set(slug, `/media/${slug}.jpg`)
      ok++
      console.log(`  ✓ ${slug}.jpg`)
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      failed.push({ slug, url, error: message })
      thumbnails.set(slug, undefined)
      console.warn(`  ✗ ${slug}.jpg  (${message})`)
    }
  })

  // Project files
  let written = 0
  for (const { project, slug } of entries) {
    const raw: OutputProject = {
      title: project.title,
      category: project.category,
      client: project.client,
      description: project.description,
      role: project.role,
      year: project.year,
      link: undefined,
      linkLabel: undefined,
      thumbnail: thumbnails.get(slug),
      tags: project.tags,
      order: undefined,
    }
    const out: OutputProject = {}
    for (const key of PROJECT_KEYS) {
      if (!isEmpty(raw[key])) out[key] = raw[key]
    }
    await writeFile(path.join(PROJECTS_DIR, `${slug}.json`), toJson(out))
    written++
  }

  // site.json
  site.education = education.map((e) => ({
    degree: e.degree,
    institution: e.institution,
    ...(e.year ? { year: e.year } : {}),
  }))
  await writeFile(path.join(CONTENT_DIR, 'site.json'), toJson(site))

  // Summary
  const byCategory = new Map<string, number>()
  for (const { project } of entries) {
    byCategory.set(project.category, (byCategory.get(project.category) ?? 0) + 1)
  }

  console.log('')
  console.log('Migration summary')
  console.log('─────────────────')
  console.log(`Projects found in App.tsx:   ${projects.length}`)
  console.log(`"Coming Soon" sentinels:     ${skippedSentinels} (skipped)`)
  console.log(`Project files written:       ${written}  -> content/projects/`)
  console.log(`Slug collisions resolved:    ${collisions.length}`)
  for (const c of collisions) console.log(`  - ${c}`)
  console.log(`Unsplash downloads:          ${ok} ok, ${failed.length} failed`)
  for (const f of failed) console.log(`  - ${f.slug}: ${f.error}  (${f.url})`)
  console.log(`Placeholder thumbnails:      ${placeholderCount} (missing local images)`)
  console.log(`Thumbnail omitted:           ${entries.filter(({ slug }) => !thumbnails.get(slug)).length}`)
  console.log(`Education entries:           ${site.education.length}`)
  console.log(`Media files:                 ${ok + 1} (${ok} downloads + placeholder.jpg) -> public/media/`)
  console.log('Projects per category:')
  for (const [category, count] of byCategory) console.log(`  ${String(count).padStart(3)}  ${category}`)
  console.log('site.json written            -> content/site.json')

  if (failed.length > 0) {
    console.log('')
    console.log(
      `WARNING: ${failed.length} thumbnail download(s) failed. Those projects were written without a ` +
        '"thumbnail" key and will render the typographic placeholder until the owner uploads an image.',
    )
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
