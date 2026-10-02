# FEAT-PORTFOLIO-001: Build Spec - Static Portfolio on GitHub Pages with Pages CMS

## Repos & Services in Scope

| Repo / Service | Role in this feature | Notes |
|----------------|---------------------|-------|
| `salus-sage/punoushkamathews.com` | Only implementation target. Source, content, media, workflows, CMS config all live here | Built under `bhanugs-aii/punmathews`, moved in TASK-010, made public in TASK-008 |
| GitHub Pages | Hosting. Deployed by GitHub Actions from the `dist/` build output | Demo URL `https://salus-sage.github.io/punoushkamathews.com/` |
| GitHub Actions | One workflow: optimise images, validate content, build, deploy | Uses the default `GITHUB_TOKEN`, no secrets |
| Pages CMS (hosted, `app.pagescms.org`) | Owner's editing UI. Reads and writes files in this repo through its GitHub App | Configured by `.pages.yml`. Nothing deployed by us |

**Out of scope:** any other repo, any server, any database, any third-party media host.

> Everything under `specs/` is documentation and is never imported by the app. Everything under
> `content/` and `public/media/` is owner-editable data and must never contain code or be
> required at type level by anything other than the loader in `src/content/`.

---

## Technical Approach

The Figma Make export is kept as the visual baseline and turned into a conventional Vite +
React 19 static site. All content moves out of `src/App.tsx` into `content/site.json` and one
JSON file per project in `content/projects/`. The app loads those files at build time with a
Vite glob import, validates them with a shared zod schema, and renders them through a small set
of components split out of the current monolith.

Pages CMS gives the owner a form-based editor over exactly those files. Every save is a commit
to `main`. One GitHub Actions workflow runs on every push: it resizes and recompresses any
newly pushed images in `public/media/` and commits the result back, validates the content
against the schema, builds the site, and deploys `dist/` to GitHub Pages. If validation or the
build fails, the deploy step never runs and the previous deployment stays live.

The base path is read from an environment variable so the move from the demo URL to a custom
domain is a one-line workflow change plus a `CNAME` file.

**What we are NOT doing:** no redesign, no router, no video embeds, no hosted CMS, no image
CDN, no original-image archive, no draft workflow, no further Figma exports.

---

## Architecture

### Directory Structure

```
punmathews/
├── .github/
│   └── workflows/
│       └── deploy.yml              ← optimise media → validate → build → deploy to Pages
├── .pages.yml                      ← Pages CMS configuration (content model + media)
├── content/
│   ├── site.json                   ← hero, about, education, contact, work, footer, meta
│   └── projects/
│       ├── we-heart-to-vote.json   ← one file per project, filename is the slug
│       └── ...
├── public/
│   ├── media/                      ← owner uploads land here; optimised in place by CI
│   │   ├── placeholder.jpg         ← generic fallback image, committed by TASK-002
│   │   └── *.jpg | *.webp
│   └── CNAME                       ← only once a custom domain exists (TASK-009)
├── scripts/
│   ├── migrate-content.ts          ← one-shot: App.tsx arrays → content/ (TASK-002)
│   ├── optimize-images.ts          ← sharp; run by CI, runnable locally (TASK-006)
│   └── validate-content.ts         ← zod check of content/ and media refs (TASK-003)
├── src/
│   ├── components/
│   │   ├── Nav.tsx
│   │   ├── Hero.tsx
│   │   ├── Work.tsx
│   │   ├── CategoryBar.tsx
│   │   ├── ProjectCard.tsx
│   │   ├── ProjectPlaceholder.tsx
│   │   ├── CyanotypeGallery.tsx
│   │   ├── About.tsx
│   │   ├── Contact.tsx
│   │   ├── Footer.tsx
│   │   └── ThemeSwitcher.tsx
│   ├── content/
│   │   ├── categories.ts           ← CATEGORIES tuple + Category type + default link labels
│   │   ├── schema.ts               ← zod schemas; types inferred from them
│   │   └── index.ts                ← glob loader, sorting, assetUrl()
│   ├── theme.ts                    ← THEMES + Theme (moved verbatim)
│   ├── App.tsx                     ← composition + theme and category state only
│   ├── main.tsx
│   ├── index.css
│   └── vite-env.d.ts
├── docs/
│   └── OWNER-GUIDE.md              ← non-technical editing guide (TASK-008)
├── specs/FEAT-PORTFOLIO-001/       ← this spec
├── index.html
├── vite.config.ts                  ← react + tailwind + siteMeta plugin, base from env
├── tsconfig.json
├── package.json
├── pnpm-lock.yaml
└── .mise.toml
```

Removed by TASK-001: `.figma/`, the four Figma Vite plugins, `package-lock.json`, the
`assets/` and `dist/` folders from the working tree (`dist/` stays gitignored).

### Content Model

Schemas live in `src/content/schema.ts` and are the single source of truth. The app's types are
`z.infer<>` of these schemas and the validation script imports the same module.

```ts
// src/content/categories.ts
export const CATEGORIES = [
  'Films', 'Series', 'News Features', 'Music Video', 'Reels',
  'Writing', 'Exhibitions', 'Workshops & Teaching', 'Improv', 'Cyanotypes',
] as const
export type Category = (typeof CATEGORIES)[number]

export const DEFAULT_LINK_LABEL: Record<Category, 'Watch' | 'Read' | 'View'> = {
  'Films': 'Watch', 'Series': 'Watch', 'Music Video': 'Watch', 'Reels': 'Watch',
  'Writing': 'Read', 'News Features': 'Read',
  'Exhibitions': 'View', 'Workshops & Teaching': 'View', 'Improv': 'View', 'Cyanotypes': 'View',
}
```

```ts
// src/content/schema.ts (shape; exact zod in TASK-003)
Project {
  title: string            // required, 1..160
  category: Category       // required, enum of CATEGORIES
  description: string      // required, 1..600
  client?: string
  role?: string
  year?: string            // /^\d{4}$/
  link?: string            // https?:// URL
  linkLabel?: string       // 1..24
  thumbnail?: string       // '/media/<file>' and the file must exist under public/
  tags?: string[]
  order?: number           // integer >= 0
}
// Derived at load time, not stored:
//   slug: string           // filename without .json

Site {
  hero: { eyebrow?: string; firstName: string; lastName: string; intro?: string; portrait?: string }
  about: { lead: string; paragraphs?: string[] }
  education: Array<{ degree: string; institution: string; year?: string }>
  contact: { heading?: string; phone?: string; email?: string; instagram?: string }
  work: { cyanotypeIntro?: string }
  footer: { tagline?: string }
  meta: { title: string; description?: string }
}
```

Example project file, exactly as Pages CMS will write it:

```json
{
  "title": "We Heart to Vote",
  "category": "Films",
  "client": "Rotary Club, Bengaluru (Youth Wing)",
  "description": "Campaign film commissioned for Voter Awareness during the Parliamentary Elections in 2024.",
  "role": "Director, Editor",
  "year": "2024",
  "thumbnail": "/media/we-heart-to-vote.jpg"
}
```

### Content Loading

```ts
// src/content/index.ts
const files = import.meta.glob('/content/projects/*.json', { eager: true, import: 'default' })
export const projects: Project[] = Object.entries(files).map(([path, raw]) => ({
  ...ProjectSchema.parse(raw),
  slug: path.split('/').pop()!.replace(/\.json$/, ''),
}))
export const site: Site = SiteSchema.parse(siteJson)   // import siteJson from '/content/site.json'

export function projectsIn(category: Category): Project[]   // sorted: order asc (set first), year desc, title asc
export function tagsIn(category: Category): string[]        // distinct, first-seen order
export function assetUrl(path: string): string              // BASE_URL + path without leading slash
```

- `import.meta.glob` with a leading `/` resolves from the Vite project root, so `content/`
  can sit outside `src/`.
- Parsing with zod at module load means a bad file throws during `vite build`, which is a
  second line of defence behind the explicit validate script.
- `assetUrl` exists because Pages CMS writes `/media/<file>` but the demo deploys under
  `/punoushkamathews.com/`. Every `src`/`href` to a media file goes through it.

### Base Path and Site Meta

```ts
// vite.config.ts
base: process.env.VITE_BASE_PATH ?? '/',
plugins: [react(), tailwindcss(), siteMeta()]
```

`siteMeta()` is a 15-line inline plugin that reads `content/site.json` and replaces
`<!-- site:title -->` and `<!-- site:description -->` comment slots in `index.html` with the
`meta` values, and emits `robots.txt` with `Allow: /`. No Figma config file.

The workflow sets `VITE_BASE_PATH=/punoushkamathews.com/` only when `public/CNAME` does not exist.

### GitHub Actions Workflow (`deploy.yml`)

```
on: push (branches: [main]), workflow_dispatch
permissions: contents: write, pages: write, id-token: write
concurrency: group: pages, cancel-in-progress: false

job build:
  checkout (fetch-depth: 0)
  mise / setup node 22 + pnpm, pnpm install --frozen-lockfile
  optimise:  pnpm optimize-images --changed ${{ github.event.before }} ${{ github.sha }}
             if git has changes: commit "chore(media): optimise images" and push
  validate:  pnpm validate                 (tsc --noEmit + validate-content)
  build:     VITE_BASE_PATH=... pnpm build
  upload-pages-artifact: dist
job deploy:
  needs: build, environment: github-pages, deploy-pages
```

Facts the design depends on:
- A push made with the default `GITHUB_TOKEN` does **not** trigger another workflow run. That is
  why optimisation is a step inside the deploy run rather than its own workflow: one owner
  save produces exactly one run and one deploy, and the build sees the optimised files.
- `cancel-in-progress: false` so a run that is mid-way through the commit-back step is never
  killed by a second quick save. Runs queue instead.
- On `workflow_dispatch` the optimise step runs without `--changed` and processes every file
  that still exceeds the limits, which is how the initial migrated placeholders get processed.

### Image Optimisation Rules (`scripts/optimize-images.ts`)

| Rule | Value |
|------|-------|
| Scope | `public/media/**/*.{jpg,jpeg,webp}`. PNG is not an allowed upload extension (see `.pages.yml`) so it never arrives |
| Selection in CI | Files added or modified in the pushed commit range. On manual dispatch: all files |
| Skip | Files already at or under 2000px long edge **and** at or under 300 KB |
| Resize | Fit inside 2000 x 2000, never enlarge, honour EXIF orientation then strip all metadata |
| Encode | JPEG: quality 80, progressive, mozjpeg. WebP: quality 80 |
| Output | Same path, same extension. No reference rewriting needed |
| Guard | After encoding, if the result is larger than the input, keep the input. When no resize was needed, also keep the input unless the re-encode saves at least 5%, so a file just over 300 KB is not re-encoded on every run |
| Report | Prints before and after sizes; exits non-zero on a file it cannot decode |

Format is preserved so that `thumbnail` values in `content/` never need rewriting. Metadata is
stripped so a still never leaks camera GPS data into a public repo.

### Content Validation (`scripts/validate-content.ts`)

Run by `pnpm validate` locally and in CI. Fails the run with a readable list of problems on:

1. A file in `content/projects/` that is not valid JSON or does not match `ProjectSchema`.
2. A filename that is not `^[a-z0-9]+(-[a-z0-9]+)*\.json$`.
3. `content/site.json` that does not match `SiteSchema`.
4. A `thumbnail` or `portrait` value whose file does not exist under `public/`.
5. A `link` that is not an absolute `http` or `https` URL.

Before validation, both schemas strip keys whose value is `""` or `null` and drop empty
strings from lists, because Pages CMS may write those for optional fields the owner left
blank. A blank `year` is therefore "no year", not a format error.

Warns (does not fail) on duplicate titles within one category and on projects with no
`thumbnail`, printing a count so the developer can tell the owner how many are left.

### Pages CMS Configuration (`.pages.yml`)

Complete file, identical to `.pages.yml` in the repo root. Field types and option keys follow
the Pages CMS docs as checked on 2026-10-02: select uses `options.values`, image uses
`options.media`, lists use `list: true`, collections support `format: json` and `filename`.
In `view`, `sort` and `search` are lists of field names and the default ordering lives under
`view.default.sort` and `view.default.order`. Every `pattern` accepts an empty value, because Pages CMS runs the
regex on blank optional fields too (found in the first live test). Email and Instagram carry
`pattern` checks that mirror the zod schema; `order` carries `options.min: 0`. Residual gap: the CMS cannot enforce
that `order` is an integer, so a decimal would be caught only by `validate-content`.

```yaml
media:
  - name: images
    label: Images
    input: public/media
    output: /media
    extensions: [jpg, jpeg, webp]
    rename: safe

content:
  - name: projects
    label: Projects
    type: collection
    path: content/projects
    format: json
    filename: "{primary}.json"
    view:
      primary: title
      fields: [thumbnail, title, category, year]
      sort: [year, title]
      search: [title, category, client, description, role]
      default:
        sort: year
        order: desc
    fields:
      - name: title
        label: Title
        type: string
        required: true
        description: Name of the film, article, exhibition or workshop.
        options: { maxlength: 160 }
      - name: category
        label: Category
        type: select
        required: true
        description: Which tab this appears under.
        options:
          values: [Films, Series, News Features, Music Video, Reels, Writing, Exhibitions, Workshops & Teaching, Improv, Cyanotypes]
      - name: client
        label: Client or publisher
        type: string
        description: Who it was made for or published by. Leave blank for personal work.
      - name: description
        label: Description
        type: text
        required: true
        description: One or two sentences. This is what visitors read on the card.
        options: { maxlength: 600 }
      - name: role
        label: Your role
        type: string
        description: "For example: Director, Editor."
      - name: year
        label: Year
        type: string
        description: Four digits, for example 2024. Used to order projects, newest first.
        pattern:
          regex: "^(\\d{4})?$"
          message: Enter a four digit year.
      - name: link
        label: Link to the work
        type: string
        description: YouTube, Vimeo, article or exhibition page. Opens in a new tab.
        pattern:
          regex: "^(https?://.*)?$"
          message: Must start with http:// or https://
      - name: linkLabel
        label: Link button label
        type: string
        description: Leave blank to use Watch, Read or View automatically.
        options: { maxlength: 24 }
      - name: thumbnail
        label: Thumbnail
        type: image
        description: Landscape still, at least 1400px wide. Large files are resized automatically after upload.
        options:
          media: images
      - name: tags
        label: Tags
        type: string
        list: true
        description: "Only used for the Writing tab filters, for example: Disability."
      - name: order
        label: Manual order
        type: number
        description: Lower numbers appear first within the category. Leave blank to sort by year.
        options: { min: 0 }

  - name: site
    label: Site settings
    type: file
    path: content/site.json
    format: json
    fields:
      - name: hero
        label: Hero
        type: object
        fields:
          - { name: eyebrow, label: Eyebrow line, type: string }
          - { name: firstName, label: First name, type: string, required: true }
          - { name: lastName, label: Last name, type: string, required: true }
          - { name: intro, label: Intro, type: text }
          - { name: portrait, label: Portrait, type: image, options: { media: images } }
      - name: about
        label: About
        type: object
        fields:
          - { name: lead, label: Lead paragraph, type: text, required: true }
          - { name: paragraphs, label: Further paragraphs, type: text, list: true }
      - name: education
        label: Education
        type: object
        list:
          collapsible: { collapsed: true, summary: "{degree}" }
        fields:
          - { name: degree, label: Degree, type: string, required: true }
          - { name: institution, label: Institution, type: string, required: true }
          - { name: year, label: Year, type: string }
      - name: contact
        label: Contact
        type: object
        fields:
          - { name: heading, label: Heading, type: string }
          - { name: phone, label: Phone, type: string }
          - name: email
            label: Email
            type: string
            pattern:
              regex: "^([^\\s@]+@[^\\s@]+\\.[^\\s@]+)?$"
              message: Enter a valid email address.
          - name: instagram
            label: Instagram handle
            type: string
            description: Handle without the @
            pattern:
              regex: "^[^@\\s]*$"
              message: Enter the handle without the leading @.
      - name: work
        label: Work section
        type: object
        fields:
          - { name: cyanotypeIntro, label: Cyanotypes intro, type: text }
      - name: footer
        label: Footer
        type: object
        fields:
          - { name: tagline, label: Tagline, type: string }
      - name: meta
        label: Search and browser
        type: object
        fields:
          - { name: title, label: Browser tab title, type: string, required: true }
          - { name: description, label: Search description, type: text }

settings:
  content:
    merge: true
```

`settings.content.merge: true` makes Pages CMS merge submitted fields into the existing file
rather than rewriting it from the schema, so a field the CMS does not know about (none today)
would survive a save.

### Tech Stack

| Concern | Choice | Version | Notes |
|---------|--------|---------|-------|
| UI framework | React | ^19.0.0 | as exported |
| Build tool | Vite | ^8.0.5 | as exported, Figma plugins removed |
| Language | TypeScript | ^5.7.0 | `strict: true` already set |
| Styling | Tailwind CSS | ^4.0.0 via `@tailwindcss/vite` | unchanged |
| Package manager | pnpm | from `.mise.toml` | `package-lock.json` deleted |
| Node | 22.x | from `.mise.toml` | Actions uses the same version |
| Schema validation | zod | ^3.x | **new dependency** |
| Script runner | tsx | ^4.x | **new devDependency**, runs `scripts/*.ts` |
| Image processing | sharp | ^0.33.x | **new devDependency**, CI and local only, never bundled |
| Formatting | oxfmt | ^0.2.0 | unchanged |
| Hosting | GitHub Pages via `actions/deploy-pages` | v4 | `actions/configure-pages@v5`, `actions/upload-pages-artifact@v3` |
| CMS | Pages CMS hosted | current | configured by `.pages.yml` |

### Engineering Rules for the App

- Components never import JSON directly. They receive data as props from `App`, which reads
  `projects` and `site` from `src/content/index.ts`.
- Every media path is rendered through `assetUrl()`. A raw `/media/...` string in JSX is a bug.
- `THEMES` values, class names and inline style values are moved, not changed. A diff of the
  rendered DOM before and after TASK-004 for the Films tab in light theme should show only the
  placeholder and link additions.
- No new runtime dependencies beyond zod. No router, no state library, no UI kit.
- `pnpm validate` must pass before any task is marked complete.
- Scripts in `scripts/` are plain TypeScript run with `tsx`, no build step.
- **No hardcoded repository identity.** The repo moved from the developer's personal
  account to the site's own GitHub user account `salus-sage` after the build phase
  (TASK-010, done 2026-10-02). Nothing under `src/`, `scripts/`, `vite.config.ts`, `.pages.yml` or
  `.github/` may contain the GitHub owner (`salus-sage`, or the original `bhanugs-aii`), the repo name, or the
  `github.io` URL as a literal. The workflow derives the base path from
  `github.event.repository.name`; docs that must show a URL (`README.md`, owner guide) carry
  it in one clearly marked place that TASK-010 updates. `grep -rn "salus-sage\|bhanugs-aii\|punoushkamathews\|github.io"
  src scripts vite.config.ts .pages.yml .github` must return nothing.

---

## Edge Cases to Handle

| Case | Handling |
|------|----------|
| Owner uploads a 15 MB JPEG | Optimise step resizes and recompresses in the same run before build. Repo receives one small file |
| Owner uploads a PNG or HEIC | Blocked by `extensions` in `.pages.yml`. Guide tells them to export JPEG |
| Owner deletes a media file still referenced by a project | `validate-content` fails the run, previous site stays live, developer gets the Actions email. Card would otherwise fall back to the placeholder via `onError` |
| Two saves within a minute | Runs queue (`cancel-in-progress: false`); the second run starts from the optimiser commit of the first because it checks out `main` fresh |
| Runner has `git-lfs` and `.gitattributes` tracks images with LFS | Happened on the first live run: `git add` turned all 46 images into 131-byte pointers and pushed them. Fixed by replacing the Figma `.gitattributes` with plain `binary` rules and by a guard in the commit step that fails if any staged media blob is under 1 KB |
| Optimiser commit races a new owner commit | Optimiser does `git pull --rebase` before push; on conflict (impossible for binary files it alone touches, but) it fails loudly and the next run redoes the work |
| Title edited after creation | Filename (slug) does not change. Fine, slug is not visible anywhere yet |
| Two projects with the same title | Pages CMS would try to write the same filename. Validation warns; guide tells the owner to add the year or client to the title |
| Category with zero projects | Empty state driven by count. "Coming Soon" sentinel projects are removed in migration |
| Writing project with a new tag | Sub-filter chips are derived from tags present, so it appears automatically |
| `year` missing on some projects | Sort puts them after dated projects within the category, alphabetically |
| Base path on demo vs domain | `assetUrl` + `VITE_BASE_PATH`; workflow switches on presence of `public/CNAME` |
| Owner opens the site immediately after saving | Guide sets the expectation of two to three minutes and a hard refresh |
| Pages CMS hosted instance unavailable | Content is plain files; developer can edit directly or self-host Pages CMS. Documented in the owner guide as "message the developer" |

---

## Phases

### Phase 1 - Foundation and Content

> **Goal:** The site renders from `content/` with no hardcoded data, builds clean, and looks
> identical to the Figma export apart from the placeholder and link additions.

| Task | Scope | Depends on | Notes |
|------|-------|------------|-------|
| **TASK-001** | Strip Figma Make scaffolding, pnpm-only, base path from env, `pnpm validate` script | nothing | modifies `vite.config.ts`, `package.json`, `index.html`; deletes `.figma/`, `package-lock.json` |
| **TASK-002** | Content migration: script extracts all projects and site copy from `App.tsx` into `content/`, downloads placeholder images into `public/media/`, adds `placeholder.jpg` | TASK-001 | 1 script, 55 JSON files, `site.json`, ~49 images |
| **TASK-003** | Content layer: `categories.ts`, zod `schema.ts`, glob loader `index.ts`, `validate-content.ts`, wired into `pnpm validate` | TASK-002 | 4 new files |
| **TASK-004** | Component refactor: split `App.tsx` into components reading from the content layer; add `ProjectPlaceholder`, link CTA, derived Writing tags, count-driven empty state, `siteMeta` plugin, skip link | TASK-003 | 12 new files, `App.tsx` rewritten |

**Phase 1 exit:** `pnpm validate && pnpm build` green; `grep -r "unsplash\|Rotary Club" src/`
returns nothing; `pnpm preview` shows all ten categories with migrated content and placeholder
images.

### Phase 2 - Deploy Pipeline

> **Goal:** Every push to `main` deploys to the demo URL, with images optimised and content
> validated first.

| Task | Scope | Depends on | Notes |
|------|-------|------------|-------|
| **TASK-005** | `deploy.yml`: install, validate, build with base path, upload and deploy to Pages | TASK-004 | 1 new file. Needs repo public + Pages enabled (TASK-008 part A) to verify live |
| **TASK-006** | `optimize-images.ts` with sharp, `--changed` range mode, commit-back step added to `deploy.yml`; run once on all migrated images | TASK-005 | 1 new script, `deploy.yml` modified, media files rewritten |

**Phase 2 exit:** demo URL serves the site; pushing an oversized JPEG to `public/media/` results
in one workflow run, one optimiser commit, and a live site that serves the resized file.

### Phase 3 - CMS and Handover

> **Goal:** The owner can log in and publish alone.

| Task | Scope | Depends on | Notes |
|------|-------|------------|-------|
| **TASK-007** | `.pages.yml` as specified above; verify every field renders and a round-trip save produces a file that passes `validate-content` | TASK-006 | 1 new file |
| **TASK-008** | Repo settings (public, Pages source = Actions, collaborator invite, Pages CMS app install, branch protection against force-push), `docs/OWNER-GUIDE.md`, supervised dry run with the owner | TASK-007 | settings + 1 doc. Parts need the developer's GitHub session |

**Phase 3 exit:** owner adds a project with an image from their own machine and it is live
within three minutes, with no developer action.

### Phase 4 - Production Domain (deferred until a domain exists)

| Task | Scope | Depends on | Notes |
|------|-------|------------|-------|
| **TASK-009** | Add `public/CNAME`, DNS records, verify HTTPS, confirm base path flips to `/`, update the owner guide URL | TASK-008 + domain purchased | 1 new file + settings |

### Phase 5 - Repository Move (after the build-phase commit, before TASK-008) :DONE

| Task | Scope | Depends on | Notes |
|------|-------|------------|-------|
| **TASK-010** | Point `origin` at `salus-sage/punoushkamathews.com`, push `main`, archive the old repo; TASK-008 then runs against the new repo | TASK-001 to TASK-007 committed | settings + doc URL check. Zero code changes if the no-hardcoded-identity rule held |

**Total tasks: 10.** TASK-008 and TASK-010 have steps that cannot be done from the
repository alone. TASK-009 is specified now and executed later.

---

## Approvals

- Engineer: Bhanu Prakash - [Date]
- Owner: Anoushka Mathews - [Date]
