import siteJson from "../../content/site.json"
import { DEFAULT_LINK_LABEL, type Category } from "./categories"
import {
  ProjectSchema,
  SiteSchema,
  formatIssues,
  type Project,
  type Site,
} from "./schema"

export type { Category } from "./categories"
export type { Project, Site } from "./schema"

// Leading '/' resolves from the Vite project root, so content/ sits beside src/.
const projectFiles = import.meta.glob("/content/projects/*.json", {
  eager: true,
  import: "default",
})

function parseProject(path: string, raw: unknown): Project {
  const result = ProjectSchema.safeParse(raw)
  if (!result.success) {
    throw new Error(
      `Invalid project content in ${path.replace(/^\//, "")}:\n  ${formatIssues(result.error).join("\n  ")}`,
    )
  }
  const slug = path
    .split("/")
    .pop()!
    .replace(/\.json$/, "")
  return { ...result.data, slug }
}

function parseSite(raw: unknown): Site {
  const result = SiteSchema.safeParse(raw)
  if (!result.success) {
    throw new Error(
      `Invalid site content in content/site.json:\n  ${formatIssues(result.error).join("\n  ")}`,
    )
  }
  return result.data
}

export const site: Site = parseSite(siteJson)

export const projects: Project[] = Object.entries(projectFiles).map(
  ([path, raw]) => parseProject(path, raw),
)

// Projects with an explicit order come first, ascending. The rest follow by year
// descending with undated projects last. Ties fall back to title.
function compareProjects(a: Project, b: Project): number {
  const aOrdered = a.order !== undefined
  const bOrdered = b.order !== undefined
  if (aOrdered && bOrdered) {
    if (a.order !== b.order) return a.order! - b.order!
  } else if (aOrdered) {
    return -1
  } else if (bOrdered) {
    return 1
  } else if (a.year !== b.year) {
    if (a.year === undefined) return 1
    if (b.year === undefined) return -1
    return b.year.localeCompare(a.year)
  }
  return a.title.localeCompare(b.title)
}

export function projectsIn(category: Category): Project[] {
  return projects.filter((p) => p.category === category).sort(compareProjects)
}

export function tagsIn(category: Category): string[] {
  const seen = new Set<string>()
  for (const project of projectsIn(category)) {
    for (const tag of project.tags ?? []) seen.add(tag)
  }
  return [...seen]
}

// Pages CMS writes '/media/<file>'; the demo build serves under a sub path, so
// every media src or href goes through here to pick up import.meta.env.BASE_URL.
export function assetUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path
  return import.meta.env.BASE_URL + path.replace(/^\//, "")
}

export function linkLabelFor(project: Project): string {
  return project.linkLabel ?? DEFAULT_LINK_LABEL[project.category]
}
