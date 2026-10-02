# FEAT-PORTFOLIO-001: Anoushka Mathews Portfolio - Static Site + Git-backed CMS

## Problem Statement

The portfolio site for filmmaker, writer and cyanotype artist Anoushka Mathews exists today
as a single React component exported from Figma Make. All 55 projects, the About copy, the
Education list and the Contact details are hardcoded inside `src/App.tsx` (1,085 lines). None
of the images are real: 48 thumbnails point at Unsplash stock photos and 7 point at local
files that do not exist. The repo is private, GitHub Pages is not enabled, the Vite base path
assumes the site is served from `/`, and the Figma site config marks the site `noindex`.

The owner is not a developer. Today every content change (a new film, a new workshop, a
changed phone number, a real still replacing a placeholder) requires a developer to edit a
TypeScript file and redeploy. That is the wrong shape for a portfolio that will be updated for
years by one person.

## Target Users

**Primary:** Anoushka Mathews, the site owner. Non-technical. Needs to add, edit and reorder
projects, upload stills, and update About and Contact copy from a browser, alone, without
touching git or a terminal.

**Secondary:** Bhanu Prakash, the developer. Owns the repo, the build, and any structural
change (new category, design tweak, domain switch). Should not be in the publishing path.

**Tertiary:** Site visitors: potential clients, collaborators, curators. They need a fast,
indexable site where every film, article and print can actually be reached.

**Jobs-to-be-done:**
- Owner logs in at a URL, edits a project, drops in an image, saves, and the live site reflects
  it within a couple of minutes.
- Owner replaces every placeholder image with real work over time, at their own pace, and can
  see which projects still lack an image.
- Developer flips the site from the demo URL to a custom domain with a config change, not a
  code change.
- Visitor clicks a project and reaches the actual film, article or exhibition page.

## Success Metrics

- **Owner can publish unassisted:** owner adds a new project with an image via Pages CMS and
  it appears on the live site with no developer involvement. Verified by a supervised dry run
  before handover.
- **Zero hardcoded content:** `src/` contains no project data, About copy, Education entries
  or Contact details. All of it lives under `content/` as JSON. Verified by grep.
- **Publish latency under 3 minutes:** from CMS save to live Pages deploy, measured on the
  Actions run.
- **Repo stays small:** no image in `public/media/` exceeds 2000px on its long edge or
  500 KB after the optimisation workflow has run. Verified by a check in the workflow.
- **Build is green on every push:** `pnpm validate` (typecheck + content schema check) and
  `pnpm build` pass in CI.
- **Last good version stays live:** an invalid content file fails the Actions run before the
  deploy step, so the previous deployment remains served.
- **Site is indexable and fast:** `robots.txt` allows indexing, no `noindex` meta, Lighthouse
  performance 90+ on mobile for the home page with placeholder images.
- **Repository is portable:** no file under `src/`, `scripts/`, `.github/`, `.pages.yml` or
  `vite.config.ts` contains the GitHub owner, repo name or `github.io` URL. Verified by grep.
  Transferring the repo to another account (TASK-010) requires zero code changes.
- **Every project can carry a link:** the data model has an optional `link` field and the card
  renders a call to action when it is set.

## Non-Goals (Explicitly Out of Scope)

1. **No visual redesign.** The Figma Make design is kept as-is. The refactor splits
   `App.tsx` into components and swaps hardcoded data for content files, nothing more. The
   only visual additions are the no-image placeholder and the link call to action, both of
   which are required by the content model.
2. **No embedded video players.** Projects link out to YouTube, Vimeo, publishers etc. in a new
   tab. Inline embeds are a possible later phase and the `link` field is shaped so that it
   would be a rendering change, not a content migration.
3. **No per-project detail pages or routing.** The site stays a single page with anchors and
   client-side category filtering. The project slug is reserved as a stable id so detail pages
   could be added later.
4. **No editable categories.** The ten categories are fixed in code and in `.pages.yml`.
   Adding one is a documented developer change.
5. **No hosted or database-backed CMS.** Pages CMS reads and writes files in this repo via the
   GitHub API. There is no server, no database, and no third-party media CDN.
6. **No custom domain in this phase.** The site deploys to
   `salus-sage.github.io/punoushkamathews.com/`. The domain switch is specified (TASK-009) but executed
   only when the owner has a domain.
7. **No draft or preview workflow.** Every CMS save commits straight to `main` and deploys. The
   owner accepted this. The build-time schema check is the only safety net.
8. **No further Figma Make exports.** The repo is the source of truth from this feature onward.
   Figma Make scaffolding is removed.
9. **No original image preservation.** Uploaded images are resized and recompressed in place.
   The owner keeps originals on their own storage.
10. **No analytics, forms or contact backend.** Contact is a phone, an email and an Instagram
    link, as today.

## Open Questions

1. **Pages CMS branch targeting:** the hosted app at `app.pagescms.org` edits the repository's
   default branch. *Assumed: `main` is and stays the default branch. Confirm during TASK-008
   setup.*
2. **Pages CMS hosted availability:** Pages CMS is an open-source project (4.1k GitHub stars)
   with a free hosted instance. If the hosted instance ever disappears, the content is plain
   JSON and images in git and we can self-host Pages CMS or switch to Sveltia CMS by writing a
   config file. *Accepted risk.*
3. **Owner GitHub account:** the owner needs a GitHub account added as a collaborator with
   write access. *Assumed: developer creates the invitation during TASK-008; owner accepts.*
4. **The hero portrait:** `App.tsx` references `/anoushka-portrait.jpg`, which does not exist.
   *Assumed: treated as a site setting image with a local placeholder until the owner uploads
   one.*
5. **"Coming Soon" sentinel entries:** some categories use a project titled `Coming Soon` to
   trigger an empty state. *Assumed: these are dropped in migration and the empty state is
   driven by "category has zero projects" instead.*
6. **Writing sub-filter tags:** the Writing category filters by two hardcoded tags, `Film &
   Archives` and `Disability`. *Assumed: tags stay free text on each project and the sub-filter
   is derived from the tags present in the category, so new tags appear automatically.*

7. **Repository move:** the repo was built under the developer's personal account and
   moved to `salus-sage/punoushkamathews.com` (a personal GitHub account, not an organisation)
   on 2026-10-02 after the build-phase commit. *Decision: treat the owner and repo name as deployment configuration, never as
   code. Pages, the Pages CMS App and the collaborator are set up once, on the new repo;
   TASK-010 covers the move and TASK-008 runs after it.*

## Approvals

- Owner: Anoushka Mathews - [Date]
- Engineering: Bhanu Prakash - [Date]
