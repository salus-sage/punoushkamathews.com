// Validates everything under content/ against the shared zod schemas and checks
// that referenced media exists under public/. Run with `pnpm validate:content`.
// Exit code 1 when any ERROR is reported; warnings never fail the run.

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import path from "node:path"
import {
  ProjectSchema,
  SiteSchema,
  formatIssues,
  type Project,
} from "../src/content/schema.ts"

const root = path.resolve(import.meta.dirname, "..")
const projectsDir = path.join(root, "content", "projects")
const siteFile = path.join(root, "content", "site.json")
const publicDir = path.join(root, "public")

const FILENAME_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*\.json$/

interface ValidProject {
  file: string
  project: Project
}

let errors = 0
let warnings = 0

function rel(file: string): string {
  return path.relative(root, file).split(path.sep).join("/")
}

function error(file: string, message: string): void {
  errors += 1
  console.log(`ERROR ${rel(file)}: ${message}`)
}

function warn(file: string, message: string): void {
  warnings += 1
  console.log(`WARN ${rel(file)}: ${message}`)
}

function readJson(file: string): unknown | undefined {
  try {
    return JSON.parse(readFileSync(file, "utf8"))
  } catch (err) {
    error(file, `not valid JSON (${(err as Error).message})`)
    return undefined
  }
}

/** '/media/<file>' resolves to 'public/media/<file>'. Returns false when the file is missing. */
function mediaExists(mediaPath: string): boolean {
  const resolved = path.resolve(
    publicDir,
    ...mediaPath.replace(/^\//, "").split("/"),
  )
  if (!resolved.startsWith(path.join(publicDir, "media") + path.sep))
    return false
  return existsSync(resolved) && statSync(resolved).isFile()
}

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value)
    return url.protocol === "http:" || url.protocol === "https:"
  } catch {
    return false
  }
}

// --- site.json ---------------------------------------------------------------

const siteRaw = readJson(siteFile)
if (siteRaw !== undefined) {
  const parsed = SiteSchema.safeParse(siteRaw)
  if (!parsed.success) {
    for (const line of formatIssues(parsed.error)) error(siteFile, line)
  } else if (
    parsed.data.hero.portrait &&
    !mediaExists(parsed.data.hero.portrait)
  ) {
    error(
      siteFile,
      `hero.portrait file does not exist: ${parsed.data.hero.portrait}`,
    )
  }
}

// --- content/projects/*.json -------------------------------------------------

const files = existsSync(projectsDir)
  ? readdirSync(projectsDir)
      .filter((name) => name.endsWith(".json"))
      .sort()
  : []

const valid: ValidProject[] = []
let withoutThumbnail = 0

for (const name of files) {
  const file = path.join(projectsDir, name)

  if (!FILENAME_PATTERN.test(name)) {
    error(
      file,
      "filename must be lowercase letters, digits and single hyphens, e.g. my-project.json",
    )
  }

  const raw = readJson(file)
  if (raw === undefined) continue

  const parsed = ProjectSchema.safeParse(raw)
  if (!parsed.success) {
    for (const line of formatIssues(parsed.error)) error(file, line)
    continue
  }

  const project = parsed.data
  valid.push({
    file,
    project: { ...project, slug: name.replace(/\.json$/, "") },
  })

  if (project.thumbnail === undefined) {
    withoutThumbnail += 1
    warn(file, "no thumbnail set")
  } else if (!mediaExists(project.thumbnail)) {
    error(file, `thumbnail file does not exist: ${project.thumbnail}`)
  }

  // The schema already restricts link to http(s); this keeps rule 5 explicit
  // should the schema ever loosen.
  if (project.link !== undefined && !isHttpUrl(project.link)) {
    error(file, `link must be an absolute http or https URL: ${project.link}`)
  }
}

// Duplicate titles within one category. Pages CMS derives the filename from the
// title, so a duplicate would try to overwrite an existing file.
const seenTitles = new Map<string, string>()
for (const { file, project } of valid) {
  const key = `${project.category}\u0000${project.title.trim().toLowerCase()}`
  const first = seenTitles.get(key)
  if (first) {
    warn(
      file,
      `duplicate title "${project.title}" in ${project.category} (also in ${rel(first)})`,
    )
  } else {
    seenTitles.set(key, file)
  }
}

console.log(
  `${files.length} projects, ${errors} errors, ${warnings} warnings, ${withoutThumbnail} without thumbnail`,
)
process.exit(errors > 0 ? 1 : 0)
