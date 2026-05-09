# Aria Dental — Container Widening Pass

**Date:** 2026-05-09
**Bundle:** `/Users/varinderkumar/Downloads/aria-widen-all/`
**Goal:** Widen specific sections from 1280px → 1440px container, in place, on a list of pages — without touching skip sections.

---

## Summary

- **Files modified:** 17 (14 EN + 3 ES)
- **Sections widened:** 38 sections + 5 inline persona max-width bumps + 1 inline alphabet-nav bump + 1 grid template fix + 1 methodology max-width bump + 1 table max-width bump
- **CSS modifier added:** `.section-block.is-wide .container{max-width:1440px}` (injected on 3 pages)

---

## CSS modifier pattern (one line)

```
.section-block.is-wide .container{max-width:1440px}
```

Injected on `pricing.html`, `case-studies.html`, `integrations.html` immediately after the existing `.section-block .container{max-width:1080px}` rule.

---

## Per-file changes

### EN pages

| File | Changes |
|------|---------|
| `index.html` | 6 sections: `.container` → `.container-wide` (After the Booking, What Makes Aria Different, Built For, At a Glance / What changes, Integrations, Common Questions). |
| `how-aria-compares.html` | 4 sections: `.container` → `.container-wide` (Four categories, Feature by feature, Three real scenarios, When you should not pick Aria). Plus inline `max-width:1100px` → `max-width:1400px` on the comparison table wrapper. |
| `compare.html` | 3 sections: `.container` → `.container-wide` (cp-table Feature by Feature, cp-cost-grid The Cost Difference, FAQ Comparison questions). Cost Difference also dropped `cp-prose` from the wrapper to allow widening. |
| `roi-calculator.html` | 3 sections: `.container` → `.container-wide` (calc-grid + insight-cards, methodology / Where these numbers, Cross-links / Related). Plus `.methodology` inline rule bumped from `max-width:800px` → `max-width:1300px`. |
| `integrations.html` | CSS modifier injected. 2 section-blocks marked `is-wide` (Practice Management Systems grid; Phone/Calendar/Payments/CRM stacked grids). |
| `platform.html` | 2 sections: `.container` → `.container-wide` (Every touchpoint covered features-grid; Capacity cap-table). |
| `how-it-works.html` | 2 sections: `.container` → `.container-wide` (What's Included / Everything your front office needs 9-card grid; See It In Action 3-card auto-fit). |
| `portfolio.html` | 4 sections: `.container` → `.container-wide` (Live Client / WizKids 16-feature card; Live with OpenDental in-production card; Monday morning vs-grid; See It In Action). Also bumped `.case-features` grid-template-columns from `1fr 1fr` → `repeat(auto-fit,minmax(280px,1fr))` so the 16 case-features flow to 3-4 cols at the wider canvas. |
| `pricing.html` | CSS modifier injected. 2 section-blocks marked `is-wide` (3-tier pricing grid; What everyone gets 6-card grid). |
| `who-we-help.html` | 5 persona section wrappers bumped from inline `max-width:880px` → `max-width:1200px` (#solo-practice-owner, #office-manager, #dso-operations, #specialty-practice, #startup-practice). Hero (sub-jump anchor list) left at 880px. |
| `workflow.html` | 1 section: `.container` → `.container-wide` (Patient Calls / Reschedule / SMS Booking interactive panel-grid). |
| `case-studies.html` | CSS modifier injected. 2 section-blocks marked `is-wide` (WizKids featured 2-col case-study-feature; More stories coming soon 5-card placeholder grid). |
| `glossary.html` | 1 inline cap bumped: alphabet-nav wrapper `max-width:880px` → `max-width:1200px`. Hero + definition list wrappers left untouched. |
| `blog.html` | 1 section: `.container` → `.container-wide` (the section-alt holding featured card + all 25+ blog cards). |

### ES pages

| File | Changes |
|------|---------|
| `es/index.html` | 1 section: `.container` → `.container-wide` (Por qué Aria features-grid). |
| `es/platform.html` | 1 section: `.container` → `.container-wide` (Una plataforma / Cada punto de contacto features-grid). |
| `es/demos.html` | 1 section: `.container` → `.container-wide` (Escuchar / Tres llamadas reales features-grid). |

### ES pages reviewed but NOT modified

- `es/integrations.html` — prose-only structure, no PMS card grid or section-block CSS. Nothing to widen cleanly.
- `es/case-studies.html` — prose-only structure, no card grid, no section-block CSS. Nothing to widen cleanly.
- `es/pricing.html` — single-tier pricing card capped to 680px (different structure from English 3-tier). No section-block CSS. No tier-grid or "What everyone gets" 6-card grid. Nothing to widen cleanly.

---

## Verification grep results

| File | Counts |
|------|--------|
| `index.html` | 9 `container-wide` (3 pre-existing in hero/stats/demo + 6 new) |
| `how-aria-compares.html` | 4 `container-wide` + 1 `max-width:1400px` (table) = 5 |
| `compare.html` | 3 `container-wide` |
| `roi-calculator.html` | 3 `container-wide` + `.methodology` updated to 1300px |
| `integrations.html` | 1 modifier rule + 2 `section-block is-wide` instances + 1 cap rule = 4 occurrences of `is-wide` / `1080px` / `1440px` |
| `platform.html` | 2 `container-wide` |
| `how-it-works.html` | 2 `container-wide` |
| `portfolio.html` | 4 `container-wide`; case-features grid template updated |
| `pricing.html` | 1 modifier rule + 2 `is-wide` section-blocks; verification count = 4 across `is-wide`/`1440px`/`1080px` |
| `who-we-help.html` | `max-width:880px` count: 6 → 1 (only hero sub-jump remains); 5 new `max-width:1200px` |
| `workflow.html` | 1 `container-wide` |
| `case-studies.html` | 1 modifier rule + 2 `is-wide` section-blocks; count = 4 across `is-wide`/`1440px`/`1080px` |
| `glossary.html` | `max-width:880px` count: 3 → 2 (hero + definition list); 1 new `max-width:1200px` |
| `blog.html` | 1 `container-wide` |
| `es/index.html` | 1 `container-wide` |
| `es/platform.html` | 1 `container-wide` |
| `es/demos.html` | 1 `container-wide` |

---

## Pages where widening could not be applied cleanly

### `enterprise.html` — SKIPPED

The audit prescribed: "Comparison table — currently inside 780px-capped wrapper. Lift the wrapper to 1280-1440px." On reading the file, there is no `<table>` or comparison table on the page. The page is composed of prose sections in 780px wrappers plus two `.features-grid` blocks (Why enterprise groups choose Aria; Compliance & security at scale). The audit also says "DO NOT touch: HIPAA/controls 780px prose blocks" — which covers most of the page. With no clear comparison table to lift and the rest gated by "do not touch", enterprise.html was left unchanged. Recommend re-auditing this page with eyes on the actual current structure.

### `es/integrations.html`, `es/case-studies.html`, `es/pricing.html` — SKIPPED

These three Spanish pages have a different (prose-only) structure than their English counterparts — no card grids, no section-block CSS, and no tier-grid. The audit's "same widening rules" don't map to any selectable target. Left unchanged. If the design intent is to mirror the English layout, the Spanish pages will need to be rebuilt (or new card grids added) before widening rules apply.

---

## Pages with adjacent un-widened sections worth a future pass (noted, not changed)

- `enterprise.html` — the two `.features-grid` blocks (Why enterprise groups choose Aria; Compliance & security at scale) could plausibly benefit from `container-wide`, but they're inside 780px prose wrappers and the audit excluded them.
- `compare.html` — the `.cp-diffs` grid (3-col) was excluded by the audit ("DO NOT touch cp-diffs"). It currently sits inside a 800px `cp-prose` wrapper and could be a future widen candidate.
- `how-it-works.html` — the "Six steps" + "A Day with Aria" timelines are intentionally 720px single-col per audit. Confirmed; no change.
- `platform.html` — the patient-experience two-col with chat-demo (line 108 area) was excluded; it's already a balanced two-col layout that wouldn't benefit from more width.

---

## Constraints honored

- All edits made in place via `Edit` (no `Write` for HTML files).
- No new colors, fonts, or component variants introduced.
- No JS touched (booking-viz unaffected).
- All sections marked "Skip" / "DO NOT touch" left alone.
- Each file was Read at least once before editing.

---

## Deploy instructions

Drag everything from `/Users/varinderkumar/Downloads/aria-widen-all/` into the GitHub repo at `varindervelzyxai/aria-dental-site`, replacing existing files. Single commit. Vercel auto-deploys.
