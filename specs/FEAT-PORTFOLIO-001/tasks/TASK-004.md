# TASK-004: Component Refactor - App.tsx Reads From the Content Layer

**Feature:** FEAT-PORTFOLIO-001 Static Portfolio + Pages CMS
**Layer:** UI
**Status:** Ready for implementation
**Depends on:** TASK-003

---

## Context

`src/App.tsx` is 1,085 lines: data arrays, theme definitions, four components and one large
`App` function. After this task it is a short composition that passes `site` and `projects`
from `src/content/index.ts` into components. The visual result must match the current site
except for the three additions the content model requires: the no-image placeholder, the link
call to action, and the empty state driven by project count. `experience.md` Part A is the
component-by-component contract, with every **[NEW]** and **[CHANGED]** item marked.

Before writing anything, run `pnpm dev` on the pre-refactor code, open each of the ten
categories in both themes, and take screenshots to `specs/FEAT-PORTFOLIO-001/baseline/`
(gitignored or committed, developer's call). They are the visual regression reference.

---

## Task

Split `App.tsx` into the components listed in `build.md` "Directory Structure", move `THEMES`
to `src/theme.ts`, delete all data arrays from `src/`, add `ProjectPlaceholder`, the link CTA,
derived Writing tags, the count-based empty state, the `siteMeta` Vite plugin, and the skip
link.

---

## Acceptance Criteria

**Structure**
- [ ] `src/theme.ts` exports `THEMES` and `Theme` with values byte-identical to today
- [ ] `src/App.tsx` is under 120 lines: theme state with `localStorage` persistence as today,
  `activeCategory` and `writingFilter` state, and composition of `Nav`, `Hero`, `Work`,
  `About`, `Contact`, `Footer`
- [ ] Each component in `build.md` exists at the listed path and receives data via props
  (`site` sections or `Project[]`), never importing from `src/content/index.ts` directly,
  except `App.tsx`
- [ ] `grep -rn "unsplash\|Rotary\|anoushka.mathews@\|FTII\|Films and Television" src/`
  returns nothing. `grep -rn "'/media/" src/` returns nothing (all paths go through
  `assetUrl`)

**Hero**
- [ ] Renders `eyebrow`, `firstName` / `lastName` (second line italic), `intro`, two buttons,
  portrait via `assetUrl(site.hero.portrait)`. When `portrait` is empty, render the 3:4 muted
  block with no `<img>`

**Work**
- [ ] `CategoryBar` unchanged in markup and style; active button carries `aria-pressed`
- [ ] Projects come from `projectsIn(activeCategory)`
- [ ] Writing sub-filter chips are `All` plus `tagsIn('Writing')`; hidden when that list is
  empty
- [ ] Cyanotypes render through `CyanotypeGallery`, which skips projects without `thumbnail`
  and shows `site.work.cyanotypeIntro` above
- [ ] Empty state shows when `projectsIn(category).length === 0`, with the same copy as today.
  No `Coming Soon` title check anywhere

**ProjectCard**
- [ ] Image: `<img loading="lazy" src={assetUrl(thumbnail)} alt={title}>` inside the fixed
  16:9 container. `onError` sets local state that swaps the image for `ProjectPlaceholder`
- [ ] No `thumbnail` renders `ProjectPlaceholder` directly
- [ ] `ProjectPlaceholder`: fills the 16:9 area with `t.muted`, category in small caps
  (`t.textFaint`) top-left, title in Fraunces 300 at `clamp(1.25rem, 3vw, 2rem)` bottom-left
  with `t.textMuted`, `aria-hidden="true"`. Must look designed next to a real image card
- [ ] Link CTA: when `link` is set, a text button at the card's bottom with
  `linkLabelFor(project)` and a `↗` glyph, `target="_blank" rel="noopener noreferrer"`,
  `aria-label` of `${label} ${title}`. The image area is wrapped in an `<a>` with the same
  href. When `link` is empty, neither anchor renders and the card is a `<div>` as today
- [ ] Client, tags, role, year each hidden when empty (as today)

**About / Contact / Footer**
- [ ] About renders `lead`, each of `paragraphs`, and the Education list; the Education block
  is hidden when the array is empty
- [ ] Contact renders `heading` split on `\n` with the second line italic, and the three rows
  with `tel:` (digits only), `mailto:`, and `https://instagram.com/<handle>`; rows hidden when
  the field is empty
- [ ] Footer uses `new Date().getFullYear()` and `site.footer.tagline`

**Document head and robots**
- [ ] `vite.config.ts` gains an inline `siteMeta()` plugin that reads `content/site.json` and
  in `transformIndexHtml` replaces `<!-- site:title -->` with the escaped `meta.title` and
  injects `<meta name="description">`, `og:title` and `og:description`; in `generateBundle`
  it emits `robots.txt` containing `User-agent: *\nAllow: /\n`
- [ ] `index.html` `<title>` becomes `<title><!-- site:title --></title>`
- [ ] A visually hidden skip link `Skip to work` targeting `#work` is the first element in
  `<body>`, visible on focus (reuse the Figma bypass-link styles, now in `index.css`)

**Quality**
- [ ] `pnpm validate && pnpm build` green
- [ ] Light and dark theme screenshots of Films, Writing (with a tag selected), Cyanotypes and
  an empty category match the baseline apart from placeholders and link CTAs
- [ ] Lighthouse mobile performance 90+ on `pnpm preview`

---

## Files to Touch

**Create:**
- `src/theme.ts`
- `src/components/Nav.tsx`, `Hero.tsx`, `Work.tsx`, `CategoryBar.tsx`, `ProjectCard.tsx`,
  `ProjectPlaceholder.tsx`, `CyanotypeGallery.tsx`, `About.tsx`, `Contact.tsx`, `Footer.tsx`,
  `ThemeSwitcher.tsx`

**Modify:**
- `src/App.tsx` (rewrite)
- `src/index.css` (skip link styles)
- `index.html` (title slot, skip link)
- `vite.config.ts` (`siteMeta` plugin)

**Do not touch:**
- `content/`, `public/media/`, `scripts/`
- `src/content/*` except to fix a bug found while wiring, noted in the task output

---

## Constraints

- Move, don't restyle. Class strings and inline style objects are copied verbatim. If a
  Tailwind class is changed for any reason, list it in the task output with the reason.
- No new dependencies.
- No `dangerouslySetInnerHTML`. `heading` line split is done in JSX.
- Keep the `t` prop pattern for theme passing exactly as the existing components use it.
- The `siteMeta` plugin reads the JSON with `fs.readFileSync` at config time; it must not
  import the zod schema (keeps `vite.config.ts` free of app imports).

---

## How to Verify

```bash
pnpm validate && pnpm build
pnpm preview                                  # open, walk all ten categories in both themes
grep -rn "unsplash\|Rotary\|'/media/" src/ ; echo "expect no output above"
wc -l src/App.tsx                             # < 120
curl -s http://localhost:4173/robots.txt      # Allow: /
curl -s http://localhost:4173/ | grep -o "<title>[^<]*</title>"   # Anoushka Mathews
# temporarily rename a media file to see the onError placeholder, then restore
```
