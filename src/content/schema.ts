import { z } from "zod"
import { CATEGORIES } from "./categories"

// Single source of truth for content shapes. Imported by the app loader
// (src/content/index.ts) and by scripts/validate-content.ts under tsx, so this
// file must stay free of React, Vite and side effects.

// Pages CMS may write "" or null for an optional field the owner left blank. Treat
// those as absent before validating so the optional rules below apply, and drop
// empty strings from lists. Applied recursively to nested objects.
function stripEmpty(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(stripEmpty).filter((v) => v !== undefined && v !== "")
  }
  if (value !== null && typeof value === "object") {
    const out: Record<string, unknown> = {}
    for (const [key, v] of Object.entries(value as Record<string, unknown>)) {
      if (v === "" || v === null || v === undefined) continue
      out[key] = stripEmpty(v)
    }
    return out
  }
  return value
}

export const ProjectSchema = z.preprocess(
  stripEmpty,
  z
  .object({
    title: z
      .string()
      .min(1, "title is required")
      .max(160, "title must be 160 characters or fewer"),
    category: z.enum(CATEGORIES),
    description: z
      .string()
      .min(1, "description is required")
      .max(600, "description must be 600 characters or fewer"),
    client: z.string().optional(),
    role: z.string().optional(),
    year: z
      .string()
      .regex(/^\d{4}$/, "year must be a four digit year, e.g. 2024")
      .optional(),
    link: z
      .url({
        protocol: /^https?$/,
        error: "link must be an absolute http or https URL",
      })
      .optional(),
    linkLabel: z
      .string()
      .min(1, "linkLabel must not be empty")
      .max(24, "linkLabel must be 24 characters or fewer")
      .optional(),
    thumbnail: z
      .string()
      .regex(/^\/media\/[^\s]+$/, "thumbnail must be a path like /media/<file>")
      .optional(),
    tags: z
      .array(z.string().min(1, "tags must not contain empty strings"))
      .optional(),
    order: z
      .number()
      .int("order must be an integer")
      .min(0, "order must be 0 or greater")
      .optional(),
  })
  .strict(),
)

export const SiteSchema = z.preprocess(
  stripEmpty,
  z
  .object({
    hero: z
      .object({
        eyebrow: z.string().optional(),
        firstName: z.string().min(1, "hero.firstName is required"),
        lastName: z.string().min(1, "hero.lastName is required"),
        intro: z.string().optional(),
        portrait: z
          .string()
          .regex(
            /^\/media\/[^\s]+$/,
            "portrait must be a path like /media/<file>",
          )
          .optional(),
      })
      .strict(),
    about: z
      .object({
        lead: z.string().min(1, "about.lead is required"),
        paragraphs: z.array(z.string()).optional(),
      })
      .strict(),
    education: z.array(
      z
        .object({
          degree: z.string().min(1, "degree is required"),
          institution: z.string().min(1, "institution is required"),
          year: z.string().optional(),
        })
        .strict(),
    ),
    contact: z
      .object({
        heading: z.string().optional(),
        phone: z.string().optional(),
        email: z.email("email must be a valid email address").optional(),
        instagram: z
          .string()
          .refine(
            (v) => !v.startsWith("@"),
            "instagram must be the handle without the leading @",
          )
          .optional(),
      })
      .strict(),
    work: z
      .object({
        cyanotypeIntro: z.string().optional(),
      })
      .strict(),
    footer: z
      .object({
        tagline: z.string().optional(),
      })
      .strict(),
    meta: z
      .object({
        title: z.string().min(1, "meta.title is required"),
        description: z.string().optional(),
      })
      .strict(),
  })
  .strict(),
)

export type Project = z.infer<typeof ProjectSchema> & { slug: string }
export type Site = z.infer<typeof SiteSchema>

/** Flattens a zod error into one readable line per issue, e.g. "hero.portrait: Invalid input". */
export function formatIssues(error: z.ZodError): string[] {
  return error.issues.map((issue) => {
    const path = issue.path.map(String).join(".")
    return path ? `${path}: ${issue.message}` : issue.message
  })
}
