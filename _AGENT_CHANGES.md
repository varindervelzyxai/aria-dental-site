# Booking demo visualization — agent changes

## What was added

A side-by-side, audio-synced visualization for the **"2. New Appointment — Patient Books Implant Consultation"** demo card on `/demos`. The visualization plays alongside the existing audio file (`/audio/demo-book-self.mp3`) and shows visitors *what Aria is doing* operationally while they hear the call.

Two columns on desktop (≥880px), stacked on mobile:

- **Left — Aria's workspace.** Three stacked cards:
  1. **Calendar lookup** — mini week grid (Sun–Sat, May 10–16, 2026) with Monday May 11 highlighted as the target. Amber sweep animation while searching, then the Mon cell becomes a "booked" pill with status "Available — Mon 11:00 AM with Dr. Smith".
  2. **Practice management** — a stylized "Smith Family Dental — Schedule" frame with five fields fading in one-by-one (Patient → Provider → Type → Date → Time). Bottom pill animates "Drafting…" → "Booked" in green. Vendor-agnostic — no PMS brand named anywhere.
  3. **SMS dispatch** — destination phone shown masked as `(•••) •••-5555`, full SMS body rendered, status cycles "Composing… → Encrypting… → Sent". Subtle amber shimmer while in flight.

- **Right — Mike's phone.** Generic dark-bezel phone (no brand labels, no carrier, no Apple/Google marks) showing the active call screen: amber gradient avatar with serif "A", "Smith Family Dental" caller name, live call timer counting up in sync with audio currentTime. At keyframe `phone.notify` (0:53), an iOS-style notification banner slides down from the top showing the SMS confirmation. Banner remains visible for the rest of the call.

A small affordance sits above the audio player: **"Press play and watch both sides."**

## Where it sits in the page

Inside `<div class="demo-panel" data-panel="book-self">` → inside `<div class="demo-card">` → directly **after** the `<div class="demo-audio">` block and **before** the `<div class="demo-transcript">` block. The hint banner is the first new element; the `.booking-viz` two-column grid follows; the existing transcript is untouched directly below.

The audio element gained a single attribute: `id="bookSelfAudio"`. Everything else on the page is purely additive.

## Files changed

- `demos.html` — modified. ~485 lines added (CSS in existing `<style>` block, HTML inside the booking demo card, JS inside the existing `<script>` block).
- All other demo cards, the JSON-LD schema (both `Organization` and `ItemList` blocks), the GTM/GA/Clarity tags, the navigation, and the footer are untouched.

## Keyframes config — paste in browser console to retune

The keyframes live in the inline `<script>` block, inside `(function initBookingViz(){…})()`. Editable at the top of that IIFE. They're also exposed as `window.bookingDemoKeyframes` so you can splice/edit live in the browser console.

```js
const bookingDemoKeyframes = [
  { at: 28.0, action: 'calendar.start' },
  { at: 31.5, action: 'calendar.complete' },
  { at: 32.0, action: 'pms.start' },
  { at: 33.2, action: 'pms.field.patient' },
  { at: 34.0, action: 'pms.field.provider' },
  { at: 34.8, action: 'pms.field.type' },
  { at: 35.6, action: 'pms.field.date' },
  { at: 36.4, action: 'pms.field.time' },
  { at: 37.5, action: 'pms.complete' },
  { at: 50.0, action: 'sms.start' },
  { at: 51.0, action: 'sms.composing' },
  { at: 51.7, action: 'sms.encrypting' },
  { at: 52.5, action: 'sms.complete' },
  { at: 53.0, action: 'phone.notify' }
];
```

To retune: edit the `at` values (in seconds) in the array, save, push. Audio is 61.13 s (confirmed via `ffprobe`).

## Behavior

- **Play** — animations fire as `currentTime` crosses each keyframe.
- **Pause** — frozen in place. No CSS animations restart.
- **Seek backward** — every keyframe past the new `currentTime` is reset; only keyframes ≤ `currentTime` are reapplied. Robust to scrubbing.
- **Seek forward** — same logic; jumps the visualization forward.
- **Ended** — every keyframe applied, call timer shows full duration, notification stays visible. "Final state" snapshot.
- **Reduced motion** — `prefers-reduced-motion: reduce` kills all transitions/animations and disables the calendar amber sweep + SMS shimmer. States snap.
- **Other audio elements** — the JS targets `#bookSelfAudio` only. Adding audio to demos 1, 3–6 won't affect this visualization.

## Accessibility

- Each workspace card has `aria-live="polite"` + idle/active/done text variants that swap based on state class. Screen readers announce "Standing by", "Searching availability…", "Available — Mon 11:00 AM with Dr. Smith" etc.
- Notification banner has `aria-live="polite"` and explicit "Smith Family Dental" + body text.
- Phone is wrapped with `aria-label="Generic smartphone showing active call screen"`.
- Decorative SVGs marked `aria-hidden="true"`.
- Visualization does not steal focus, does not trap focus, does not auto-play.
- Hint above player is `role="note"`.

## Visual design

- Brand tokens reused: `--amber #D4952A`, `--amber-50`, `--charcoal #1A1A2E`, `--cream #FEFCF8`, `--sage-deep` (for green confirmations), `--border`.
- Fonts already loaded by the page: Fraunces (serif, used for calendar day numbers, phone avatar, caller name) + Sora (UI/body).
- Borders 1px, radii 8–14px, shadows soft and low. No bouncy easing. Calm fade-ins (`cubic-bezier(.2,.8,.4,1)`), linear shimmer/sweep.
- All Lucide-style icons inline as SVG. No font icons, no external assets.
- Phone: 9:19.5 aspect ratio, 38px outer radius, 32px inner radius, fully dark with amber accent — generic, no carrier, no brand glyphs.

## Deploy instructions

1. Replace `demos.html` in the repo root (`varindervelzyxai/aria-dental-site` → `demos.html`) with the staged file at `~/Downloads/aria-demos-viz1/demos.html`.
2. Commit: `git commit -m "demos: add synced visualization for booking demo card (audio + workspace + phone)"`
3. Push to `main`. Vercel auto-deploys. No new asset files to upload — everything is inline (CSS, HTML, JS, SVG icons).

If you also need to push the audio file, that's a separate task — `audio/demo-book-self.mp3` should already be on production for the audio player to work.

## What you'll see at key timestamps

- **0:00 — 0:27** — Three workspace cards in idle state (greys/cream, "Standing by"). Phone shows incoming-call screen with timer counting up. No notification.
- **0:28 — 0:31** — Calendar card lights up amber, sweep animation runs, "Searching availability…".
- **0:32** — Calendar shows green check + "Available — Mon 11:00 AM". PMS card lights up amber.
- **0:33 — 0:36** — Five PMS fields fade in one-per-second.
- **0:37+** — PMS card flips to green, "Booked" pill appears.
- **0:50 — 0:52** — SMS card lights up. Status cycles "Composing… → Encrypting… → Sent".
- **0:53** — Notification slides down on the phone. Stays visible.
- **0:54 — 1:01** — Everything in final state. Timer keeps counting. Banner remains.

## Polish later (non-blocking)

- The phone clock (top-left) reads the visitor's current local time. Cute, but if you'd rather lock it to "11:00" so it lines up with the booking time, change the IIFE at the bottom of the JS that sets `phoneClock.textContent`.
- The calendar's week is hard-coded to **May 10–16, 2026** (Mon = May 11) to match Mike's "Monday at 11 AM" reference at the time of the audio recording. If the audio is re-recorded in a future week, update the seven `.bv-cal-day` numbers and the PMS "Date" field text. Both are easy finds.
- The transcript below the visualization has the patient phone as `949-657-5555`. The SMS card masks it as `(•••) •••-5555` per spec. If you'd prefer to show the full number on the SMS card too, edit the `.bv-sms-meta-to-num` span.
- The PMS card's pill animation is a static dot, not an animated check. We could add a tiny check-stroke animation if you want more delight at "Booked" — saved for a polish pass.
- Per-field typewriter could be added — currently it's fade-in. Typewriter would feel more like a real PMS write but adds 5 lines of JS. Saved for later.
- The other 5 demo cards are unchanged. When the rest of the audio files land, you can extend the same pattern (workspace + phone) per demo, or let this one carry the visual weight as the hero moment.
