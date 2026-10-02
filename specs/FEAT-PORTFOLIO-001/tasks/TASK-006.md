# TASK-006: Image Optimisation Script and Commit-back Step

**Feature:** FEAT-PORTFOLIO-001 Static Portfolio + Pages CMS
**Layer:** Delivery - media pipeline
**Status:** Ready for implementation
**Depends on:** TASK-005

---

## Context

Pages CMS commits uploaded files to `public/media/` exactly as the owner picked them. Camera
stills are commonly 5 to 15 MB. The repo is the long-term store, GitHub Pages has a 1 GB site
limit, and visitors should not download multi-megabyte thumbnails. The owner has agreed that
originals are not kept in the repo (decision in `challenge.md`, Non-Goal 9).

Design facts from `build.md` "Image Optimisation Rules" and "GitHub Actions Workflow":
- The optimiser runs as a step inside the deploy run, before validate and build. A push made
  with `GITHUB_TOKEN` does not trigger another run, so one owner save yields one run.
- Format is preserved (JPEG stays JPEG, WebP stays WebP) so `thumbnail` values never change.
- In CI only the files changed in the pushed range are processed, so a file is re-encoded at
  most once. On `workflow_dispatch` every file over the limits is processed, which is how the
  48 migrated placeholders get optimised.

---

## Task

Write `scripts/optimize-images.ts` using sharp, add it as `pnpm optimize-images`, insert the
optimise and commit-back steps into `deploy.yml`, then run the workflow manually once to
optimise the migrated placeholder images.

---

## Acceptance Criteria

**Script**
- [ ] `pnpm optimize-images` processes all `public/media/**/*.{jpg,jpeg,webp}`
- [ ] `pnpm optimize-images --changed <fromSha> <toSha>` processes only files under
  `public/media/` that `git diff --name-only --diff-filter=AM <from> <to>` lists. If
  `<fromSha>` is the all-zeros sha (first push) or the diff fails, falls back to all files
- [ ] Skip rule: a file whose long edge is at or under 2000px **and** whose size is at or under
  300 KB is left untouched and reported as `skip`
- [ ] Processing: `sharp(input).rotate()` (apply EXIF orientation) → `.resize(2000, 2000, {
  fit: 'inside', withoutEnlargement: true })` → JPEG: `.jpeg({ quality: 80, progressive: true,
  mozjpeg: true })`; WebP: `.webp({ quality: 80 })`. No `.withMetadata()`, so EXIF, GPS and
  colour profile are stripped (sRGB is assumed; add `.toColorspace('srgb')` before encoding)
- [ ] Writes to a temp file then renames over the original. If the output is larger than the
  input, the input is kept and the file is reported as `kept`
- [ ] Reports one line per file: `<status> <path> <before> → <after>` and a total line
  `processed N, skipped S, kept K, saved X MB`
- [ ] Exits 1 if any file fails to decode, naming it
- [ ] Runs on the 48 migrated images locally in under 30 seconds

**Workflow**
- [ ] In `deploy.yml`, replacing the TASK-006 comment slot, after `pnpm install`:
  1. `Optimise images`: `pnpm optimize-images --changed ${{ github.event.before }} ${{
     github.sha }}` on `push`; plain `pnpm optimize-images` on `workflow_dispatch`
     (use `if:` on `github.event_name` for two steps, or pass empty args)
  2. `Commit optimised images`: if `git status --porcelain public/media` is non-empty,
     configure `user.name "github-actions[bot]"` and `user.email
     "41898282+github-actions[bot]@users.noreply.github.com"`, `git add public/media`,
     commit `chore(media): optimise images`, `git pull --rebase origin main`, `git push`
- [ ] The subsequent `pnpm validate` and `pnpm build` steps run against the working tree
  that contains the optimised files, so the deployed site serves them in the same run
- [ ] A manual `workflow_dispatch` run after merging produces one commit that rewrites the
  migrated placeholders; after it, `find public/media -size +500k` prints nothing and no
  image exceeds 2000px (check with `sharp` metadata or `sips -g pixelWidth` locally)
- [ ] Pushing a deliberately large test JPEG (for example 4000px, 6 MB) to `public/media/`
  results in exactly one workflow run, one bot commit, and the live URL serving the small
  file. Remove the test file afterward
- [ ] `sharp` is in `devDependencies` only and `pnpm build` output contains no sharp code

---

## Files to Touch

**Create:**
- `scripts/optimize-images.ts`

**Modify:**
- `.github/workflows/deploy.yml` (two steps in the marked slot)
- `package.json`: `"optimize-images": "tsx scripts/optimize-images.ts"`
- `public/media/*.jpg` (rewritten by the manual run, committed by the bot)

**Do not touch:**
- `content/` (format preservation means no reference changes)
- `src/`

---

## Constraints

- Preserve extension and path. Never write `.webp` for a `.jpg` input.
- Never enlarge.
- Never process `public/media/placeholder.jpg` into something other than a valid JPEG (it is
  already small; it will hit the skip rule).
- `sharp` prebuilt binaries must install on `ubuntu-latest` and macOS arm64 without extra
  system packages; if `pnpm install` needs `--ignore-scripts` adjustments, document them in
  `README.md`.
- The commit-back step must not run on pull requests from forks (not a concern today because
  the trigger is `push` to `main` only; keep it that way).

---

## How to Verify

```bash
pnpm optimize-images                                  # processes the 48 migrated files
du -sh public/media                                   # expect a large drop
find public/media -size +500k                          # nothing
pnpm validate                                          # still passes (paths unchanged)
git add -A && git commit -m "chore(media): optimise migrated placeholders"
git push
gh run watch                                           # one run, no second run spawned
# large-file test
# add a 4000px JPEG as public/media/zz-test.jpg, commit, push, watch for one run + one bot commit
gh run list --limit 3
git pull && ls -la public/media/zz-test.jpg            # small now
git rm public/media/zz-test.jpg && git commit -m "chore: remove test image" && git push
```
