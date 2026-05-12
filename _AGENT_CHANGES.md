# Aria Demos Cleanup — Agent Changes

**Purpose:** Remove the "See It In Action / Watch Aria close patients in real time" 3-card section sitewide and delete the orphan destination pages those cards linked to.

**Base:** `aria-widen-all/` (latest merged staging). This overlay applies on top of that.

---

## 1. Pages where the section was found & removed

| File | Eyebrow / headline found | What was removed |
|---|---|---|
| `how-it-works.html` | `See It In Action` / `Watch Aria close patients in real time.` | The full `<section class="section-alt">` block (HTML comment `<!-- INTERACTIVE DEMOS -->` through closing `</section>`). Section had `.container-wide` wrapper and 3 inline-styled `<a>` cards linking to `/demo-booking`, `/demo-gcal`, `/demo-reschedule`. |
| `portfolio.html` | `See It In Action` / `Watch Aria close patients in real time.` | The full `<section class="section-alt">` block, sitting between the vs-grid section and the CTA section. Same 3 inline-styled cards. (No HTML comment marker on this one.) |
| `demo.html` | `Interactive Demos` / `See exactly how Aria closes patients.` | The full `<section>` block marked `<!-- INTERACTIVE DEMOS -->` with the 3 `a.demo-card` elements. **Also removed the scoped `/* DEMO CARDS FIX */` CSS rule block** from the `<style>` element (lines defining `a.demo-card`, `.dc-header`, `.dc-title`, `.dc-sub`, `.dc-body`, `.dc-time`, `.dc-btn`) — that CSS was only used by the removed cards. |

Page-flow verified: in all three files the CTA section now follows directly after the prior content block with no orphaned wrappers, no broken nesting, no JS handlers left dangling.

The audit-flagged copy on demo.html used different wording ("Interactive Demos" / "See exactly how Aria closes patients" rather than "See It In Action" / "Watch Aria close patients") but it was the same 3-card pattern with the same 3 destinations, so it was treated as the same block.

## 2. Orphan destination pages — handled

| File | Inbound links after section removal | Decision |
|---|---|---|
| `demo-booking.html` | None | **DELETE** from repo |
| `demo-gcal.html` | None | **DELETE** from repo |
| `demo-reschedule.html` | None | **DELETE** from repo |
| `demo.html` | ~13 inbound links remaining (`who-we-help.html` ×5, `ai-for-dentists.html` ×3, `compare.html` ×2, `dental-insurance-verification-ai.html` ×2, `dental-missed-calls-ai.html` ×2, `verify-insurance-during-the-call.html`, `do-automated-reminders-reduce-dental-no-shows.html`, `after-hours-dental-answering-service.html` ×2, `how-much-do-missed-calls-cost-dental-practice.html`, `ai-for-dental-groups.html`, `blog.html`) | **KEEP** — flagged. Page still renders the audio call player + "What your demo will cover" block; only the 3-card section was excised. |

**Action required at deploy time:** delete these files from the repo manually (this overlay does not include them):
- `demo-booking.html`
- `demo-gcal.html`
- `demo-reschedule.html`

## 3. vercel.json — redirects added

Three new 301 entries inserted in the `redirects` array (right after the `/case-studies/:slug*` entry, before the `/pricing` entry):

```json
{ "source": "/demo-booking",    "destination": "/demos", "permanent": true },
{ "source": "/demo-gcal",       "destination": "/demos", "permanent": true },
{ "source": "/demo-reschedule", "destination": "/demos", "permanent": true }
```

Used `permanent: true` only (no `statusCode` field, per the mutual-exclusivity rule).

`/demo` was **not** redirected — `demo.html` is being kept since many other pages still link to it.

## 4. sitemap.xml — entries removed

Removed these three URL entries:
- `https://www.ariadental.ai/demo-booking`
- `https://www.ariadental.ai/demo-gcal`
- `https://www.ariadental.ai/demo-reschedule`

`/demos` (the canonical audio-demos page) is still present in the sitemap (line 41, `lastmod 2026-05-09`). `/demo` is also still present (it's still a live page).

## 5. Audio assets

- `audio/aria-call-demo.mp3` — **still in use** by `demo.html`'s audio call player (line `<audio id="audio">...<source src="aria-call-demo.mp3">`). Do not delete. The note in the original task brief suggesting it might be unused was inaccurate for this codebase state — the homepage may no longer reference it, but the `/demo` page does.

## 6. Verification

All run against the staged folder after edits — all returned 0 hits:

```
rg "Watch Aria close patients" .                           → 0
rg "See It In Action" .                                    → 0
rg "Full Patient Journey" .                                → 0
rg "Book → Google Calendar" .                              → 0
rg "Reschedule → Calendar Updates" .                       → 0
rg "Old slot removed" .                                    → 0
rg 'href="/demo-' .                                        → 0
rg 'href="/demo"' .                                        → 0  (in staged files; still present in unchanged pages that link to /demo — intentional, that page stays)
```

## 7. Files in this overlay

```
how-it-works.html   (modified — 3-card section removed)
portfolio.html      (modified — 3-card section removed)
demo.html           (modified — 3-card section + scoped CSS removed)
vercel.json         (modified — 3 redirects added)
sitemap.xml         (modified — 3 entries removed)
_AGENT_CHANGES.md   (this file)
```

## 8. Constraints honored

- Homepage booking demo: not touched.
- Audio demos page `/demos`: not touched.
- Insurance demo: not touched.
- Navigation links to `/demos`: not touched.
- No prose blocks modified — only the specific 3-card section.
- `permanent` + `statusCode` mutual-exclusivity respected in vercel.json.

## 9. Anything tricky

- The 3-card section on `demo.html` had different copy (`Interactive Demos` / `See exactly how Aria closes patients`) and used a `.demo-card` class with its own scoped CSS rather than inline styles. Both the section and the scoped CSS rules were removed. The `.demo-card` class is also used on `demos.html` (the audio demos page) — that file is untouched and has its own CSS for the class, so removing it from `demo.html` doesn't affect `demos.html`.
- `demo.html` is kept (still heavily linked from CTAs across the site) but the 3-card section is gone, so the page now ends with the audio call player + "What your demo will cover" block, then straight to the CTA — flow verified.
