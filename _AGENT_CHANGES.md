# Replacement Deploy — demo-book-self.mp3

Replaces previous booking demo audio with re-recorded version.

## Change summary
- **File:** `audio/demo-book-self.mp3`
- **New duration:** 61.13 seconds (ISO 8601: `PT1M1S`)
- **Previous duration (in repo):** 60.19 seconds (`PT1M0S` in JSON-LD)
- **Delta:** +0.94 seconds — within ±5s tolerance, **no `demos.html` change needed**
- **Encoding:** MP3, mono, 44.1 kHz, 192 kbps (matches prior file's encoding spec)
- **Source:** `~/Downloads/Implant consultation booking.mp4` (HEVC 4K video + AAC stereo audio, re-recorded 2026-05-09)
- **Strip flags:** `-vn` (no video), `-map_metadata -1` (metadata stripped)

## Deploy
Upload the single file in this folder (`audio/demo-book-self.mp3`) to the GitHub repo at the same path: `audio/demo-book-self.mp3`. Overwrites the existing file (or, if `aria-demos-batch1/` was never deployed, this becomes the FIRST upload of that file).

No HTML, JSON-LD, sitemap, or transcript changes required for this replacement.

## Follow-up edit (2026-05-09)
- demos.html: Mike Patterson opening line corrected — 'book a cleaning' → 'book an appointment with Dr. Smith'
- `demos.html` is now bundled in this folder alongside the audio replacement so both can ship together. Upload `demos.html` to the repo root (overwrite existing) when deploying this replacement batch.
