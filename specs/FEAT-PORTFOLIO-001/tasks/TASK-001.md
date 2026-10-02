# TASK-001: Strip Figma Make Scaffolding and Fix the Build Baseline

**Feature:** FEAT-PORTFOLIO-001 Static Portfolio + Pages CMS
**Layer:** Foundation - project configuration
**Status:** Ready for implementation
**Depends on:** Nothing

---

## Context

The repo is a Figma Make export. `vite.config.ts` carries four Figma-only plugins (site
configuration from `.figma/make/site.json`, error overlay replay, refresh boundary fallback,
and the Make kit route). `.figma/make/site.json` sets `robots.index: false`, which would ship
a `noindex` meta and a blocking `robots.txt`. There is a stray `package-lock.json` from an
`npm install` alongside the project's `pnpm-lock.yaml`. The Vite `base` is `/` unless a Figma
environment variable is set.

From this task onward the repo is the source of truth and Figma Make is not used again
(decision recorded in `challenge.md`, Non-Goal 8).

No UI changes in this task.

---

## Task

Remove the Figma Make scaffolding, make pnpm the only package manager, read the Vite base path
from `VITE_BASE_PATH`, and add the `validate` script that later tasks extend.

---

## Acceptance Criteria

- [ ] `.figma/` directory deleted. `vite.config.ts` no longer imports `./.figma/make/site.json`
- [ ] `vite.config.ts` reduced to: `react()`, `tailwindcss()`, `@` alias, `base: process.env.VITE_BASE_PATH ?? '/'`, `build.sourcemap: false`. The `server` and `preview` blocks keep `port` from `PORT` with default `5173` and drop `strictPort` and the Figma host variable
- [ ] The `figmaSiteConfiguration`, `figmaErrorOverlayReplay`, `figmaReactRefreshBoundaryFallback` and `figmaMakeKitPlugin` functions and their types are deleted
- [ ] `index.html` has the comment slots `<!-- figma:* -->` replaced: `lang="en"` set directly, `<title>Anoushka Mathews</title>` set directly for now (TASK-004 replaces it with `<!-- site:title -->`), other slots removed. Viewport meta kept
- [ ] `.gitignore` entry `/.figma/design-context/` removed; `dist/` stays ignored
- [ ] `package-lock.json` deleted and `.npmrc` checked: if it only carries Figma registry settings, delete it; otherwise keep
- [ ] `package.json` scripts: `dev`, `build`, `preview`, `format` unchanged; add `"validate": "tsc --noEmit"` and `"typecheck": "tsc --noEmit"`
- [ ] `package.json` `name` changed from `figma-make-app` to `punmathews`
- [ ] `AGENTS.md` rewritten to describe this repo (not Figma Make): structure per `build.md`, the `pnpm` scripts, and the rule that content lives in `content/`. `CLAUDE.md` keeps `@AGENTS.md`
- [ ] `assets/` (empty folder) removed
- [ ] `pnpm install --frozen-lockfile` succeeds
- [ ] `pnpm validate && pnpm build` succeed and `dist/robots.txt` is **not** generated (the Figma plugin that emitted it is gone; TASK-004 adds the indexable one)

---

## Files to Touch

**Modify:**
- `vite.config.ts`
- `index.html`
- `package.json`
- `.gitignore`
- `AGENTS.md`

**Delete:**
- `.figma/` (whole directory)
- `package-lock.json`
- `assets/`
- `.npmrc` (only if Figma-specific, see criteria)

**Do not touch:**
- `src/` (TASK-004 owns the refactor)
- `pnpm-lock.yaml` unless `pnpm install` requires it

---

## Constraints

- pnpm only. Do not run `npm install`.
- Do not change any dependency versions in this task. New dependencies arrive in TASK-003 and
  TASK-006 where they are used.
- Keep Node and pnpm versions as pinned in `.mise.toml`.
- Do not add the `siteMeta` plugin here; `content/site.json` does not exist yet.

---

## How to Verify

```bash
pnpm install --frozen-lockfile
pnpm validate
pnpm build
ls dist/                      # index.html + assets/, no robots.txt
grep -r "figma" vite.config.ts index.html package.json && echo "FAIL: figma refs remain" || echo OK
test ! -d .figma && test ! -f package-lock.json && echo OK
pnpm dev                      # app renders exactly as before on http://localhost:5173
```
