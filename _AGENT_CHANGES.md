# Homepage demo refresh — Mike Patterson booking + viz

Replaced the old WizKids "crown fell off" homepage demo with the new Mike
Patterson implant-consultation booking demo, including the synced viz that
already lives on `/demos`. Extracted the visualization CSS + JS to external
files so both pages share one component.

## What was removed from the homepage

- The dark `<section class="dark-section">` that wrapped the player ("Hear
  Aria close a real patient. ... 2 minutes 17 seconds").
- The whole custom audio-player UI: avatar, "Real Call" pill (`#homeLiveDot`),
  generated waveform (`#homeWaveform`), inline transcript window
  (`#homeTranscript`), play/pause buttons, scrubber (`#homeProgressBar`),
  current/total time labels.
- The `<audio id="homeAudio" src="aria-call-demo.mp3">` element and the
  ~70-line inline `<script>` block that drove it (homeMessages keyframes,
  `toggleHomeAudio`, `seekHomeAudio`, timeupdate / loadedmetadata / ended
  listeners).

The homepage no longer references `aria-call-demo.mp3` at all. **Note:**
that file (`aria-call-demo.mp3`) is still used by `demo.html` (a separate
page), so it has been left in place.

There was no homepage MediaObject JSON-LD for the old demo to remove.
The meta description / OG description didn't reference Vartanian or the
old call.

## What's there now

Light-background `<section class="section">` with the same `#live-demo`
anchor (so the hero's `Hear a Real Call ↓` button still scrolls there).
Headline reads "Hear Aria book a real patient." Inside a single warm-white
card:

1. Native `<audio controls>` element (`#bookSelfAudio`) pointed at
   `audio/demo-book-self.mp3`.
2. `.booking-viz-hint` — "Press play and watch both sides" affordance
   lifted verbatim from `/demos`.
3. `.booking-viz` two-column grid (`#bookingViz`):
   - Left column: Aria's workspace — Calendar lookup card, Practice
     management card, SMS dispatch card.
   - Right column: Mike's iPhone with incoming-call screen + SMS
     notification banner.
4. Trust strip (HIPAA Compliant / AI Voice / Real-Time Booking).
5. "▶ Listen to the full set of demos →" link below pointing to `/demos`.

Plus a new `MediaObject` JSON-LD entry for the call audio.

## Extraction (external file route)

Both `index.html` and `demos.html` reference shared assets:

- `assets/booking-viz.css` — all `.booking-viz` / `.bv-*` styles. Scoped
  classes only, no global leakage. Depends on CSS variables defined in
  `styles.css` (`--amber`, `--charcoal`, `--warm-white`, `--cream`,
  `--border`, `--sage-deep`, `--radius-lg`, etc.) — those are loaded
  before booking-viz.css on every page.
- `assets/booking-viz.js` — the `initBookingViz` IIFE. It bails silently
  if `#bookSelfAudio` or `#bookingViz` is missing, so it's safe to ship
  on every page. Exposes `window.bookingDemoKeyframes` for live retuning.

`demos.html` was rewritten to the version that contains the viz markup
(the old 376-line demos.html in the repo did not have it yet — the new
viz markup came from `~/Downloads/aria-demos-viz1/demos.html`). I then
stripped its inline `<style>` block for booking-viz and the inline
`initBookingViz` IIFE, replacing both with `<link>` and `<script>`
references to the new shared files.

`demos.html` uses absolute paths (`/assets/booking-viz.css`,
`/assets/booking-viz.js`) since that page is served at `/demos` via
Vercel rewrites. `index.html` uses relative paths
(`assets/booking-viz.css`, `assets/booking-viz.js`) to match the
existing pattern in that file (`href="styles.css"`,
`src="aria-call-demo.mp3"`, `href="images/..."`).

## Audio path

Homepage audio tag: `src="audio/demo-book-self.mp3"` — relative path,
matches what the rest of `index.html` uses for direct page assets.
The mp3 was already staged at
`aria-dental-site-main 4/audio/demo-book-self.mp3`. Not touched.

## File list to deploy

Mirror these into the GitHub repo `aria-dental-site` at the same paths:

| Source (this folder)                  | Repo path                  |
|---------------------------------------|----------------------------|
| `index.html`                          | `index.html`               |
| `demos.html`                          | `demos.html`               |
| `assets/booking-viz.css`              | `assets/booking-viz.css`   |
| `assets/booking-viz.js`               | `assets/booking-viz.js`    |

Deploy step: commit + push to `main`. Vercel auto-deploys ariadental.ai.

## Verification grep results (all clean)

```
$ rg -i "vartanian|newport" index.html
# Only hits: "Newport Beach, CA 92660" in postal address (Velzyx AI office)
# and the Organization JSON-LD addressLocality. No Newport Institute /
# Newport Dentistry / Vartanian references remain.

$ rg -i "vartanian" index.html
# 0 hits

$ rg "Newport Institute|Newport Dent|newport-dent" index.html -i
# 0 hits

$ rg "demo-book-self" index.html
# 2 hits: MediaObject JSON-LD contentUrl + audio[src] tag

$ rg "booking-viz|bookSelfAudio" index.html
# 12 hits

$ rg "booking-viz\.js" index.html
# 2 hits: <script> tag + comment in placeholder script block

$ rg "homeAudio|aria-call-demo" index.html
# 0 hits — old player fully removed
```

## Things to flag (non-blocking)

1. **Old audio file still in repo:** `aria-call-demo.mp3` at the repo
   root is still referenced by `demo.html` (a separate page, NOT the
   homepage). Left in place. If `demo.html` is going away too, you can
   delete the mp3 in a follow-up.

2. **Stale image asset:** `images/case-vartanian.png` and
   `case-vartanian.png` (root) exist in the repo but are NOT referenced
   from `index.html`. Safe to delete in a follow-up if you want to
   tidy the assets folder. Did NOT delete — flagging per task.

3. **No `vartanian-demo.mp3`** was found in the audio/ directory or
   anywhere else in the repo.

4. **`demo.html` (singular) still uses old WizKids/Michael "crown fell
   off" call** via `aria-call-demo.mp3`. That page was not in scope for
   this task and is not the homepage demo widget — left alone. If you
   want it updated, that's a separate cleanup.

5. **Spanish homepage** (`es/index.html`) — out of scope, not touched.
   May still have old demo content if it ever did; worth checking.

## Polish-later items

- The audio element on the homepage uses native `<audio controls>`
  (matches `/demos`). Earlier the homepage had a custom-styled player
  with waveform + transcript ticker. That UI was tightly coupled to
  the old demo and removing it was the cleanest path. If a custom
  styled player is desired again later, build it into `booking-viz.js`
  so both pages stay in sync.
- The "Hear a Real Call ↓" button in the hero still anchors to
  `#live-demo` — copy may want to read "Watch Aria book a patient ↓"
  to better describe the new visualization, but it works as-is.
- The "Interactive Demos" section directly below (the 3-card grid for
  `/demo-booking`, `/demo-gcal`, `/demo-reschedule`) is now
  redundant-adjacent to the new live demo. Worth a copy review.
