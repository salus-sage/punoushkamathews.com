# FEAT-PORTFOLIO-001: Experience Spec - Portfolio Site and Owner Editing Flow

> **Baseline note:** The visitor-facing site is already designed (Figma Make export in
> `src/App.tsx`). This document records that design as the baseline the refactored site must
> match, and adds only what the content model requires: the no-image placeholder, the project
> link call to action, and the empty-category state. Anything marked **[NEW]** is an addition.
> Everything else must be preserved visually.
>
> The second half of this document specifies the owner's editing experience in Pages CMS, which
> is new.

---

## Part A: Visitor Experience (the static site)

### Primary Visitor Flow

```
Visitor opens the site
  └─► Single page, top to bottom
        ├─ Nav (fixed): wordmark · Work · About · Contact · theme switcher · mobile menu
        ├─ Hero: eyebrow · name · intro · [View Work] [Get in Touch] · portrait
        ├─ Selected Work (#work)
        │    ├─ CategoryBar: Films | Series | News Features | Music Video | Reels | Writing
        │    │               | Exhibitions | Workshops & Teaching | Improv | Cyanotypes
        │    ├─ Writing only: tag sub-filter chips (All · <tags present in Writing>)
        │    ├─ Cyanotypes only: masonry image gallery
        │    ├─ All other categories: 3-column ProjectCard grid
        │    └─ Category with zero projects: "Coming soon" empty state
        ├─ About (#about): three paragraphs · Education list
        ├─ Contact (#contact): "Let's work together." · Phone · Email · Instagram
        └─ Footer: copyright · tagline
```

**Key structural rules:**
- One page, no router. Nav links are hash anchors with smooth scroll.
- Category selection is client-side state, defaults to `Films`, and resets the Writing sub-filter.
- Theme (light or dark) is client-side state persisted in `localStorage`, exactly as today.
- Every piece of text on the page except the category names, the "Coming soon" copy and the
  link call-to-action labels comes from `content/`.

### Component Inventory

| Component | Source today | After refactor | Reads from |
|-----------|--------------|----------------|------------|
| `App` | `App.tsx` (everything) | Composition only: Nav, Hero, Work, About, Contact, Footer | `site`, `projects` |
| `Nav` | inline in `App` | `src/components/Nav.tsx` | `site.hero.name` for the wordmark |
| `Hero` | inline in `App` | `src/components/Hero.tsx` | `site.hero` |
| `Work` | inline in `App` | `src/components/Work.tsx` (category state, filtering, sub-filter, gallery vs grid) | `projects`, `CATEGORIES` |
| `CategoryBar` | `App.tsx` function | `src/components/CategoryBar.tsx`, unchanged | `CATEGORIES` |
| `ProjectCard` | `App.tsx` function | `src/components/ProjectCard.tsx` + **[NEW]** placeholder and link CTA | one `Project` |
| `ProjectPlaceholder` | none | **[NEW]** `src/components/ProjectPlaceholder.tsx` | `project.title`, `project.category` |
| `CyanotypeGallery` | inline in `Work` | `src/components/CyanotypeGallery.tsx` | Cyanotype `projects` |
| `About` | inline in `App` | `src/components/About.tsx` | `site.about`, `site.education` |
| `Contact` | inline in `App` | `src/components/Contact.tsx` | `site.contact` |
| `Footer` | inline in `App` | `src/components/Footer.tsx` | `site.hero.name`, `site.footer.tagline` |
| `ThemeSwitcher` | `App.tsx` function | `src/components/ThemeSwitcher.tsx`, unchanged | `THEMES` |
| `THEMES`, `Theme` | `App.tsx` | `src/theme.ts`, unchanged values | none |
| `CATEGORIES`, `Category` | `App.tsx` | `src/content/categories.ts` | none (fixed list) |

### Section 1: Hero

Baseline (preserve exactly): eyebrow in small caps, two-line display name with the surname in
italic, one-paragraph intro, two buttons, portrait at 3:4 on the right (above on mobile) with a
multiply overlay in dark theme.

| Field | Today (hardcoded) | Source after |
|-------|-------------------|--------------|
| Eyebrow | `Filmmaker · Writer · Cyanotype Artist` | `site.hero.eyebrow` |
| Name line 1 / 2 | `Anoushka` / `Mathews` | `site.hero.firstName` / `site.hero.lastName` |
| Intro | `Bangalore-based documentary filmmaker with 12 years...` | `site.hero.intro` |
| Portrait | `/anoushka-portrait.jpg` (missing) | `site.hero.portrait` (image path) |

| State | Trigger | UI Behavior |
|-------|---------|-------------|
| **Portrait present** | `site.hero.portrait` set and file exists | Image shown as today |
| **Portrait missing** | field empty | **[NEW]** Muted surface block at 3:4 with no image, no broken-image icon |

### Section 2: Selected Work

Baseline (preserve exactly): "Selected Work" eyebrow, "Portfolio" display heading, category
bar with underline on active item, bottom border, then the content area.

**Ordering [NEW, makes implicit explicit]:** within a category, projects sort by `order`
ascending when set, then by `year` descending, then by title. Projects with no `order` come
after all projects that have one.

| State | Trigger | UI Behavior |
|-------|---------|-------------|
| **Grid** | Category has projects and is not Cyanotypes | 1 / 2 / 3 column `ProjectCard` grid at mobile / sm / lg |
| **Gallery** | Category is Cyanotypes and has projects | Intro paragraph (`site.work.cyanotypeIntro`) + 2 / 3 / 4 column masonry of images, hover scale |
| **Writing sub-filter** | Category is Writing | **[CHANGED]** chips are `All` + the distinct `tags` found on Writing projects, in first-seen order; selecting one filters the grid |
| **Empty** | Category has zero projects | "Coming soon" in italic display font + "`{Category}` work will be added here shortly." Driven by count, not by a sentinel project |
| **Gallery item without image** | Cyanotype project with no `thumbnail` | Item is skipped in the gallery (a gallery of placeholders has no value) |

### Section 3: ProjectCard

Baseline (preserve exactly): 16:9 image area on muted surface with hover scale, then client
in small caps, tag chips, title in display font, description, `Role: ...`, year.

| Element | Field | Rule |
|---------|-------|------|
| Image | `thumbnail` | `<img loading="lazy">`, `alt` is the title, `object-cover` |
| **[NEW]** Placeholder | no `thumbnail` | `ProjectPlaceholder`: title set in the display font at large size, lower-left, on the muted surface, plus the category in small caps top-left. Must look intentional, not broken |
| Client | `client` | Hidden when empty |
| Tags | `tags[]` | Hidden when empty |
| Title | `title` | Required |
| Description | `description` | Required |
| Role | `role` | Hidden when empty |
| Year | `year` | Hidden when empty |
| **[NEW]** Link CTA | `link` | Hidden when empty. Otherwise a small text button at the bottom of the card: label from `linkLabel` if set, else by category: Films, Series, Music Video, Reels → `Watch`; Writing, News Features → `Read`; everything else → `View`. Opens in a new tab with `rel="noopener noreferrer"`. The whole image area is also wrapped in the same link when `link` is set |

| State | Trigger | UI Behavior |
|-------|---------|-------------|
| **Image loading** | lazy image not yet fetched | Muted surface shows (same colour as placeholder), no layout shift because the container is fixed 16:9 |
| **Image failed** | 404 on the image path | **[NEW]** `onError` swaps to `ProjectPlaceholder`, so a bad path never shows the browser's broken-image icon |

### Section 4: About

Baseline (preserve exactly): two-column layout, small-caps "About" label on the left, body on
the right: one lead paragraph at larger size, then further paragraphs, then an Education list
with degree, institution and year per row.

| Field | Source after |
|-------|--------------|
| Lead paragraph | `site.about.lead` |
| Further paragraphs | `site.about.paragraphs[]` (zero or more) |
| Education rows | `site.education[]` with `degree`, `institution`, `year` |

| State | Trigger | UI Behavior |
|-------|---------|-------------|
| **No education entries** | array empty | Education heading and list hidden entirely |

### Section 5: Contact

Baseline (preserve exactly): two-column layout, "Let's work / together." in display font, then
rows of label + value as links.

| Row | Field | Link |
|-----|-------|------|
| Phone | `site.contact.phone` | `tel:` with non-digits stripped |
| Email | `site.contact.email` | `mailto:` |
| Instagram | `site.contact.instagram` (handle without @) | `https://instagram.com/{handle}`, new tab |

Rows whose field is empty are hidden. The heading copy comes from `site.contact.heading` (two
lines, second italic, as today).

### Section 6: Footer

`© {currentYear} {firstName} {lastName}` on the left, `site.footer.tagline` on the right. The
year is computed, not stored (today it is hardcoded to 2024).

### Accessibility Notes (baseline plus)

- All images have `alt` text equal to the project title. Placeholder blocks are `aria-hidden`
  because the title is already rendered as text in the card.
- Link CTA has an accessible name that includes the title: `aria-label="Watch We Heart to Vote"`.
- Category bar buttons use `aria-pressed` for the active category.
- Theme switcher unchanged.
- Skip link: enable the bypass link that the Figma config had turned off. One `Skip to work`
  link targeting `#work`.

---

## Part B: Owner Experience (Pages CMS)

### Primary Owner Flow

```
Owner opens app.pagescms.org
  └─► Sign in with GitHub
        └─► Picks repo salus-sage/punoushkamathews.com (branch: main)
              ├─► Projects (collection)
              │     ├─ list view: thumbnail · title · category · year, searchable
              │     ├─ [Add] → empty form → Save → commit → deploy
              │     ├─ click row → form → edit → Save → commit → deploy
              │     └─ [Delete] → confirm → commit → deploy
              ├─► Site settings (single file)
              │     └─ Hero · About · Education · Contact · Footer · Work intro → Save
              └─► Media
                    └─ browse / upload / delete files in public/media
```

### Projects collection: form layout

Fields in this order, with the exact labels and helper text the owner will see.

| # | Label | Field | Type | Required | Helper text |
|---|-------|-------|------|----------|-------------|
| 1 | Title | `title` | string | yes | "Name of the film, article, exhibition or workshop." |
| 2 | Category | `category` | select, values = the ten categories | yes | "Which tab this appears under." |
| 3 | Client or publisher | `client` | string | no | "Who it was made for or published by. Leave blank for personal work." |
| 4 | Description | `description` | text (multi-line) | yes | "One or two sentences. This is what visitors read on the card." |
| 5 | Your role | `role` | string | no | "For example: Director, Editor." |
| 6 | Year | `year` | string, pattern `^\d{4}$` | no | "Four digits, for example 2024. Used to order projects, newest first." |
| 7 | Link to the work | `link` | string, pattern `^https?://` | no | "YouTube, Vimeo, article or exhibition page. Opens in a new tab." |
| 8 | Link button label | `linkLabel` | string | no | "Leave blank to use Watch, Read or View automatically." |
| 9 | Thumbnail | `thumbnail` | image, media `images` | no | "Landscape still, at least 1400px wide. Large files are resized automatically after upload." |
| 10 | Tags | `tags` | string, list | no | "Only used for the Writing tab filters, for example: Disability." |
| 11 | Manual order | `order` | number | no | "Lower numbers appear first within the category. Leave blank to sort by year." |

List view: primary field `title`, sort by `year` descending, columns `thumbnail`, `title`,
`category`, `year`. Search enabled.

Filename on create: `{primary}.json`, so a project titled "We Heart to Vote" becomes
`content/projects/we-heart-to-vote.json`. The filename is the slug and does not change when the
title is later edited.

### Site settings: form layout

A single file `content/site.json` presented as grouped sections.

| Section | Fields |
|---------|--------|
| Hero | `eyebrow` (string), `firstName` (string, required), `lastName` (string, required), `intro` (text), `portrait` (image) |
| About | `lead` (text, required), `paragraphs` (text, list) |
| Education | list of objects: `degree` (string), `institution` (string), `year` (string). Collapsible, summary `{degree}` |
| Contact | `heading` (string), `phone` (string), `email` (string, pattern email), `instagram` (string, helper "Handle without the @") |
| Work | `cyanotypeIntro` (text) |
| Footer | `tagline` (string) |
| Meta | `title` (string, browser tab title), `description` (text, search engine description) |

### Owner state definitions

| State | Trigger | What the owner sees | What we do about it |
|-------|---------|---------------------|---------------------|
| **Saved, deploying** | Save clicked | Pages CMS toast confirming the commit | Owner guide says: wait two to three minutes, then hard refresh |
| **Deployed** | Actions run green | Live site updated | Nothing. Optional: the guide links to the repo's Actions tab |
| **Validation failed** | A required field left blank | Pages CMS inline error, save blocked | Pages CMS handles this |
| **Build failed on content** | A value passes the CMS but fails our schema (should be rare since both enforce the same rules) | Live site unchanged, no error shown to the owner | Actions emails the repo owner (developer). Developer fixes the file. Guide tells the owner "if it hasn't changed in ten minutes, message me" |
| **Image too large** | Owner uploads a 12 MB still | Upload succeeds, site deploys with the resized version | Optimisation step in the same workflow run resizes before build |
| **Image not showing** | Owner typed a path manually or deleted a media file still in use | Card shows the typographic placeholder, never a broken icon | `onError` fallback plus schema check that referenced files exist |
| **Deleted project by mistake** | Delete confirmed | Project gone from site | Developer restores from git history. Guide says to message the developer |

### Owner guide (deliverable of TASK-008)

One page, `docs/OWNER-GUIDE.md`, written for a non-technical reader, covering: signing in,
adding a project, editing a project, uploading or replacing an image, editing About and
Contact, what to expect after saving, and who to contact when something looks wrong. Also
exported as a PDF handed to the owner.

---

## Approvals

- Owner: Anoushka Mathews - [Date]
- Engineering: Bhanu Prakash - [Date]
