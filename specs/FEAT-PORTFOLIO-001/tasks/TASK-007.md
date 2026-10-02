# TASK-007: Pages CMS Configuration (.pages.yml)

**Feature:** FEAT-PORTFOLIO-001 Static Portfolio + Pages CMS
**Layer:** CMS
**Status:** Ready for implementation
**Depends on:** TASK-006. Live verification needs the Pages CMS GitHub App installed on the
repo (TASK-008 part A)

---

## Context

Pages CMS reads `.pages.yml` from the repository root and renders an editor for exactly the
content it describes. The complete file is in `build.md` "Pages CMS Configuration" and was
written against the Pages CMS documentation as of 2026-10-02. The owner-facing labels and
helper text are in `experience.md` Part B and must match word for word.

The config and `src/content/schema.ts` describe the same data. The schema is authoritative. If
the CMS lets the owner save something the schema rejects, the fix is in `.pages.yml` (tighten
the field) or, if the schema is too strict for a legitimate case, in both.

---

## Task

Add `.pages.yml` as specified, then verify in the hosted Pages CMS that every field renders
with its label and helper text, that creating and editing a project writes a file that passes
`pnpm validate:content`, and that image upload lands in `public/media/` with a `/media/...`
value in the JSON.

---

## Acceptance Criteria

- [ ] `.pages.yml` exists at the repo root and is byte-for-byte the YAML in `build.md`, with
  the exception of fixes found during verification, each listed in the task output and
  mirrored back into `build.md`
- [ ] YAML parses (`pnpm dlx yaml-lint .pages.yml` or `node -e` with the `yaml` package)
- [ ] In Pages CMS, the sidebar shows **Projects**, **Site settings** and **Media**
- [ ] Projects list view shows thumbnail, title, category and year columns, sorted newest
  year first, with working search
- [ ] Opening an existing migrated project shows every field populated correctly, including
  the category dropdown preselected and the thumbnail preview rendered
- [ ] Creating a project titled `CMS Test Project` in category `Improv` with a description and
  an uploaded JPEG produces `content/projects/cms-test-project.json` with keys in the expected
  order and `"thumbnail": "/media/<slugified-name>.jpg"`, and the JPEG at
  `public/media/<slugified-name>.jpg`
- [ ] That commit triggers one deploy run which passes validation (the optimiser may add a
  bot commit if the image was large). The project appears under Improv on the live site
- [ ] Editing the test project's title does not rename the file
- [ ] Leaving **Title** blank blocks the save with an inline error; entering `abc` in **Year**
  shows the custom message `Enter a four digit year.`; entering `www.example.com` in **Link**
  shows `Must start with http:// or https://`
- [ ] Attempting to upload a `.png` is refused by the media picker
- [ ] Site settings opens as grouped sections in the order Hero, About, Education, Contact,
  Work section, Footer, Search and browser; Education rows are collapsible with the degree as
  summary; saving with no changes produces a file that `git diff` shows as unchanged or
  key-order-only (if key order churns, set `settings.content.merge` accordingly and note it)
- [ ] Deleting `CMS Test Project` from Pages CMS removes the JSON and triggers a green deploy.
  Delete the uploaded test image from **Media** too
- [ ] `pnpm validate:content` passes on the repo state after all of the above

---

## Files to Touch

**Create:**
- `.pages.yml`

**Modify:**
- `specs/FEAT-PORTFOLIO-001/build.md` only if the config had to change during verification

**Do not touch:**
- `src/content/schema.ts` unless a legitimate owner input is rejected; if so, change schema,
  config and `experience.md` together and say so

---

## Constraints

- Field `name` values must equal the JSON keys in `schema.ts` exactly (`linkLabel`, not
  `link_label`).
- Category `values` must equal `CATEGORIES` in `src/content/categories.ts` exactly, same
  spelling and `&`.
- `media.extensions` stays `[jpg, jpeg, webp]`. Do not add `png`.
- `rename: safe` stays on so filenames are URL-safe without the owner thinking about it.
- Do not add a `components` or `actions` section in this task.

---

## How to Verify

```bash
node -e "require('yaml').parse(require('fs').readFileSync('.pages.yml','utf8')); console.log('yaml ok')"
# then in the browser at https://app.pagescms.org, repo salus-sage/punoushkamathews.com, branch main
# walk the acceptance criteria above
git pull
pnpm validate:content
```
