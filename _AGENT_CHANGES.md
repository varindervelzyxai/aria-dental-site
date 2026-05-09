# Aria Demos — Batch 1 (Booking Demo Goes Live)

**Date:** 2026-05-09
**Scope:** Wires the first real Aria demo audio (`demo-book-self.mp3`) into the demos page, replaces the placeholder transcript with the recorded one, flips the booking demo from "coming soon" to active, and bumps the sitemap lastmod.

---

## Files in this batch

| Path (relative to repo root) | Action | Bytes | Notes |
|------------------------------|--------|-------|-------|
| `audio/demo-book-self.mp3`   | NEW    | 1,445,137 (~1.4 MB) | Aria booking demo, 60.19 sec, MP3 192 kbps mono 44.1 kHz |
| `demos.html`                 | EDIT   | 38,182 | Booking card transcript + headline + JSON-LD updated; "audio missing" notice removed for this demo only |
| `sitemap.xml`                | EDIT   | 16,884 | `/demos` lastmod bumped from 2026-05-07 → 2026-05-09 |

The other 5 demos (insurance, child, SMS billing, recall, history) are unchanged — they still display the "Audio file not yet uploaded" notice until Varinder records them.

---

## Audio details

- **Source file:** `~/Downloads/Aria-Voice-demo-0509.MP4` (2,153,968 bytes, generated via Cartesia)
- **Source format:** Despite the `.MP4` extension, the file is a real H.264 video container (1920×1080, 30 fps, AAC stereo audio at 44.1 kHz). I extracted the audio stream only and transcoded to MP3.
- **ffmpeg command used:**
  ```
  ffmpeg -y -i ~/Downloads/Aria-Voice-demo-0509.MP4 \
    -vn -ac 1 -ar 44100 -b:a 192k -map_metadata -1 \
    ~/Downloads/aria-demos-audio/demo-booking.mp3
  ```
- **Output:** MP3, 60.186 sec, mono, 44.1 kHz, 192 kbps CBR, 1,445,137 bytes (~1.4 MB)
- **Verified playable:** ffprobe confirms valid MP3 stream, duration matches source within 50 ms.

---

## Content changes in `demos.html`

### 1. Booking card headline (line ~176)

**Before:** `2. New Appointment — Patient Books for Themselves`
**After:**  `2. New Appointment — Patient Books Implant Consultation`

### 2. Booking card "Why this matters" subhead (line ~177)

**Before:** "Returning patient recognized by phone, due-status surfaced, three slot options, booked in 70 seconds. SMS confirmation auto-sent. Zero human touch."
**After:** "Caller asks for an implant consultation, Aria checks the slot, books it with the doctor, and texts a confirmation in 60 seconds. Zero human touch."

The "due-status surfaced" and "three slot options" claims were dropped because they don't appear in the recorded audio. The recorded call is single-slot, name-based intake, ~60 sec total.

### 3. "Audio file not yet uploaded" notice (line ~179)

Removed for this demo card only. The other 5 demo cards still show the notice.

### 4. Transcript (lines ~180–193)

Replaced the original cleaning-with-Dr-Patel-on-Friday script with the actual recorded transcript: implant consultation with Dr. Smith on Monday at 11 a.m., caller is Mike Patterson, callback number 949-657-5555.

Kept the existing HTML structure exactly: `<div class="demo-line aria">` / `<div class="demo-line patient">`, `&#39;` for apostrophes, `&mdash;` only where applicable. The `<span class="who">` label stays as "Aria" / "Patient" for styling consistency with the other 5 demos — Mike's name surfaces in the transcript text itself.

### 5. JSON-LD MediaObject for position 2 (line ~99)

**Before:**
```json
{"@type":"MediaObject","position":2,"name":"Aria Demo 2: New Appointment - Patient Books for Self","description":"Aria books a returning patient for a cleaning in under a minute.","contentUrl":"https://www.ariadental.ai/audio/demo-book-self.mp3","encodingFormat":"audio/mpeg","duration":"PT70S"}
```

**After:**
```json
{"@type":"MediaObject","position":2,"name":"Aria Demo 2: New Appointment - Patient Books Implant Consultation","description":"Aria books a caller for an implant consultation, confirms the slot, and texts a confirmation in 60 seconds.","contentUrl":"https://www.ariadental.ai/audio/demo-book-self.mp3","encodingFormat":"audio/mpeg","duration":"PT1M0S","uploadDate":"2026-05-09"}
```

Changes: name updated, description updated, `duration` corrected from `PT70S` to `PT1M0S` (matches actual ffprobe duration of 60.186 s rounded to whole seconds), `uploadDate` added.

---

## Deploy instructions (GitHub → Vercel)

The Aria dental site is plain static HTML on Vercel. Push these three files to GitHub at `varindervelzyxai/aria-dental-site` (main branch) and Vercel auto-deploys.

**Steps:**

1. Open the repo in GitHub web UI: https://github.com/varindervelzyxai/aria-dental-site
2. **Create the `audio/` folder if it doesn't exist** by uploading `demo-book-self.mp3` directly:
   - Click "Add file" → "Upload files"
   - Drag `aria-demos-batch1/audio/demo-book-self.mp3` into the upload area
   - In the "destination path" line type `audio/demo-book-self.mp3` (this creates the folder)
   - Commit message: `audio: add demo-book-self.mp3 (booking demo, 60s)`
3. Replace `demos.html` at repo root:
   - Navigate to `demos.html` in the GitHub UI → click pencil/edit OR delete and re-upload
   - Easier: drag `aria-demos-batch1/demos.html` into the repo root via "Add file" → "Upload files" (it overwrites the existing one)
   - Commit message: `demos: wire booking audio + replace transcript with recorded version`
4. Replace `sitemap.xml` at repo root the same way:
   - Commit message: `sitemap: bump /demos lastmod to 2026-05-09`
5. Wait ~30–60 sec for Vercel to deploy. Verify at https://www.ariadental.ai/demos — click the "Book Appointment" tab, hit play, confirm the audio loads and matches the transcript.

**Alternative (single PR):** make all three uploads in one branch via "Add file" → "Upload files" with commit message `demos: ship batch 1 — booking demo audio + transcript + sitemap`.

---

## Verification on staged files (already done)

- `grep -c "Mike Patterson" demos.html` → present
- `grep -c "Friday at nine\|June fourth\|four-seven-eight-two" demos.html` → 0 (old script remnants gone from booking card)
- `ffprobe demo-book-self.mp3` → 60.186 sec, mono, 44.1 kHz, 192 kbps
- Audio src in `demos.html` for `data-demo="book-self"` → `/audio/demo-book-self.mp3` (matches staged file path)

---

## Quirks / notes

- **The `.MP4` was a real video file, not a misnamed audio file.** It contained an H.264 1920×1080 video stream (probably a screen-recording or visual asset Cartesia bundled) plus the AAC audio. I extracted audio only — no visuals were carried into the MP3.
- **Filename in repo is `demo-book-self.mp3`, not `demo-booking.mp3`.** The page was already wired to `/audio/demo-book-self.mp3` in both the `<audio src="">` attribute and the JSON-LD `contentUrl`. Renaming the audio file would have required changing both references; reusing the existing filename is cleaner. The intermediate transcoded file at `~/Downloads/aria-demos-audio/demo-booking.mp3` (per the original instruction) still exists but the deployed copy uses `demo-book-self.mp3`.
- **Tab label unchanged.** The tab still reads "Book Appointment" (generic) — no need to swap to "Implant Consultation" since the card headline does that work.
- **"Audio file not yet uploaded" notice still appears on the other 5 demos.** That's intentional — they're still placeholders.
- **Duration `PT1M0S` vs `PT60S`:** ISO 8601 accepts both. Picked `PT1M0S` for human readability and consistency with how Google rich-results parser displays the value.
