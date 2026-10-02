# TASK-002: Content Migration - App.tsx Data to content/ and public/media/

**Feature:** FEAT-PORTFOLIO-001 Static Portfolio + Pages CMS
**Layer:** Foundation - content data
**Status:** Ready for implementation
**Depends on:** TASK-001

---

## Context

`src/App.tsx` holds a `projects` array of 55 entries (plus `Coming Soon` sentinels), an
`education` array of 3 entries, and hardcoded hero, about, contact and footer copy. See
`experience.md` Part A for the exact strings and `build.md` "Content Model" for the target
shape.

Image situation: 48 thumbnails are Unsplash URLs, 7 are local paths that do not exist
(`/workshop-cyanotype.jpg`, `/workshop-himalayas.jpg`, `/cyano-window.jpg`, `/cyano-grass.jpg`,
`/cyano-fern.jpg`, `/cyano-flower.jpg`, `/cyano-hand.jpg`), and the hero references
`/anoushka-portrait.jpg` which also does not exist. The owner has agreed these are placeholders
to be replaced through the CMS. Decision: download the Unsplash images into the repo as local
placeholders so nothing depends on an external host, and use one generic local placeholder for
the paths that have no image at all. Unsplash's licence permits this use.

This task produces data files only. The app still reads from `App.tsx` until TASK-004.

---

## Task

Write `scripts/migrate-content.ts` that parses the arrays out of `src/App.tsx`, writes one JSON
file per project to `content/projects/`, writes `content/site.json`, downloads each Unsplash
thumbnail into `public/media/`, and rewrites `thumbnail` values to `/media/<slug>.jpg`. Commit
the generated files. Add `public/media/placeholder.jpg`.

---

## Acceptance Criteria

- [ ] `scripts/migrate-content.ts` exists, runs with `pnpm tsx scripts/migrate-content.ts`, and
  is idempotent (re-running overwrites the same files with the same content)
- [ ] The script reads the `projects` and `education` arrays from `src/App.tsx` by evaluating
  the array literals (acceptable approaches: regex-slice the array source and `eval` it in a
  `vm` context, or temporarily `export` the arrays and `import` them). It does not hand-copy
  data
- [ ] `content/projects/` contains exactly one `.json` file per real project. Sentinel entries
  whose `title` is `Coming Soon` are **not** written
- [ ] Filenames are slugs of the title: lowercase, ASCII letters and digits, hyphen-separated,
  apostrophes and `#` removed (`#unfair` → `unfair.json`, `We Don't End at our Edges` →
  `we-dont-end-at-our-edges.json`). On a collision, append `-<slug of client>`; if still
  colliding, append `-2`, `-3`. The script prints every collision it resolved
- [ ] Each project JSON has keys in this fixed order and omits keys that are empty or
  undefined: `title, category, client, description, role, year, link, linkLabel, thumbnail,
  tags, order`. Two-space indentation, trailing newline. This matches what Pages CMS writes
- [ ] All 48 Unsplash thumbnails are downloaded at `w=1600` (replace the `w=700&h=460` query
  with `w=1600&q=85&fit=crop&auto=format`) to `public/media/<slug>.jpg` and the project's
  `thumbnail` becomes `/media/<slug>.jpg`. Downloads that fail are reported and that project's
  `thumbnail` is left out (not set to a broken URL)
- [ ] The 7 projects with missing local images get `"thumbnail": "/media/placeholder.jpg"`
- [ ] `public/media/placeholder.jpg` is committed: a 1600x900 JPEG in the site's muted stone
  colour `#EDE9E3` with no text (the typographic placeholder in TASK-004 handles the
  no-image case; this file exists only for paths that explicitly point at it). Generate it
  with sharp in the script or commit a hand-made one
- [ ] `content/site.json` is written with every string from `experience.md` Part A sections 1,
  4, 5 and 6, plus the Cyanotypes intro paragraph from the Work section, plus
  `meta.title: "Anoushka Mathews"` and `meta.description` taken from the old
  `.figma/make/site.json` description, reworded to describe the real site in one sentence.
  `hero.portrait` is `"/media/placeholder.jpg"`. `contact.instagram` is `punoushka` (no @)
- [ ] `education` entries keep their original order (FTII, XIC, JMC)
- [ ] After the script runs, `git status` shows only files under `content/`, `public/media/`
  and `scripts/`
- [ ] The script is kept in the repo for reference but noted in its header comment as one-shot

---

## Files to Touch

**Create:**
- `scripts/migrate-content.ts`
- `content/site.json`
- `content/projects/*.json` (55 files expected; print the final count)
- `public/media/placeholder.jpg`
- `public/media/*.jpg` (48 expected)

**Modify:**
- `package.json`: add `tsx` and `sharp` to `devDependencies` (sharp is used here for the
  placeholder and again in TASK-006)

**Do not touch:**
- `src/` (still the live source until TASK-004)
- `.github/`, `.pages.yml`

---

## Constraints

- Preserve every string exactly, including typographic characters already in the data
  (curly quotes, en dashes inside descriptions, `&` in `Workshops & Teaching`). Do not
  "clean up" copy.
- `year` stays a string of four digits.
- Do not invent `link` values. Every project has no `link` after migration; the owner adds
  them.
- Downloaded images are committed as-is in this task. TASK-006 optimises them with a manual
  workflow run. Expect roughly 48 files of 200 to 600 KB each.
- No network access other than `images.unsplash.com`.

---

## How to Verify

```bash
pnpm install
pnpm tsx scripts/migrate-content.ts
ls content/projects | wc -l                      # 55
ls public/media | wc -l                          # 49 (48 + placeholder.jpg)
grep -L '"thumbnail"' content/projects/*.json    # should print nothing
grep -l "unsplash" content/projects/*.json       # should print nothing
jq -r .category content/projects/*.json | sort | uniq -c   # ten categories, counts match App.tsx
jq . content/site.json                           # all sections present
pnpm tsx scripts/migrate-content.ts && git status --short | grep -v "^??" ; echo "idempotent if no M lines above"
```
