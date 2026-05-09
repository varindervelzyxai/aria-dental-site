# Agent Changes — aria-dental-site / how-it-works.html

## 2026-05-08 — Removed "48 hours" deploy claim from /how-it-works

Stripped every "Live in 48 hours" / "48 hours" / "48-hour" / `PT48H` claim from `how-it-works.html`. Rationale: the 48-hour deploy promise was too aggressive and contradicted timeline language elsewhere on the site. Replaced with value-led, time-neutral copy. No structural changes to the page; classes, IDs, schema scaffolding, and the 6-step process all preserved.

### References found and removed: 3

1. **Hero H1 (line 112)**
   - Before: `<h1 class="page-hero-title">Live in <span>48 hours.</span></h1>`
   - After:  `<h1 class="page-hero-title">How Aria comes <span>online.</span></h1>`
   - Note: chose "How Aria comes online." over "From discovery call to live." because the existing subhead already ends with "before we go live" — the alternate headline would have stuttered on "live."

2. **Bottom CTA section (line 212)**
   - Before: `<p>30-minute discovery call. Live in 48 hours. We respond within 24 hours.</p>`
   - After:  `<p>30-minute discovery call. We respond within 24 hours.</p>`

3. **JSON-LD HowTo schema (line 76)**
   - Before description: `"Get Aria live in 48 hours — from discovery call to AI receptionist answering your phones, booking patients, and verifying insurance."`
   - After description:  `"From a 30-minute discovery call to a live AI receptionist answering phones, booking patients, and verifying insurance."`
   - Also removed: `"totalTime":"PT48H",` (no replacement — page no longer commits to a specific duration).

### Untouched (intentionally)

- Hero subhead (line 113) — still includes the phrase "before we go live" as instructed; that's a process descriptor, not a deploy-time claim.
- Title tag (line 11), `<meta name="description">` (line 12), `og:title`, `og:description`, `twitter:title`, `twitter:description` (lines 19–30) — none of these contained "48 hours" / "48-hour" / "PT48H" before the edit, so nothing to strip.
- All 6 onboarding steps, "What's Included" cards, "A Day With Aria" timeline, demo cards, footer, scripts.

### Validation

- `grep -in "48 hour\|48-hour\|48hr\|live in 48\|PT48H" how-it-works.html` → 0 matches.
- HTML tag structure verified balanced (no unmatched/mismatched/unclosed tags).
- All 6 JSON-LD blocks parse cleanly as JSON (HowTo, Organization x2, WebSite, SoftwareApplication, BreadcrumbList).
