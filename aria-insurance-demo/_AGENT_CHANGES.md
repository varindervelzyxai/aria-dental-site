# Aria Insurance Demo — wiring + new visualization

Second hero demo for `/demos`. Audio + bespoke insurance-themed visualization.
Sister to the booking demo but visually distinct: identity card → eligibility
stamp → benefits dashboard on the left, stylized PDF benefits summary that
fills in live on the right.

## Files in this drop

```
aria-insurance-demo/
├── audio/
│   └── demo-insurance-verification.mp3        ← NEW (transcoded from MP4)
├── assets/
│   ├── insurance-viz.css                      ← NEW (scoped .insurance-viz / .iv-*)
│   └── insurance-viz.js                       ← NEW (audio sync engine, ~window.insuranceDemoKeyframes)
├── demos.html                                 ← MODIFIED
└── _AGENT_CHANGES.md                          ← this file
```

## Deploy file map (apply to repo paths)

| New / modified | Repo target path |
|---|---|
| `audio/demo-insurance-verification.mp3` | `audio/demo-insurance-verification.mp3` |
| `assets/insurance-viz.css` | `assets/insurance-viz.css` |
| `assets/insurance-viz.js` | `assets/insurance-viz.js` |
| `demos.html` | `demos.html` |

The booking demo files (`assets/booking-viz.css`, `assets/booking-viz.js`,
`audio/demo-book-self.mp3`) are unchanged.

## Audio

* Source: `~/Downloads/INSURANCE DEMO ARIA .mp4` (note the trailing space + uppercase ext)
* Transcode: `ffmpeg -y -i <src> -vn -ac 1 -ar 44100 -b:a 192k -map_metadata -1 …mp3`
* **Duration: 68.937 seconds** (ISO 8601: `PT1M9S`)
* Codec: MPEG-1 Layer III, mono, 44.1 kHz, 192 kbps

JSON-LD `MediaObject` position-1 updated:
* `duration: "PT1M9S"` (was `PT95S`)
* `uploadDate: "2026-05-09"` (was missing)
* `description` rewritten to lead with the dollar values that hit hardest in the demo.

## Visualization design

### Left column — Aria's verification workspace (3 stacked cards)

1. **Member lookup** — Identity card on dark charcoal background, amber side
   stripe, 44px monogram avatar. Name fills first, then DOB / Member-ID
   (masked `BT••••751`) / Carrier pills cascade in. A vertical amber scan
   sweep loops across the card while the lookup is active. Status text
   transitions: idle → "Looking up member · connecting to carrier…" → done.

2. **Eligibility** — Stamped-paper frame with a dashed inner border. When
   verification completes, a **green "VERIFIED" stamp** rotates in at -8°
   with a spring ease (mimics a hand stamping the page). Plan name +
   "Active" pill animate alongside. The plan year + in-network status sit
   underneath in muted type.

3. **Benefits breakdown** — The centerpiece. Top row has two stat cards:
   * **Annual maximum** counts up from $0 to $2,500 over 1.5s with an
     ease-out cubic. Progress ring fills in lockstep. On completion, six
     amber `$` glyphs scatter across the card with a 0.9s fade burst
     (the "coin sparkle" the brief hinted at — restrained, not gaudy).
   * **Deductible** counts $0 → $50, with separate "Met / Remaining"
     micro-labels.

   Then **three coverage tier bars** (Preventive 100% / Basic 80% /
   Major 50%) animate left-to-right with `cubic-bezier(.33,1,.4,1)` —
   no spring bounce. Each tier uses a slightly darker amber than the
   one above so the visual hierarchy reads "this one matters most".

   At the bottom, **four allowed-procedure rows** with green check dots:
   Cleanings, Routine exams, Bitewing X-rays, Panoramic X-ray. The two
   X-ray rows trail a small **stylized x-ray SVG** (a tooth with dashed
   bone outline for bitewings; a panoramic-arch glyph for the panoramic)
   that pops in 0.25s after the row appears. This is the literal
   "x-rays being covered" visualization the brief asked for.

### Right column — Patient Benefits Summary (stylized PDF)

White card, soft shadow, 12px corners, 3px amber accent line on top
edge. Letterhead reads **"Smith Family Dental"** with the *Dental*
italicized in amber. Below the letterhead, a patient strip with the
DR monogram avatar, name, member ID, and a green **"Insurance Verified"**
badge that glows with a 1.4s box-shadow pulse the moment Aria's
eligibility check completes.

Field rows populate in four labeled sections — Identity, Plan limits,
Coverage, Frequency — each value fades + lifts into place as Aria
speaks the corresponding line. Annual maximum and Preventive 100% are
emphasized in amber.

Footer: dot + "Verified live with carrier" on the left, **"Generated
by Aria · 0:42"** ticker on the right that updates with the audio
playhead.

### Brand & motion

* All inline SVG, no external icons or libs.
* Colors via existing CSS vars: `--amber #D4952A`, `--charcoal #1A1A2E`,
  `--cream`, `--warm-white`, `--sage-deep` for completion states. The
  green verified shade (`#7BA486`) is hard-coded — sage tone, not sage-deep,
  reads better at small badge sizes.
* Typography: Fraunces for headlines / numerics, Sora for everything else.
* All easings ease-out cubic or `cubic-bezier(.33,1,.4,1)` — Linear/Vercel/
  Stripe register, no rubbery springs.
* `prefers-reduced-motion` collapses every transition to ≤1ms and
  disables the scan-sweep loop.
* Mobile (≤880px): columns stack, doc loses sticky behavior. (≤680px):
  cards condense, tier-label column shrinks. (≤520px): the two stat
  tiles stack instead of sitting side-by-side.

## Keyframes (current best estimate against ~69s audio)

Scaled from the brief's 95s reference. Tune in console:
`window.insuranceDemoKeyframes`.

```js
const insuranceDemoKeyframes = [
  { at:  6.0, action: 'lookup.start' },          // Aria asks for full name
  { at:  9.0, action: 'lookup.name' },           // "Daniel Reyes"
  { at: 12.5, action: 'lookup.dob' },            // 10/17/1985
  { at: 16.0, action: 'lookup.member' },         // BT942751 → masked
  { at: 21.0, action: 'lookup.carrier' },        // BlueCross BlueShield
  { at: 23.0, action: 'verify.start' },          // "Got it" — submitting 270
  { at: 25.0, action: 'verify.complete' },       // VERIFIED stamp + doc badge
  { at: 25.5, action: 'benefits.start' },        // benefits card lights up
  { at: 26.5, action: 'benefits.maxCount' },     // counter $0 → $2,500
  { at: 28.5, action: 'benefits.deductible' },   // counter $0 → $50
  { at: 32.0, action: 'tiers.preventive' },      // 100% bar
  { at: 34.5, action: 'tiers.basic' },           // 80% bar
  { at: 37.0, action: 'tiers.major' },           // 50% bar
  { at: 46.0, action: 'procedures.cleanings' },  // "Two cleanings per year"
  { at: 49.0, action: 'procedures.exams' },      // exams
  { at: 52.0, action: 'procedures.bitewings' },  // bitewings + bitewing x-ray icon
  { at: 55.0, action: 'procedures.panoramic' },  // panoramic + panoramic x-ray icon
  { at: 60.0, action: 'doc.complete' }           // benefits card → complete state
];
```

The right-side doc field for each value populates **at the same beat**
as the left-side announcement (e.g. `lookup.name` shows the name on the
ID card AND in the doc's Identity section). One audio playhead drives both.

## What it looks like at three moments

* **0:30** — Caller has finished giving info. ID card on the left is
  filled in (name + DOB + masked member + amber carrier pill); the green
  VERIFIED stamp has just landed at -8° on the eligibility card; the
  benefits dashboard is lighting up and the $2,500 counter is mid-tick
  past $1,400. The right-side doc has Identity filled, the Verified
  badge has just glowed.

* **0:50** — All three coverage-tier bars are filled (100 / 80 / 50%),
  the dollar-glyph burst on the annual-max tile has already played and
  faded, and the procedure checklist is mid-cascade — Cleanings and
  Exams checked, Bitewings just popped with its x-ray glyph fading in
  beside it. The doc shows everything from Identity through the first
  two Frequency rows.

* **1:08** (after end) — Both cards in `is-complete` state with sage-
  deep borders. Every doc row populated, footer reads
  "Generated by Aria · 01:08". The benefits card stays static — no
  loop — just the finished state.

## Creative liberties (flag for user feedback)

These are additions beyond the brief — backable if disliked:

1. **Member ID is masked as `BT••••751`** rather than spelled out
   `BT942751`. Reads more like a real benefits portal and avoids the
   uncanny "fake member ID floating on a page" feeling. The transcript
   keeps the full readout.

2. **The eligibility card uses a dashed inner border + slight off-white
   gradient** to evoke a stamp-able document. Not in the brief, but it
   gave the VERIFIED stamp something to land on.

3. **The annual-max tile burst is six small `$` glyphs scattered around
   the tile** rather than one centered sparkle. Less casino-y, more
   "quietly counted". Restrained as requested.

4. **A 3px amber bar across the top of the doc** reads as "carrier
   accent" — a tiny letterhead detail that pulled the doc together.

5. **The x-ray glyphs are deliberately abstract** — a tooth crown with
   a dashed crown/bone outline for bitewings, a "panoramic arch with
   tooth marks" glyph for the panoramic. Not anatomically literal, but
   readable at 18px and consistent with the rest of the icon set
   (1.6 stroke, rounded caps).

6. **The lookup scan-sweep loops vertically across the ID card while
   the lookup state is active**, mirroring the booking-viz calendar
   sweep but on the dark-card background. Different direction (top-to-
   bottom rather than top-to-bottom on a light grid) so the two demos
   don't feel like the same trick.

7. **The tier bars use progressively darker amber + lower opacity** as
   you go from Preventive (full amber, 100%) → Basic (80%, slightly
   muted) → Major (50%, darker still). This visually reinforces "this
   coverage is generous → this is moderate → this needs more out-of-
   pocket" without adding text.

## Hand-off / verify steps

1. Drop the four files into the repo at the paths listed above.
2. Visit `/demos`, click the **Insurance Verification** tab, press play.
3. Open dev tools and run `window.insuranceDemoKeyframes` to see the
   live config — adjust any `at` value and call
   `audio.currentTime = N` to scrub and re-test.
4. Review the FIXME comment at the bottom of the new transcript — if
   the recording diverges from the script, edit the transcript to match.

## Things explicitly NOT touched

* Booking demo (audio, viz, JS) — unchanged.
* Demos 3–6 (book-child, sms-billing, recall, history) — still have
  their `<div class="demo-missing">` placeholders.
* Any non-demos page.
* `audio/demo-book-self.mp3` — left alone.
