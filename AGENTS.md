# punmathews

Static portfolio site for Anoushka Mathews. React 19 + Vite 8 + Tailwind CSS v4, built with
pnpm and deployed to GitHub Pages. Content is edited through Pages CMS, which commits plain
JSON and image files into this repo.

The repo is the source of truth. It started as a Figma Make export, but Figma Make is no
longer used and no Figma tooling remains.

## Toolchain

Versions are pinned in `.mise.toml` (Node 22, pnpm 10.x). Use pnpm only. Never run `npm install`
and never commit a `package-lock.json`.

## Scripts

| Command | What it does |
|---------|--------------|
| `pnpm dev` | Vite dev server on `PORT` (default 5173) |
| `pnpm build` | Production build into `dist/` |
| `pnpm preview` | Serve the production build locally |
| `pnpm validate` | Type check (`tsc --noEmit`). Later tasks extend this with content validation. Must pass before a task is marked complete |
| `pnpm typecheck` | Type check only |
| `pnpm format` | Format with oxfmt |

`pnpm install --frozen-lockfile` is the only install command used in CI and locally.

## Project Structure

Paths marked (planned) are created by later tasks in `specs/FEAT-PORTFOLIO-001/tasks/` and do
not exist yet.

```
punmathews/
├── .github/workflows/deploy.yml   (planned) optimise media, validate, build, deploy to Pages
├── .pages.yml                     (planned) Pages CMS configuration
├── content/                       (planned) all owner-editable copy
│   ├── site.json                  hero, about, education, contact, work, footer, meta
│   └── projects/*.json            one file per project, filename is the slug
├── public/
│   ├── media/                     (planned) owner-uploaded images, optimised in place by CI
│   └── CNAME                      (planned) only once a custom domain exists
├── scripts/                       (planned) migrate-content.ts, optimize-images.ts, validate-content.ts
├── src/
│   ├── components/                (planned) Nav, Hero, Work, ProjectCard, About, Contact, Footer, ...
│   ├── content/                   (planned) zod schemas, glob loader, assetUrl()
│   ├── App.tsx                    composition and theme/category state
│   ├── main.tsx                   React entrypoint, imports index.css, mounts App into #root
│   ├── index.css                  Tailwind v4 import plus global CSS
│   └── vite-env.d.ts
├── docs/OWNER-GUIDE.md            (planned) non-technical editing guide
├── specs/                         specs and task docs, never imported by the app
├── index.html                     Vite HTML shell
├── vite.config.ts                 react + tailwind, @ alias, base path from VITE_BASE_PATH
├── tsconfig.json
├── package.json
├── pnpm-lock.yaml
└── .mise.toml
```

## Where things live

- **Content lives in `content/`.** All copy, project entries and site settings are JSON files
  there. Nothing under `content/` may contain code, and only the loader in `src/content/`
  may import it. Components receive data as props from `App`, never by importing JSON.
- **Media lives in `public/media/`.** Pages CMS writes paths as `/media/<file>`. Every media
  `src` or `href` in JSX goes through `assetUrl()` so the base path is applied. A raw
  `/media/...` string in JSX is a bug.
- `specs/` is documentation only and is never imported by the app.

## Base path

`vite.config.ts` reads `base` from `VITE_BASE_PATH` and defaults to `/`. The deploy workflow
sets it to `/<repo-name>/` for the GitHub Pages demo URL and leaves it unset once
`public/CNAME` exists.

## Engineering rules

- No hardcoded repository identity. Nothing under `src/`, `scripts/`, `vite.config.ts`,
  `.pages.yml` or `.github/` may contain the GitHub owner name, the repo name, or a
  `github.io` URL as a literal. The workflow derives the base path from
  `github.event.repository.name`. Docs that must show a URL carry it in one clearly marked
  place. Check with:
  `grep -rn "salus-sage\|bhanugs-aii\|punoushkamathews\|github.io" src scripts vite.config.ts .pages.yml .github`
  which must return nothing.
- No new runtime dependencies beyond zod. No router, no state library, no UI kit.
- Scripts in `scripts/` are plain TypeScript run with `tsx`, no build step.
- Theme values, class names and inline styles are moved, not changed, during refactors.
- `pnpm validate` must pass before any task is marked complete.

## Styling

Tailwind CSS v4 via the `@tailwindcss/vite` plugin configured in `vite.config.ts`.
`src/index.css` imports Tailwind with `@import 'tailwindcss';`. Use utility classes in JSX and
put global CSS or theme customisation in `src/index.css`. No Tailwind config file or PostCSS
config is needed. Keep CSS `@import` statements first in `src/index.css`, then `@font-face`
rules and font-family defaults.
