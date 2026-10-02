# Anoushka Mathews portfolio

A static portfolio site for Anoushka Mathews, a filmmaker, writer and cyanotype artist.
It presents her films, writing and cyanotype work from JSON content that the owner edits
through Pages CMS, and it is published to GitHub Pages on every push to `main` with no
developer action required.

## Live URL

<!-- updated by TASK-010 on the repo move -->
https://salus-sage.github.io/punoushkamathews.com/

## Develop

Node 22 and pnpm are pinned in `.mise.toml` (pnpm also in the `packageManager` field).

```bash
pnpm install    # install dependencies
pnpm dev        # start the Vite dev server
pnpm validate   # typecheck and validate content/ JSON against the schemas
pnpm build      # production build into dist/
pnpm preview    # serve the production build locally
```

## How it deploys

A single workflow, `.github/workflows/deploy.yml`, runs on every push to `main` and on
manual dispatch. It installs dependencies, optimises any new or changed images and commits
them back, validates the content, builds the site with the base path derived from the
repository name (or `/` when `public/CNAME` exists for a custom domain), and deploys the
`dist/` folder to GitHub Pages through `actions/deploy-pages`. A failing validate or build
step stops the run before anything is deployed.

## Content

Site copy and project data live as JSON files in `content/` and are edited through Pages
CMS, which commits straight to `main`. Images and other media live in `public/media/` and
are referenced from the JSON by path.

## Specs

Feature spec, build plan and task breakdown: [specs/FEAT-PORTFOLIO-001/](specs/FEAT-PORTFOLIO-001/)

## For the owner

See docs/OWNER-GUIDE.md (written in TASK-008).
