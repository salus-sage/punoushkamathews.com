# TASK-009: Custom Domain Switch

**Feature:** FEAT-PORTFOLIO-001 Static Portfolio + Pages CMS
**Layer:** Operations - production cutover
**Status:** Specified, deferred until the owner has a domain
**Depends on:** TASK-008 complete; a domain registered and its DNS editable by the developer
or the owner

---

## Context

The demo lives at `https://salus-sage.github.io/punoushkamathews.com/`. The build already reads its
base path from `VITE_BASE_PATH`, and the workflow sets that to `/` whenever `public/CNAME`
exists (TASK-005). So the cutover is: add the `CNAME` file, point DNS at GitHub Pages, enable
HTTPS, and update the one URL in the owner guide.

Facts about GitHub Pages custom domains that this task relies on:
- An apex domain (`example.com`) needs four `A` records to GitHub Pages' IPs (currently
  `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`) and optionally
  `AAAA` records. Verify the current list in GitHub's docs at execution time.
- A `www` subdomain needs a `CNAME` record to `salus-sage.github.io`.
- GitHub provisions a Let's Encrypt certificate automatically once DNS resolves; "Enforce
  HTTPS" can be ticked after that, typically within an hour.
- Pages only honours the `CNAME` file if it is in the deployed artifact root, which Vite
  achieves by placing it in `public/`.
- Verifying the domain under the GitHub **account** settings (Pages → Add a domain) protects
  against takeover if the Pages site is later removed.

---

## Task

Cut the site over from the demo URL to the owner's domain with zero code changes.

---

## Acceptance Criteria

- [ ] Domain decision recorded in the task output: apex, `www`, or both with a redirect
  (recommended: serve on apex, `www` CNAME to the Pages host so GitHub redirects it)
- [ ] Domain verified at the account level in GitHub (Settings → Pages → Verified domains)
  with the provided `TXT` record
- [ ] DNS records created as per the facts above; `dig +short <domain>` returns the four
  GitHub IPs and `dig +short www.<domain>` returns `salus-sage.github.io.`
- [ ] `public/CNAME` added containing exactly the domain with no protocol and a trailing
  newline. Committed with `chore: add custom domain`
- [ ] The deploy run for that commit builds with base `/` (visible in the run log from the
  base path step) and `dist/CNAME` is in the artifact
- [ ] Repository Settings → Pages shows the custom domain with a green check; after the
  certificate is issued, **Enforce HTTPS** is ticked
- [ ] `curl -sI https://<domain>/` returns 200, `https://<domain>/media/placeholder.jpg`
  returns 200, and `https://salus-sage.github.io/punoushkamathews.com/` redirects to the domain
- [ ] `content/site.json` `meta` unchanged; `og:` tags need no absolute URLs today
- [ ] `docs/OWNER-GUIDE.md` and `README.md` replace the demo URL with the domain; the PDF is
  re-exported and re-sent
- [ ] Optional, if the owner wants search presence: submit the domain in Google Search
  Console using the DNS `TXT` verification method, and note it in the task output

---

## Files to Touch

**Create:**
- `public/CNAME`

**Modify:**
- `docs/OWNER-GUIDE.md`, `docs/OWNER-GUIDE.pdf`, `README.md`

**Do not touch:**
- `vite.config.ts`, `.github/workflows/deploy.yml` (already domain-aware), `src/`

---

## Constraints

- No code change. If something in `src/` or the workflow needs editing to make the domain
  work, that is a bug in TASK-004 or TASK-005 and is fixed under that task's rules.
- Do not tick **Enforce HTTPS** before the certificate is issued; it fails silently.
- Do not delete the demo Pages deployment; GitHub handles the redirect from the
  `github.io` URL once the custom domain is set.
- Record registrar, DNS host and renewal date in the task output so the owner has it.

---

## How to Verify

```bash
dig +short <domain>                       # four 185.199.x.153 addresses
dig +short www.<domain>                   # salus-sage.github.io.
gh api repos/salus-sage/punoushkamathews.com/pages -q '{cname: .cname, https: .https_enforced, status: .status}'
curl -sI https://<domain>/ | head -1                        # HTTP/2 200
curl -sI https://salus-sage.github.io/punoushkamathews.com/ | grep -i location   # https://<domain>/
```
