# TASK-010: Move the Repository to the Site's Own GitHub Account

**Feature:** FEAT-PORTFOLIO-001 Static Portfolio + Pages CMS
**Layer:** Operations - ownership
**Status:** Ready, executed after the build-phase commit
**Depends on:** TASK-001 to TASK-007 committed on `main` in the original repo

---

## Context

Development happened under the developer's personal account (`bhanugs-aii`, repo
`punmathews`). The site's long-term home is the GitHub user account `salus-sage` and the repo
`punoushkamathews.com`, which already exists and is empty:
`https://github.com/salus-sage/punoushkamathews.com.git`. Because the destination already
exists, this is a remote switch and push, not a GitHub "transfer".

The build phase enforced the no-hardcoded-identity rule (`build.md`, Engineering Rules) so
that this move needs no code change. The repo name contains a dot, so the Pages project URL
is `https://salus-sage.github.io/punoushkamathews.com/` and the workflow's base path step
produces `/punoushkamathews.com/`, which Vite accepts as-is. Once the custom domain
`punoushkamathews.com` is live (TASK-009) the base becomes `/`.

Everything in TASK-008 (visibility, Pages source, rulesets, Actions permissions,
collaborator, Pages CMS App) is done against the new repo, not the old one.

---

## Task

Point `origin` at the new repo, push `main`, retire the old repo, then run TASK-008 against
`salus-sage/punoushkamathews.com`.

---

## Acceptance Criteria

- [ ] Pre-flight: `grep -rn "salus-sage\|bhanugs-aii\|punoushkamathews\|github.io" src scripts
  vite.config.ts .pages.yml .github` returns nothing. If it does, fix under the originating
  task first
- [ ] All build-phase work is committed on `main` locally (TASK-001 to TASK-007)
- [ ] `git remote set-url origin https://github.com/salus-sage/punoushkamathews.com.git` and
  `git push -u origin main` succeed; `gh repo view salus-sage/punoushkamathews.com` shows the
  commit
- [ ] `bhanugs-aii` is a collaborator with Write on the new repo (done 2026-10-02); admin-level settings are made while signed in as `salus-sage`
- [ ] The old repo `bhanugs-aii/punmathews` is archived (not deleted) with its description
  set to "Moved to salus-sage/punoushkamathews.com", so no one pushes to it by accident
- [ ] `README.md` `## Live URL` and, once written, `docs/OWNER-GUIDE.md` carry
  `https://salus-sage.github.io/punoushkamathews.com/`
- [ ] TASK-008 parts A, B and C are then executed against the new repo and their criteria
  hold there
- [ ] A `workflow_dispatch` run on the new repo is green and the site is live at the new
  Pages URL with working images (proves the base path derivation held with the dotted name)

---

## Files to Touch

**Modify:**
- `README.md` (already carries the new URL after the spec update on 2026-10-02; confirm)
- `docs/OWNER-GUIDE.md` when it exists

**GitHub settings (not files):** remote, old-repo archive, then everything in TASK-008

**Do not touch:**
- Anything else. A required code change here is a bug in an earlier task

---

## Constraints

- Push the full history, not a squash; the migration script and spec history are part of
  the record.
- Do not delete the old repo; archive it.
- Do the switch before TASK-008 so Pages, the Pages CMS App and the collaborator are only
  ever set up once, on the new repo.

---

## How to Verify

```bash
grep -rn "salus-sage\|bhanugs-aii\|punoushkamathews\|github.io" src scripts vite.config.ts .pages.yml .github ; echo "expect nothing"
git remote -v                                                       # salus-sage/punoushkamathews.com
gh repo view salus-sage/punoushkamathews.com --json visibility,owner,defaultBranchRef -q '{v:.visibility,o:.owner.login,b:.defaultBranchRef.name}'
gh repo view bhanugs-aii/punmathews --json isArchived -q .isArchived  # true
gh workflow run deploy.yml -R salus-sage/punoushkamathews.com && gh run watch -R salus-sage/punoushkamathews.com
curl -sI https://salus-sage.github.io/punoushkamathews.com/ | head -1  # 200
```
