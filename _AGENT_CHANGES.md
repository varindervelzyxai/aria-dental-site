# Aria FINAL Bundle — Cleanup Deploy

**Date:** 2026-05-11
**Source:** `aria-widen-all/` (merged staging) + `aria-final-fixes/` (homepage/vendor fix overlay)
**Bundle size:** 6.8 MB · 112 files

## Deploy Instructions (read first)

Drag the entire contents of `aria-FINAL/` into the `varindervelzyxai/aria-dental-site` GitHub repo root, choosing **Replace existing files** when prompted. Single commit. Vercel auto-deploys to `www.ariadental.ai`.

---

## Fix #1 — `/enterprise` is now visible and discoverable

- `enterprise.html` (24 KB, "Aria for Enterprise DSOs") carried forward into bundle.
- "Enterprise" link injected into the canonical nav between "Integrations" and "Security" on **85 pages** (every English page that has the main nav).
- "Enterprise" added to the **footer Product column** on **88 pages** (between Platform and How It Works).
- `sitemap.xml` already contained `/enterprise` entry (priority 0.85, lastmod 2026-05-08) — left in place.
- `vercel.json` reviewed — **no rewrites or redirects block `/enterprise`**. The file at the repo root will serve cleanly at `/enterprise` thanks to `cleanUrls: true`.

**Verify after deploy:** Visit `https://www.ariadental.ai/enterprise` — should render the DSO page. Click "Enterprise" in any page's nav — should land there.

---

## Fix #2 — Stale-nav pages synced

`portfolio.html`, `how-it-works.html`, `security.html`, `contact.html` all now use the canonical nav (Platform · How It Works · Demos · Portfolio · Compare · Integrations · **Enterprise** · Security · About · Español · Book a Demo). No more "Aria vs Weave / Aria vs Others" nav items anywhere in the bundle (the `aria-final-fixes` overlay had already rewritten these — Enterprise injection layered on top).

**Verify:** `rg -i "aria vs weave|aria vs others" *.html` → 0 hits (confirmed).

---

## Fix #3 — `/who-we-help` restored

Staged `who-we-help.html` is **35 KB / 315 lines** with full 5-persona content (Solo Practice Owner, Multi-Doctor Office Manager, DSO Operations Lead, Specialty Practice Owner, New Practice / Startup Dentist). Canonical nav with Enterprise link applied. The live site's "200 but empty body" was a previous deploy artifact — this version is whole.

---

## Fix #4 — `/case-studies` ↔ `/portfolio` loop broken

In `portfolio.html`, the "Read the WizKids story →" link previously pointed to `/case-studies`, which `vercel.json` 301s back to `/portfolio`. Changed to:

- Link: `<a href="#wizkids" class="case-link">See the WizKids deployment →</a>`
- Section: added `id="wizkids"` to the WizKids section so the anchor lands cleanly.

**Verify:** `rg 'href="/case-studies"' portfolio.html` → 0 hits (confirmed).

Other pages still link to `/case-studies` (faq, platform, integrations, etc.) — those produce a single clean 301 to `/portfolio`, which is the intended Vercel behavior. Not a loop.

---

## Fix #5 — `/pricing` (FLAGGED, NOT CHANGED)

`vercel.json` line 30-32 redirects `/pricing` → `/platform#pricing` (302, non-permanent). A standalone `pricing.html` exists in the bundle but is unreachable while this redirect is in place.

**Decision needed (no action taken):**
- (A) Keep redirect → pricing lives as a section on `/platform`. Current state.
- (B) Remove the `/pricing` rule from `vercel.json` → `pricing.html` becomes the live pricing page.

Default per task spec: **leave redirect in place**. Change `vercel.json` and re-deploy if you want option B.

---

## Bundle contents summary

| Category | Files |
|---|---|
| HTML pages (English) | 88 |
| HTML pages (Spanish, `/es/`) | 11 |
| `vercel.json` | Carried from source repo (unchanged from current production) |
| `sitemap.xml` | Carried from source repo (already had `/enterprise`) |
| `assets/booking-viz.{css,js}` | Carried from `aria-widen-all` |
| `assets/insurance-viz.{css,js}` | Added from `aria-insurance-demo` |
| `audio/demo-book-self.mp3` | Carried from `aria-widen-all` |
| `audio/demo-insurance-verification.mp3` | Added from `aria-insurance-demo` |
| `aria-call-demo.mp3`, `404.html`, build scripts | Carried |

Files from `aria-final-fixes/` (which fixed homepage vendor names + footer mailboxes) were overlaid on top of `aria-widen-all/`, then `Enterprise` nav-link injection layered on top of that. This bundle is the canonical state — re-deploying it cannot regress anything currently live.

---

## Post-deploy verification (run from terminal)

```bash
# /enterprise loads
curl -sI https://www.ariadental.ai/enterprise | head -1   # expect: HTTP/2 200

# /who-we-help has content
curl -s https://www.ariadental.ai/who-we-help | wc -c     # expect: >30000

# /case-studies 301s once, ends at /portfolio (no loop)
curl -sI -L https://www.ariadental.ai/case-studies | grep -E '^(HTTP|location)'

# nav contains Enterprise on a sample page
curl -s https://www.ariadental.ai/security | grep -o '/enterprise">Enterprise'
```

All four should pass within ~60 seconds of the Vercel deploy completing.
