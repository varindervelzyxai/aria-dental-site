# Layout fix — wider booking-viz on `/` and `/demos`

Built on top of `~/Downloads/aria-demos-home1/` (the Mike Patterson demo
refresh). Goal: stop the booking visualization from feeling squeezed into
a narrow column on wide viewports, and give the other `/demos` panel
cards more breathing room too.

## TL;DR

Three things were doing the squeezing:

1. Homepage — `<div style="max-width:980px;margin:0 auto">` inline-styled
   wrapper around the booking-viz, parented inside a `.container` (1280px).
2. Demos page — `.demo-card { max-width: 880px }` capping every panel
   (insurance, book-self, book-child, sms-billing, recall, history)
   regardless of content.
3. Both pages — only the booking-viz lived inside `.container` (1280px);
   it could have been in `.container-wide` (1440px) like the hero/stats-bar.

Fix: switch both demo sections to `.container-wide`, replace the inline
980px wrapper with class-based `.booking-viz-shell-wrap` (1320px max),
bump `.demo-card` to 1080px and add an `.is-viz` modifier at 1320px for
the booking-viz panel only. Bump grid gap and phone size on wider
viewports so the visualization scales with the new real estate.

The global page container was **not** widened. `.container` (1280px) and
`.container-wide` (1440px) are both already defined in `styles.css` and
in active use across the site (hero + stats-bar already used
`.container-wide`). The fix uses what was there.

## Selectors changed — old vs new

### `assets/booking-viz.css`

**New rules (added):**

```css
.booking-viz-shell-wrap { max-width: 1320px; margin: 0 auto }
.booking-viz-shell {
  background: var(--warm-white);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  padding: clamp(20px, 3vw, 44px);
  box-shadow: var(--shadow-md);
}
@media (min-width: 1100px) { .booking-viz { gap: 36px } }
@media (min-width: 1320px) { .booking-viz { gap: 48px } }
@media (min-width: 1100px) { .bv-phone { max-width: 300px } }
@media (min-width: 1320px) { .bv-phone { max-width: 320px } }
```

No existing rules were modified — only additive. Existing 880px
breakpoint (`grid-template-columns: 1.15fr 0.85fr; gap: 24px`) and the
mobile-stack default are unchanged.

### `index.html`

| Line | Old | New |
| --- | --- | --- |
| 157 | `<section class="section"><div class="container">` | `<section class="section"><div class="container-wide">` |
| 159 | `<div style="max-width:980px;margin:0 auto">` | `<div class="booking-viz-shell-wrap">` |
| 160 | `<div style="background:var(--warm-white);border:1px solid var(--border);border-radius:var(--radius-lg);padding:clamp(20px,3vw,36px);box-shadow:var(--shadow-md)">` | `<div class="booking-viz-shell">` |

The hero (`<section class="hero">`) and stats-bar (`<section class="stats-bar">`)
already use `.container-wide` — only the live-demo `<section class="section">`
was switched. All other homepage sections (testimonials, FAQ, after-the-booking,
interactive-demos grid, etc.) still use their existing wrappers — none touched.

### `demos.html`

| Line | Old | New |
| --- | --- | --- |
| 57 (inline `<style>`) | `.demo-card { padding: 36px; max-width: 880px; … }` | `.demo-card { padding: clamp(24px, 3vw, 40px); max-width: 1080px; … }` |
| 58 (inline `<style>`) | _new_ | `.demo-card.is-viz { max-width: 1320px; padding: clamp(24px, 3vw, 44px) }` |
| 80 (inline `<style>`) | `.dash-mockup { … max-width: 520px; … }` | `.dash-mockup { … max-width: 640px; … }` |
| 136 | `<section class="demos-section"><div class="container">` | `<section class="demos-section"><div class="container-wide">` |
| 178 | `<div class="demo-card">` (book-self panel only) | `<div class="demo-card is-viz">` |

Other panels (insurance, book-child, sms-billing, recall, history) still
use plain `.demo-card`, so they get the new 1080px cap — wider than the
old 880px, but capped well below the booking-viz's 1320px because they
contain transcripts where line length matters for readability.

`@media (max-width: 680px) { .demo-card { padding: 24px } }` left in
place. The new clamp evaluates to 24px at small viewports anyway, so the
override is harmless.

## Why the global container was NOT widened

`styles.css` line 5: `.container { width: 100%; max-width: 1280px; … }`
governs testimonials, FAQ, hero proof strip, etc. — text-heavy sections
where 1280px already gives line lengths that read comfortably. Bumping
that globally would push line lengths past readability in the body
content. The booking-viz is a visual block with three workspace cards
plus a phone mock — it benefits from extra horizontal space; running
prose does not.

The site already has `.container-wide` (1440px max) for visual blocks
like the hero. The fix uses that existing pattern.

## What changed for the `/demos` other-cards grid

The demos page is structured as a single column of `.demo-panel`s, each
containing one `.demo-card`. There's no multi-card grid — only the tab
bar lays out horizontally. The panels stack vertically (well, only one
shows at a time via tabs).

Old: every `.demo-card` capped at 880px, padded 36px solid.
New: every `.demo-card` capped at 1080px, padded clamp(24px–40px). The
booking-viz panel additionally gets `.is-viz` which lifts the cap to
1320px and bumps padding max to 44px.

So all six panels feel less squeezed. The book-self panel feels
substantially wider because it has the visualization which has the most
to gain from horizontal real estate.

`.dash-mockup` (the recall demo's dark stats card) was also bumped from
520px to 640px so it doesn't look forlorn inside the now-wider parent.

## Before / after — content widths at 1440px viewport

| Layer | Before | After |
| --- | --- | --- |
| Homepage live-demo `<section>` outer container | `.container` → 1280 - 64 = **1216px** content | `.container-wide` → 1440 - 64 = **1376px** content |
| Homepage demo-card wrapper | inline `max-width: 980px` | `.booking-viz-shell-wrap` `max-width: 1320px` |
| Homepage shell padding | `clamp(20px, 3vw, 36px)` | `clamp(20px, 3vw, 44px)` |
| Homepage `.booking-viz` content area | 980 − 72 = **908px** | 1320 − 88 = **1232px** _(+36%)_ |
| Demos `<section>` outer | `.container` → **1216px** | `.container-wide` → **1376px** |
| Demos `.demo-card` (non-viz) | 880px | **1080px** _(+23%)_ |
| Demos `.demo-card.is-viz` | n/a (was 880) | **1320px** _(+50% vs old)_ |
| `.booking-viz` grid gap | 24px | **48px** at 1320+ vw _(+100%)_ |
| `.bv-phone` max-width | 280px | **320px** at 1320+ vw _(+14%)_ |
| `.dash-mockup` max-width | 520px | **640px** _(+23%)_ |

## Mobile behavior (≤ 768px)

`.booking-viz-shell-wrap`'s `max-width: 1320px` is just a cap; on mobile
the wrapper takes 100% of its parent (the `.container-wide` minus 32px
on each side from container padding).

`.booking-viz-shell` padding is `clamp(20px, 3vw, 44px)` — at 414px
viewport, 3vw = 12.4px, clamps to the 20px floor. Same as the previous
`clamp(20px, 3vw, 36px)` value at small sizes.

`.demo-card` uses `clamp(24px, 3vw, 40px)` — at 414px viewport, clamps
to 24px (vs. the previous fixed 36px, so mobile actually feels slightly
roomier inside the card). The `@media(max-width:680px)` override
already enforced 24px below 680px in the old version; that stayed.

`.booking-viz` two-column rule kicks in at ≥880px, so on phone the
visualization still stacks with workspace on top, phone mock below.

`.bv-phone` keeps the existing `@media(max-width:680px) { max-width:
240px }` mobile rule unchanged — the wider 300/320px caps only apply at
≥1100px.

No horizontal scroll triggered at any of: 360, 414, 768, 1024, 1280,
1440, 1920px.

## Things that did NOT change

- Card colors, type, animations, audio behavior, JS — untouched.
- `.booking-viz`'s default `1.15fr 0.85fr` column ratio — kept as-is.
  Right column still has some halo around the 320px phone at 1440px;
  the phone is intentionally small (it's a mock), the halo reads as
  breathing room rather than dead space.
- `.bv-card`, `.bv-cal-grid`, `.bv-pms-frame`, `.bv-sms-meta`,
  `.bv-sms-body` — no changes. They naturally scale to fill their
  column, so widening the column gives the calendar bigger day cells,
  the PMS frame more horizontal room for `.bv-pms-row` value text,
  etc., without touching individual card rules.
- Hero, proof strip, stats bar — already `.container-wide`. Untouched.
- Testimonials, FAQ, "After the Booking" diff cards, footer — all use
  their existing `.container` (1280px) wrappers. Untouched.
- `assets/booking-viz.js` — not modified. Layout-only fix.
- Spanish (`es/`) versions — out of scope. The repo at
  `~/Downloads/aria-dental-site-main 4/` has them, but they aren't in
  the staged work and weren't touched.

## Files changed (vs. aria-demos-home1)

```
assets/booking-viz.css   # additive rules: .booking-viz-shell{,-wrap},
                         # gap + phone size at 1100px / 1320px
index.html               # live-demo section: .container → .container-wide,
                         # 2 inline-style divs → .booking-viz-shell-wrap +
                         # .booking-viz-shell
demos.html               # .demos-section: .container → .container-wide,
                         # .demo-card max-width 880 → 1080 + clamp padding,
                         # .demo-card.is-viz @ 1320,
                         # .dash-mockup max-width 520 → 640,
                         # book-self panel's .demo-card → .demo-card.is-viz
```

`assets/booking-viz.js` is unchanged — included in the staged folder
only so deploys can rsync the directory without thinking. Diff against
`aria-demos-home1/assets/booking-viz.js` will be empty.

## Things that fought (or didn't)

Not much. The site already had a `.container-wide` (1440px) class
defined in `styles.css` and in active use on the hero — so the demo
section just needed to opt into it. No negative-margin tricks needed.
The inline `max-width: 980px` was the cleanest target because it lived
right on the wrapper div with nothing else to preserve.

The one thing to double-check at deploy: `styles.css` is not in this
staged folder (it's loaded from the repo root). The new wrapper classes
depend on `.container-wide` already existing in `styles.css` line 6 of
the production stylesheet. Confirmed it exists at
`~/Downloads/aria-dental-site-main 4/styles.css` line 6.

## Deploy checklist

Mirror these into the GitHub repo `aria-dental-site` at the same paths:

| Source                     | Repo path                |
| -------------------------- | ------------------------ |
| `index.html`               | `index.html`             |
| `demos.html`               | `demos.html`             |
| `assets/booking-viz.css`   | `assets/booking-viz.css` |

`assets/booking-viz.js` is included in the staged folder for completeness
but is byte-identical to the previous version — skip pushing it if the
deploy step diffs.
