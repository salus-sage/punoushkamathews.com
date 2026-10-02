# TASK-005: GitHub Actions Workflow - Validate, Build and Deploy to Pages

**Feature:** FEAT-PORTFOLIO-001 Static Portfolio + Pages CMS
**Layer:** Delivery - CI/CD
**Status:** Ready for implementation
**Depends on:** TASK-004. Live verification also needs TASK-008 part A (repo public, Pages
source set to GitHub Actions)

---

## Context

The site must deploy on every push to `main` so that an owner save in Pages CMS becomes a
live change with no developer action. GitHub Pages' supported path for custom build tools is
the Actions trio `configure-pages`, `upload-pages-artifact`, `deploy-pages`. See `build.md`
"GitHub Actions Workflow" for the full shape; this task builds everything except the image
optimisation step, which TASK-006 inserts.

The demo URL is `https://salus-sage.github.io/punoushkamathews.com/`, so the build needs
`VITE_BASE_PATH=/punoushkamathews.com/`. When `public/CNAME` exists (TASK-009) the base must be `/`.

---

## Task

Create `.github/workflows/deploy.yml` with a `build` job (install, validate, build with the
right base path, upload artifact) and a `deploy` job (deploy to the `github-pages`
environment). Leave a clearly marked slot for the optimise step.

---

## Acceptance Criteria

- [ ] Triggers: `push` to `main` and `workflow_dispatch`
- [ ] Top-level `permissions`: `contents: write`, `pages: write`, `id-token: write`
  (`contents: write` is needed by TASK-006's commit-back; set it now so TASK-006 only adds
  steps)
- [ ] `concurrency: { group: pages, cancel-in-progress: false }`
- [ ] `build` job on `ubuntu-latest`:
  1. `actions/checkout@v4` with `fetch-depth: 0`
  2. `pnpm/action-setup@v4` (version read from `package.json` `packageManager` field, which
     this task adds, e.g. `"packageManager": "pnpm@10.33.0"` (matches `.mise.toml`))
  3. `actions/setup-node@v4` with `node-version-file: .mise.toml` if supported, otherwise
     `node-version: 22` and a comment pointing at `.mise.toml`; `cache: pnpm`
  4. `pnpm install --frozen-lockfile`
  5. `# TASK-006: optimise images step goes here` comment
  6. `pnpm validate`
  7. A step that sets `VITE_BASE_PATH` in `$GITHUB_ENV`: `/` if `public/CNAME` exists,
     otherwise `/${{ github.event.repository.name }}/`
  8. `pnpm build`
  9. `actions/configure-pages@v5`
  10. `actions/upload-pages-artifact@v3` with `path: dist`
- [ ] `deploy` job: `needs: build`, `environment: { name: github-pages, url: ${{
  steps.deployment.outputs.page_url }} }`, single step `actions/deploy-pages@v4` with
  `id: deployment`
- [ ] A failing `pnpm validate` or `pnpm build` fails the `build` job and `deploy` never runs
  (verified by pushing a deliberately broken project JSON to a branch and running via
  `workflow_dispatch`, or by a temporary push to `main` that is immediately reverted)
- [ ] After TASK-008 part A: the run is green and the demo URL serves the site with working
  images (which proves `assetUrl` and the base path are right)
- [ ] `README.md` created with: what the site is, the demo URL, `pnpm dev` / `pnpm validate` /
  `pnpm build`, and a one-paragraph description of the deploy pipeline linking to this spec

---

## Files to Touch

**Create:**
- `.github/workflows/deploy.yml`
- `README.md`

**Modify:**
- `package.json`: `packageManager` field

**Do not touch:**
- `scripts/`, `src/`, `content/`

---

## Constraints

- Default `GITHUB_TOKEN` only. No personal access tokens, no secrets.
- Pin actions to major version tags as listed. Do not use `@main`.
- Do not add a `gh-pages` branch or `peaceiris/actions-gh-pages`; the Pages source is
  "GitHub Actions".
- Do not run the optimiser here even if TASK-006 is already written; keep tasks separable.
- Keep the workflow under 80 lines; the optimise step will add about 15.
- **No repository identity literals.** `deploy.yml` must not contain `salus-sage`,
  `bhanugs-aii`, `punoushkamathews` or `github.io`. Use `github.event.repository.name` for the base path. The
  repo is transferred to another account in TASK-010 and the workflow must not change.
- `README.md` shows the demo URL once, under a heading `## Live URL`, with an HTML comment
  `<!-- updated by TASK-010 on transfer -->` so it is the only place to edit.

---

## How to Verify

```bash
# locally, simulate the base path logic
VITE_BASE_PATH=/punoushkamathews.com/ pnpm build && grep -o 'src="/punoushkamathews.com/assets[^"]*"' dist/index.html | head -1
# in GitHub, after TASK-008 part A
gh workflow run deploy.yml
gh run watch
curl -sI https://salus-sage.github.io/punoushkamathews.com/ | head -1          # 200
curl -sI https://salus-sage.github.io/punoushkamathews.com/media/placeholder.jpg | head -1   # 200
```
