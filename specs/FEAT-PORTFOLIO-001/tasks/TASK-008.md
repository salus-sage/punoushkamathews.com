# TASK-008: Repository Settings, Owner Guide and Handover Dry Run

**Feature:** FEAT-PORTFOLIO-001 Static Portfolio + Pages CMS
**Layer:** Operations and documentation
**Status:** Ready for implementation
**Depends on:** Part A has no dependencies and unblocks TASK-005 live verification. Parts B and
C depend on TASK-007

---

## Context

Several steps in this feature happen in GitHub's UI or the Pages CMS UI rather than in the
repo, and they need the developer's GitHub session. This task collects them so nothing is
forgotten, and it produces the one document the owner will actually read.

Decisions this task implements: repo public (free Pages), direct commits to `main` with no
review gate, owner as collaborator with write access, Pages CMS hosted.

---

## Task

**Part A - GitHub settings (can run first, before TASK-005).**
Make the repo public, enable Pages with GitHub Actions as the source, protect `main` against
force-push and deletion, invite the owner as a collaborator.

**Part B - Pages CMS access.**
Install the Pages CMS GitHub App on this repo, sign in as the developer to confirm it works,
then confirm the owner can sign in and sees the same editor.

**Part C - Owner guide and dry run.**
Write `docs/OWNER-GUIDE.md`, export it to PDF, and run a supervised session where the owner
publishes a change unassisted.

---

## Acceptance Criteria

**Part A**
- [ ] Before flipping visibility: `git log -p | grep -iE "token|secret|password|api[_-]?key"`
  and a scan of `content/site.json` confirm nothing sensitive is in history. The phone and
  email in `site.json` are already public on the live site and are accepted
- [ ] Repository visibility set to **Public** (`gh repo edit --visibility public
  --accept-visibility-change-consequences`)
- [ ] Settings → Pages → Source = **GitHub Actions** (`gh api -X POST
  repos/salus-sage/punoushkamathews.com/pages -f build_type=workflow` or via UI)
- [ ] Branch protection or a ruleset on `main`: block force pushes and deletions. **Do not**
  require pull requests or status checks, since the owner's CMS saves and the optimiser bot
  commit go straight to `main`
- [ ] Settings → Actions → General → Workflow permissions = **Read and write** (needed for the
  commit-back step even though the workflow declares `contents: write`)
- [ ] Owner invited as collaborator with **Write** role (`gh api -X PUT
  repos/salus-sage/punoushkamathews.com/collaborators/<owner-login> -f permission=push`). Owner's
  GitHub login recorded in the task output, not in the spec

**Part B**
- [ ] Pages CMS GitHub App installed on `salus-sage/punoushkamathews.com` only (not all repos)
- [ ] Developer signs in at `app.pagescms.org`, selects the repo and `main`, sees Projects and
  Site settings
- [ ] Owner signs in with their own GitHub account and sees the same. If the repo does not
  appear, confirm the collaborator invitation was accepted and the App is installed on the
  repo

**Part C**
- [ ] `docs/OWNER-GUIDE.md` exists, under 1,000 words, plain language, no git or developer
  terms, with screenshots in `docs/images/` (optimised, under 200 KB each). Sections:
  1. What this is (one paragraph)
  2. Signing in (URL, "Sign in with GitHub", pick the site)
  3. Adding a project (field by field, what each means, which are required)
  4. Editing or removing a project
  5. Adding or replacing an image (JPEG only, landscape, big is fine, it gets resized)
  6. Editing About, Education and Contact
  7. After you save (two to three minutes, hard refresh, demo URL)
  8. When something looks wrong (what to check, then "message Bhanu", with the fact that
     nothing is ever lost because every change is kept in history)
  9. Things only Bhanu can change (categories, design, the web address)
- [ ] The same content exported to `docs/OWNER-GUIDE.pdf` and sent to the owner
- [ ] Dry run completed: on the owner's own device, with the developer watching but not
  touching, the owner (a) adds a project with an image, (b) edits an existing project's
  description, (c) changes a Contact field, and all three are live within three minutes
  each. Any confusion observed is fixed in the guide or in `.pages.yml` helper text and the
  dry run step is repeated
- [ ] `README.md` gains a "For the owner" line linking to the guide

---

## Files to Touch

**Create:**
- `docs/OWNER-GUIDE.md`
- `docs/OWNER-GUIDE.pdf`
- `docs/images/*.jpg` (screenshots)

**Modify:**
- `README.md`

**GitHub settings (not files):** visibility, Pages source, branch ruleset, Actions
permissions, collaborator, Pages CMS App installation

---

## Constraints

- Do not add the owner's personal GitHub login, email or phone to anything under `specs/`.
- Do not enable "Require a pull request before merging" or required status checks on `main`.
- Do not install the Pages CMS App with access to all repositories.
- The guide is written for a non-technical reader. Test: if a sentence contains "commit",
  "repo", "branch", "JSON", "deploy" or "Actions", rewrite it.
- Guide images must go through `pnpm optimize-images`-equivalent sizing before commit; they
  live outside `public/media` so the CI optimiser does not touch them.

---

## How to Verify

```bash
gh repo view salus-sage/punoushkamathews.com --json visibility -q .visibility     # PUBLIC
gh api repos/salus-sage/punoushkamathews.com/pages -q .build_type                  # workflow
gh api repos/salus-sage/punoushkamathews.com/collaborators -q '.[].login'          # includes the owner
gh api repos/salus-sage/punoushkamathews.com/rulesets -q '.[].name'                # main protection present
wc -w docs/OWNER-GUIDE.md                                                 # < 1000
grep -niE "commit|repo|branch|json|deploy|actions" docs/OWNER-GUIDE.md    # expect nothing
```
