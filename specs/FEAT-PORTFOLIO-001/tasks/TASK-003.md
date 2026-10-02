# TASK-003: Content Layer - Schema, Loader and Validation Script

**Feature:** FEAT-PORTFOLIO-001 Static Portfolio + Pages CMS
**Layer:** Foundation - data access
**Status:** Ready for implementation
**Depends on:** TASK-002

---

## Context

`content/` now holds the data (TASK-002) but nothing reads it. This task builds the single
module through which the app accesses content, the zod schema that both the app and CI trust,
and the validation script that keeps a bad owner save from ever reaching a deploy. See
`build.md` sections "Content Model", "Content Loading" and "Content Validation".

The schema is the contract between three parties: Pages CMS (writes files per `.pages.yml`),
the validation script (rejects what the schema rejects) and the components (receive typed
props). If `.pages.yml` and `schema.ts` disagree, the schema wins and the CMS config is wrong.

---

## Task

Create `src/content/categories.ts`, `src/content/schema.ts`, `src/content/index.ts` and
`scripts/validate-content.ts`. Wire validation into `pnpm validate`.

---

## Acceptance Criteria

**categories.ts**
- [ ] Exports `CATEGORIES` as a readonly tuple of the ten names in the order they appear in the
  current `CategoryBar`, the `Category` type, and `DEFAULT_LINK_LABEL` exactly as in
  `build.md`

**schema.ts**
- [ ] Exports `ProjectSchema` (zod object) with: `title` string min 1 max 160; `category`
  `z.enum(CATEGORIES)`; `description` string min 1 max 600; optional `client`, `role` strings;
  optional `year` matching `/^\d{4}$/`; optional `link` as `z.string().url()` restricted to
  `http:` or `https:`; optional `linkLabel` max 24; optional `thumbnail` matching
  `/^\/media\/[^\s]+$/`; optional `tags` array of non-empty strings; optional `order` integer
  min 0. `.strict()` so unknown keys fail
- [ ] Exports `SiteSchema` matching the `Site` shape in `build.md`, `.strict()` at every level,
  with `email` validated as email when present and `instagram` rejecting a leading `@`
- [ ] Exports `Project = z.infer<typeof ProjectSchema> & { slug: string }` and
  `Site = z.infer<typeof SiteSchema>`
- [ ] Imports nothing from React or Vite so `scripts/validate-content.ts` can import it under
  `tsx`

**index.ts**
- [ ] Loads `content/site.json` via a static import and parses it with `SiteSchema`
- [ ] Loads all project files with `import.meta.glob('/content/projects/*.json', { eager: true,
  import: 'default' })`, parses each with `ProjectSchema`, derives `slug` from the filename
- [ ] A parse failure throws an error whose message names the file path
- [ ] Exports `site`, `projects`, `projectsIn(category)`, `tagsIn(category)`, `assetUrl(path)`
  and `linkLabelFor(project)` (returns `linkLabel ?? DEFAULT_LINK_LABEL[category]`)
- [ ] `projectsIn` sort: projects with `order` first by `order` ascending, then the rest by
  `year` descending (missing year last), ties by `title` ascending with `localeCompare`
- [ ] `tagsIn` returns distinct tags in first-seen order following the `projectsIn` sort
- [ ] `assetUrl('/media/x.jpg')` returns `import.meta.env.BASE_URL + 'media/x.jpg'`, so it
  yields `/media/x.jpg` locally and `/punoushkamathews.com/media/x.jpg` on the demo build. Absolute
  `http(s)` inputs are returned unchanged
- [ ] `tsconfig.json` gets `"resolveJsonModule": true` if not already set, and
  `src/vite-env.d.ts` stays sufficient for `import.meta.glob` typing

**validate-content.ts**
- [ ] Runs with `pnpm tsx scripts/validate-content.ts` and is added to `package.json` as
  `"validate:content"`, with `"validate": "tsc --noEmit && pnpm validate:content"`
- [ ] Implements the five failure rules and two warnings listed in `build.md` "Content
  Validation". Media existence is checked by resolving `/media/<file>` to
  `public/media/<file>` on disk
- [ ] Output: one line per problem as `ERROR content/projects/foo.json: <message>` or
  `WARN ...`, then a summary line `N projects, E errors, W warnings, M without thumbnail`.
  Exit code 1 when `E > 0`
- [ ] Runs in under two seconds on 55 files

---

## Files to Touch

**Create:**
- `src/content/categories.ts`
- `src/content/schema.ts`
- `src/content/index.ts`
- `scripts/validate-content.ts`

**Modify:**
- `package.json`: add `zod` to `dependencies`; add `validate:content` script; extend `validate`
- `tsconfig.json`: `resolveJsonModule` if missing

**Do not touch:**
- `src/App.tsx` and components (TASK-004)
- `content/` data (if validation finds a migration bug, fix `scripts/migrate-content.ts` and
  re-run it, then note it in the task output)

---

## Constraints

- zod is the only new runtime dependency in the whole feature. Keep it to `zod` itself, no
  adapters.
- `schema.ts` must have no side effects and no imports beyond `zod` and `./categories`.
- Do not export the raw glob record; components must never see file paths.
- Do not make `thumbnail` required. The owner adds images over time.

---

## How to Verify

```bash
pnpm install
pnpm validate                                   # tsc + content check, exit 0
pnpm validate:content                           # "55 projects, 0 errors, 0 warnings, 0 without thumbnail"
# negative tests
echo '{"title":"x","category":"Nope","description":"y"}' > content/projects/zz-test.json
pnpm validate:content; echo "exit $?"          # ERROR line naming zz-test.json, exit 1
rm content/projects/zz-test.json
sed -i '' 's#/media/placeholder.jpg#/media/missing.jpg#' content/projects/untitled-fern.json
pnpm validate:content; echo "exit $?"          # ERROR: thumbnail file does not exist, exit 1
git checkout content/projects/untitled-fern.json
```
