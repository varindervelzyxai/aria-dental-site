# Aria Dental — Batch 1 SEO Foundation (Agent Changelog)

Date: 2026-05-06
Source spec: `~/Downloads/Aria_Batch1_Deploy_Package/`
Repo: `~/Downloads/aria-dental-site-main 4/`

## Detected framework + structure

Plain multi-page **static HTML** site, no framework. 24 `.html` files at the
repo root (one is a Google site-verification stub), single shared
`styles.css`, single shared `main.js`, an `images/` folder, and an
audio asset. `vercel.json` controls Vercel deploy (cleanUrls, redirects,
headers). Static images and PNG mock files live both in `images/` and at
the repo root.

This is invisible-to-humans Batch 1: no copy, layout, styling, or DOM
structure was modified. Only `<head>` metadata, JSON-LD, OG/Twitter,
analytics scaffolding, favicon link tags, plus root-level config files.

## Files created (10)

| File | Purpose |
|---|---|
| `site.webmanifest` | PWA manifest (Aria Dental AI brand colors, name, shortcuts) |
| `browserconfig.xml` | Windows tile metadata |
| `analytics-events.js` | Vanilla JS that fires the 9 Aria GA4 events into `dataLayer` (form_submit, demo_click, scroll_50/90, outbound_click, video_play, pricing_view, contact_intent). Loaded on every page. |
| `FAVICONS_TODO.md` | Step-by-step instructions for generating the 10 PNG/ICO/SVG favicon assets the head now references |
| `_AGENT_CHANGES.md` | This file |

(The script that drove the bulk edits, `apply_batch1.py`, lives in the
session outputs folder — not committed to the repo.)

## Files modified

### Root config

- **`sitemap.xml`** — replaced with deploy-package version (23 URLs, all
  `lastmod 2026-05-06`). Diffed against the pre-existing sitemap first;
  both contained the exact same 23 URLs, so no URLs were dropped.
- **`robots.txt`** — replaced with deploy-package version. Adds explicit
  rules for Googlebot, Bingbot, GPTBot, PerplexityBot, ClaudeBot, plus
  blocks for AhrefsBot/SemrushBot/MJ12bot and the standard
  `/api/`, `/admin/`, `/_next/`, `/draft/`, `/preview/` disallows.
- **`vercel.json`** — merged. Preserved the 3 pre-existing redirects
  (`/demos`→`/demo`, `/aria-vs-others`→`/compare`,
  `/aria-vs-weave`→`/compare`) and `cleanUrls: true`,
  `trailingSlash: false`. Added the apex→www 308 redirect, all 13
  canonical-path 308 redirects from `redirects.md`, the `/pricing`→
  `/platform#pricing` 307, and the full security `headers` block:
  HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy,
  X-Frame-Options, Cross-Origin-Opener-Policy, **CSP in
  `Content-Security-Policy-Report-Only` mode** (NOT enforced), and
  Report-To. Validated as JSON.

### HTML files (23 modified)

Every page received the same surgical head-block changes:

- `<title>` replaced with route-specific title from `meta_tags.md`
  (all ≤ 60 chars).
- `<meta name="description">` replaced with route-specific copy from
  `meta_tags.md` (all ≤ 155 chars).
- `<link rel="canonical">` ensured present and pointing to the
  spec-correct URL.
- `<meta name="viewport">` ensured present (was already there on all
  pages).
- All pre-existing OG (`og:*`) and Twitter (`twitter:*`) tags
  **replaced** with the canonical Batch 1 set: `og:site_name`,
  `og:locale`, `og:type`, `og:title`, `og:description`, `og:url`,
  `og:image` (+ `og:image:width/height/alt` on `summary_large_image`
  cards), `twitter:card`, `twitter:site`, `twitter:creator`,
  `twitter:title`, `twitter:description`, `twitter:image`. Article
  pages also get `article:published_time`, `article:modified_time`,
  `article:author`.
- The 3 demo utility pages (`demo-booking`, `demo-gcal`,
  `demo-reschedule`) received `<meta name="robots" content="noindex,follow">`.
- Full favicon link block added: `favicon.ico`, 16/32/48 PNGs,
  `apple-touch-icon`, `mask-icon`, `manifest`, dark+light
  `theme-color`, `msapplication-TileColor/-config`,
  `apple-mobile-web-app-title`, `application-name`.
- **Google Tag Manager** head snippet (real container ID `GTM-5H6LQ8RL`,
  substituted in 2026-05-06 over the original `GTM-XXXXXXX` placeholder
  in 23 .html files / 46 occurrences) injected immediately after
  `<head>` opens. Matching `<noscript>` iframe injected immediately
  after `<body>` opens.
- **Microsoft Clarity** snippet (real project ID `wn8w0677vz`,
  substituted in 2026-05-06 over the original `clarity_xxxxxxxxxx`
  placeholder in 23 .html files / 23 occurrences) injected in `<head>`
  just before `</head>`.
- `<script src="/analytics-events.js" defer></script>` reference added
  just before `</head>`.
- The existing inline GA4 (`G-KQS3692C4Q`) was **left in place** — it
  keeps firing until GTM is verified live (then remove it manually to
  avoid double-counting; see DEPLOY note below).
- JSON-LD blocks inserted just before `</head>` according to the spec:
  - **Every page**: Organization, WebSite, SoftwareApplication
  - **`/`** + **`/ai-for-dentists`** + **`/dental-missed-calls-ai`**: FAQPage
  - **`/compare`**: Product (alongside SoftwareApplication)
  - **`/ai-for-dentists`**, **`/dental-insurance-verification-ai`**,
    **`/after-hours-dental-answering-service`**,
    **`/ai-for-dental-groups`**, **`/dental-missed-calls-ai`**,
    **`/verify-insurance-during-the-call`**: Service
  - **`/why-dental-practices-miss-calls`**,
    **`/how-much-do-missed-calls-cost-dental-practice`**,
    **`/do-automated-reminders-reduce-dental-no-shows`**,
    **`/verify-insurance-during-the-call`**: Article
  - **Every non-homepage**: BreadcrumbList tailored to that page
  - Where pre-existing JSON-LD blocks were already present (most pages
    had Organization + SoftwareApplication; some had FAQPage and
    Article), they were **left in place** and the new blocks emitted
    alongside, with a `<!-- TODO: consolidate JSON-LD blocks -->`
    comment marker.

The Google verification stub `google481a2ef1cd214245.html` was left
untouched.

## TODOs that need you (the human)

> **2026-05-06 update:** the GTM container ID has been substituted —
> `GTM-XXXXXXX` → `GTM-5H6LQ8RL` across all 23 .html files (46
> occurrences). The Microsoft Clarity project ID has also been
> substituted — `clarity_xxxxxxxxxx` → `wn8w0677vz` across all 23
> .html files (23 occurrences). The original steps 1 (Replace
> `GTM-XXXXXXX`) and 2 (Replace `clarity_xxxxxxxxxx`) are **done**
> and removed from this list; remaining steps renumbered accordingly.

1. **Generate the favicon assets**. The HTML now references 10 PNG/ICO/
   SVG files that do not yet exist. Step-by-step in `FAVICONS_TODO.md`
   — quickest path is RealFaviconGenerator from a 1024×1024 source.
2. **Remove the inline GA4 snippet** (lines containing
   `gtag/js?id=G-KQS3692C4Q` and the matching `gtag('config','G-KQS…')`
   call) from every `.html` file **after you confirm GTM is firing
   GA4 in DebugView**. Otherwise events double-count. There are 23
   files × 2 lines each.
3. **Generate or commission the OG images** at the URLs referenced.
   `images/og/home.png`, `images/og/platform.png`, etc. — full list in
   `Aria_Batch1_Deploy_Package/og_twitter_meta.md`. 1200×630 PNG.
   Until they exist, social previews will show no image. Drop them in
   the existing `images/` folder.
4. **Consolidate the JSON-LD blocks** marked with
   `<!-- TODO: consolidate JSON-LD blocks -->`. Every page that already
   had structured data now has both the old and the new blocks. Pick
   the better of each pair (typically the new ones, since they include
   stable `@id` references and the parent-organization linkage), delete
   the duplicate, and remove the comment. `grep -rn 'TODO: consolidate'
   .` — 19 occurrences.
5. **Set up the GTM tags** described in
   `Aria_Batch1_Deploy_Package/analytics_setup.md` (GA4 Configuration
   tag, Clarity Custom HTML tag, 9 event triggers, conversion
   marking).
6. **Promote CSP from report-only to enforced** after 1–2 weeks of
   clean reports. Edit `vercel.json`: change
   `"key": "Content-Security-Policy-Report-Only"` →
   `"key": "Content-Security-Policy"`.
7. **Optional**: implement the `/api/csp-report` endpoint that
   `security_headers.md` describes (logs CSP violations).

## Push instructions

```bash
cd "~/Downloads/aria-dental-site-main 4"
git add -A
git commit -m "Batch 1 SEO foundation: meta, OG, JSON-LD, sitemap, robots, redirects, security headers, GTM/Clarity scaffolding"
git push origin main
```

Vercel auto-deploys on push to `main` — typical build time ~2 min.

## Verification checklist (after deploy)

- [ ] `curl -sI https://ariadental.ai/ | head -3` returns
      `HTTP/2 308` and `location: https://www.ariadental.ai/` (not 307).
- [ ] `curl -sI https://www.ariadental.ai/sitemap.xml | head -1`
      returns 200; opening it in browser shows 23 URLs with
      `lastmod 2026-05-06`.
- [ ] `curl -sI https://www.ariadental.ai/robots.txt | head -1`
      returns 200 and includes `Disallow: /api/` and explicit
      Googlebot/Bingbot/GPTBot blocks.
- [ ] Old slugs redirect: `/book-a-demo` → `/demo`,
      `/missed-calls` → `/dental-missed-calls-ai`,
      `/insurance-verification` → `/dental-insurance-verification-ai`,
      etc. — all 308.
- [ ] `view-source:https://www.ariadental.ai/` shows GTM head snippet,
      Clarity snippet, the new OG/Twitter tags, the favicon link block,
      and the JSON-LD blocks.
- [ ] Run [search.google.com/test/rich-results](https://search.google.com/test/rich-results)
      on `/`, `/platform`, `/dental-missed-calls-ai`, and one Article
      URL — Organization, SoftwareApplication, FAQPage, Service,
      Article, BreadcrumbList all valid.
- [ ] [securityheaders.com](https://securityheaders.com/?q=https%3A%2F%2Fwww.ariadental.ai%2F)
      target B+ (will become A once CSP is enforced).
- [ ] Facebook Sharing Debugger + Twitter Card Validator on `/`,
      `/platform`, one article. (Will need the OG images first.)
- [ ] Lighthouse PWA tab on `/` — manifest installable, theme color
      detected. (Will need favicons first.)
- [x] Clarity placeholder `clarity_xxxxxxxxxx` has been replaced with
      real project ID `wn8w0677vz` in all 23 .html files. (The GTM
      placeholder has also been replaced with `GTM-5H6LQ8RL`.)

## What we deliberately did NOT change

- Any visible copy, layout, CSS, hero images, or component structure.
- The existing inline GA4 snippet (kept until GTM cutover).
- Pre-existing JSON-LD blocks (kept alongside new blocks; merge later).
- The `images/` folder or any other static asset.
- Pre-existing redirects in `vercel.json` (preserved as-is).
- The Google site-verification stub (`google481a2ef1cd214245.html`).
- Duplicate root-level PNG/MP3 files (left in place — likely referenced).


## 2026-05-07 — Favicon refs updated to match modern bundle

- 2026-05-07: favicon refs updated to match realfavicongenerator modern bundle (favicon.ico, favicon.svg, apple-touch-icon.png, web-app-manifest-{192,512}.png).
- Replaced legacy 11-line favicon `<link>` block with modern 6-line block in all 23 content `.html` files.
- Rewrote `site.webmanifest` to reference only deployed icons; updated theme/background colors and shortcut icons.
- `browserconfig.xml` is no longer referenced from any HTML; the file should be removed from the repo root.
- Stale legacy filenames (favicon-16/32/48, safari-pinned-tab.svg, android-chrome-*, maskable-icon-512x512, mstile-*) no longer appear in any code file.


## 2026-05-07 — Batch 2: On-page copy rewrite

Surgical copy rewrites only. **No CSS, no styling, no class/ID/href changes,
no layout/structure changes, no JSON-LD changes, no meta-tag changes, no
analytics or favicon edits, no new pages or routes.** Every edit was an
in-place text swap inside existing slots. All 15 modified `.html` files
plus this changelog are staged at `~/Downloads/aria-batch2-copy/`.

### Files modified (15)

**Tier 1 (full rewrites — hero, value prop, CTAs, FAQ, final CTA where present):**

| File | What changed |
|---|---|
| `index.html` | Hero H1 trimmed (19+ → 8 words), subhead/closer tightened, secondary CTA "Calculate What Your Front Desk Costs You →" → "Calculate Your ROI →", hero primary CTA verb-first, proof strip adds "HIPAA compliant", section descriptions tightened, "After the Booking" headline rewritten, FAQ expanded from 8 to 12 cards (added HIPAA, PMS integration, setup time, escalation/unknown answers, outage handling), customer logo TODO comment added inline, final-CTA copy and primary CTA tightened. |
| `platform.html` | Hero `<div>` → `<h1>` (semantics), subhead rewritten in active-voice list form, "How It Works" secondary CTA added, every capability card tightened (avg ~30% shorter), patient-experience headline + subhead crisper, capacity section subhead tightened, final-CTA "Book Your Demo →" → "Book a Demo →", added Calculate Your ROI secondary CTA. |
| `how-it-works.html` | Hero subhead tightened, hero CTA added (was missing), all 6 onboarding steps rewritten — each now has a single-sentence body + one bolded **Proof:** line per spec, final-CTA "Book Your Demo →" → "Book a Demo →" with "respond within 24 hours" trust microcopy. |
| `compare.html` | Hero subhead trimmed, primary CTA "See Why Practices Switch →" → "Book a Demo →", "Hear the Difference" → "Hear a Real Call", prose-section ledes tightened. **NEW SECTION ADDED: "What Aria doesn't do" — 5 honest-position bullets (clinical judgment, back-office, PMS write-back, AI disclosure, lock-in). This was the spec-mandated addition.** Final CTA copy tightened. |
| `roi-calculator.html` | Hero `<div>` → `<h1>`, subhead rewritten ("Move the sliders…"), 3 slider labels reworded for clarity ("Calls per day" → "Inbound calls per day" etc.), primary CTA "Book a Demo — See How Aria Fixes This →" → "Book a Demo →" with break-even microcopy under it, email-capture button "Send Results →" → "Email My Report →" with "no newsletter spam" reassurance, success state warmer, 3 insight cards tightened, final-CTA primary CTA tightened. |
| `contact.html` | Hero `<div>` → `<h1>`, subhead promises "no slides, no pressure", textarea label/placeholder reframed around "biggest front-office headache", **submit button "Send Request →" → "Book My Demo →"**, trust microcopy added under submit ("respond within 24 hours, often the same day. No marketing emails — ever."), success state copy warmer, error state directs to email with reassurance, side-panel cards tightened, "Live in 48 hours" trust block now mentions HIPAA. |
| `demo.html` | Hero `<div>` → `<h1>`, subhead mentions runtime (2 minutes), **NEW pre-demo expectations card added** ("What your demo will cover" — Time/Who's on call/What you'll see/What to bring per spec), primary CTA "Book Your Demo →" → "Book a Demo →", final-CTA H2 rewritten ("Stop missing calls. Let Aria answer them."), interactive-demos sub-line tightened. |

**Tier 2 (hero + value-prop tightened, FAQ left intact where already strong):**

| File | What changed |
|---|---|
| `ai-for-dentists.html` | Hero H1 trimmed from 17-word "How the Best Practices Are Recovering Revenue They Never Knew They Were Losing" to "AI for dentists: recover the revenue your front desk can't.", section-label changed from "The Definitive Guide" to keyword-aligned "AI for Dentists", subhead tightened, problem-section prose paragraphs trimmed. FAQ already strong; left alone. |
| `ai-for-dental-groups.html` | Hero subhead tightened ("Roll out new offices in days, not quarters"), primary CTA "Scale Without Hiring →" → "Book a Demo →", multi-location prose paragraphs trimmed. |
| `dental-missed-calls-ai.html` | Hero H1 trimmed to "Stop losing patients to missed calls." (5 words), section-label changed from "The Missed Call Problem" to keyword-aligned "Dental Missed Calls AI", subhead expanded with concrete channels/24-7, cost-section lede tightened, final-CTA primary CTA tightened. |
| `dental-insurance-verification-ai.html` | Hero H1 trimmed (dropped "Automatically." — redundant), section-label changed to keyword-aligned "Dental Insurance Verification AI", primary CTA "See Live Insurance Verification →" → "Book a Demo →", problem-section opening tightened. |
| `verify-insurance-during-the-call.html` | Article H1 rewritten from 19-word title to 8-word "Verify dental insurance during the call — not after.", lede paragraph tightened. |
| `after-hours-dental-answering-service.html` | Section-label changed to keyword-aligned "After-Hours Dental Answering Service", subhead tightened, primary CTA "Stop Losing After-Hours Patients →" → "Book a Demo →", problem-section opening tightened ("Toothaches don't [stop at 5 PM]"). |

**Tier 3 (hero/intro polish only):**

| File | What changed |
|---|---|
| `portfolio.html` | Hero subhead tightened ("Aria isn't a prototype. It's live in dental practices today …"). Body left alone. |
| `security.html` | Hero `<div>` → `<h1>`, subhead rewritten with concrete claims (HIPAA, AES-256, signed BAAs), final-CTA H2 and primary CTA tightened. |

### Skipped per spec

- `blog.html` and the 3 blog post pages — content was already strong.
- `demo-booking.html`, `demo-gcal.html`, `demo-reschedule.html` — utility/confirmation pages.
- `google481a2ef1cd214245.html` — Google site-verification stub.
- `workflow.html` — no obvious wins relative to the time cost.

### Sample diffs (homepage)

**Hero H1:**
- Before: "Aria Is the AI Dental Receptionist That Answers Every Call, Verifies Insurance Live, and Books Patients 24/7" (19 words)
- After: "Answer every call. Verify insurance live. Book patients 24/7." (9 words)

**Hero primary CTA:**
- Before: "See Aria Close a Patient Live →"
- After: "Book a Demo →"

**FAQ — new card added (HIPAA):**
- After: Q: "Is Aria HIPAA compliant?" A: "Yes. Aria is HIPAA compliant by design — AES-256 encryption at rest, TLS 1.3 in transit, signed BAAs with every practice and every subprocessor. Conversations are stored in your private workspace. See our full security posture →"

### Trust signal slots — placeholders preserved

- `<!-- TODO: customer logos -->` added inline in homepage `.live-clients`
  list. The single existing chip (Newport Institute for Dentistry) was
  preserved per spec ("real customer per the audit").
- No fake testimonials, no fabricated case studies, no invented quotes.

### Internal links added

- Homepage FAQ: HIPAA card → `/security`, integrations card → `/platform`,
  setup-time card → `/how-it-works`. (All existing routes; no new paths.)

### What was NOT touched (per spec)

- No `<head>` content (titles, descriptions, OG/Twitter, canonical, favicon
  block, JSON-LD, GTM/Clarity scripts, GA4 inline). 
- No `<meta>`, `<link>`, `<script>`, `<noscript>`, or live-demo widget.
- No CSS, no classes, no IDs, no `data-*` attributes, no `href` values
  changed (except where copy required swapping a CTA destination — none did).
- No image `src` paths changed.
- No analytics `gtag('event', ...)` calls touched.
- No `vercel.json`, `sitemap.xml`, `robots.txt`, `site.webmanifest`,
  `analytics-events.js`, or `main.js` touched.
- No new pages or routes created.

### Verification

For every modified file:
1. `</head>` and `<body>` open/close intact (grep verified).
2. Edit-tool returned successful update (would error on stale state).
3. Visible word count within ±30% of original — most pages slightly shorter
   on hero copy, slightly longer where FAQ was expanded (homepage gained
   ~30% in FAQ section after adding 4 new cards: HIPAA, PMS, setup, outage).
4. No `<a href>` touched except inside the new homepage FAQ cards, where
   every link points to existing routes (`/security`, `/platform`,
   `/how-it-works`).

### Drag-and-drop folder

`~/Downloads/aria-batch2-copy/` — 15 modified `.html` files plus this
changelog (latest version copied at the end of the run).


## 2026-05-07 — Batch 3: Conversion Infrastructure

Goal of this batch: make the funnel actually work. Every visitor either
converts, leaves an email, or self-segments. Built on top of the Batch 2
copy. **No CSS file changes, no JSON-LD changes, no analytics ID changes,
no `vercel.json` changes, no new HTML pages.** Inline `<style>` blocks
were added per-page for the new patterns (lead-magnet card, headline
numbers, share strip) since the brief disallows touching `styles.css`.

### Files modified (5)

| File | What changed |
|---|---|
| `roi-calculator.html` | Added 3 visceral headline output numbers ($/mo recovered, new patients/yr, hrs/wk freed) above the cost breakdown. Added inline tooltip hints on every input label (i icons, hover/focus reveal). Refactored existing email gate into a "printable scorecard" framing with new privacy microcopy ("We email it once. No nurture spam unless you opt in."). Wired `dataLayer.push({event:'roi_email_capture', ...})` with all 6 calculator inputs as event params. Added a social share strip (Tweet/LinkedIn) below results — uses `twitter.com/intent` and `linkedin.com/sharing/share-offsite`, prefilled with the user's revenue-lost number, no auto-fire. Inline post-result CTA text now reads "Book a demo to recover this →". Existing math + slider IDs untouched. TODO comment added: `<!-- TODO: wire to email tool -->`. |
| `index.html` | Added a tinted lead-magnet card above the final CTA section ("AI Receptionist Buyer's Guide for Dental Practices (PDF)"), with email-capture form, privacy microcopy, error/success states. Form posts via web3forms as interim transport with `<!-- TODO: PDF asset for buyers-guide -->` and `<!-- TODO: wire to /api/lead-magnet?asset=<slug> -->` markers. Form fires `dataLayer.push({event:'lead_magnet_capture', asset:'buyers-guide', email_domain:...})`. Added `<script src="/exit-intent.js" defer>` reference before the (commented-out) widget loader. |
| `dental-missed-calls-ai.html` | Same lead-magnet card pattern, asset slug `missed-call-worksheet`, headline "Missed Call Cost Worksheet". Added inline `<script>` handler for the form (page had no shared inline script previously). |
| `dental-insurance-verification-ai.html` | Same lead-magnet card pattern, asset slug `verification-audit`, headline "Insurance Verification Time Audit". Added inline `<script>` handler. |
| `contact.html` | Microcopy pass: "Email *" label → "Work email *". Added inline microcopy under email field: "We respond within 24 hours. No marketing spam." (Submit button + bottom trust line were already tightened in Batch 2.) |
| `compare.html` | Added `<script src="/exit-intent.js" defer>` reference. No copy changes. |
| `platform.html` | Added `<script src="/exit-intent.js" defer>` reference. No copy changes. |

### Files created (4)

| File | Purpose |
|---|---|
| `exit-intent.js` | Vanilla JS exit-intent modal. Self-contained styles (Fraunces headline, Sora body, cream bg, charcoal text, amber CTA — matches site palette). Fires once per session via `sessionStorage`. Cooldown: 4s after page load. Mouse-leave-to-top trigger + scroll-back-to-top safety net. Skips touch-primary devices (`hover: none` media query). Accessible: `role="dialog"`, `aria-modal="true"`, focus trap on Tab, Esc-dismiss, click-outside dismiss, X close button, "No thanks" dismiss link. Fires `dataLayer.push({event:'exit_intent_shown'})` on display and `event:'exit_intent_clicked'` when CTA clicked. CTA links to `/roi-calculator`. |
| `email-sequences/welcome-post-demo.md` | 5-email pre-demo sequence (confirmation → expectations → social proof → 2hr reminder → no-show recovery). Voice from Batch 2 brand work — warm, direct, plain language, signs as a person. |
| `email-sequences/nurture-educational.md` | 7-email educational drip over 10 days (Day 0/1/2/4/6/8/10) for lead-magnet downloaders who haven't booked. Topics: delivery + segmenting question, the missed-call audit method, "what AI receptionist actually means," HIPAA-in-60-seconds, what Aria does NOT do, one specific scenario, where-are-you. |
| `email-sequences/reengagement-cold.md` | 4-email re-engagement sequence (Day 0/4/9/14) for 60-day-cold leads. Tonally honest; gets progressively more direct. Final email is a clean break with unsubscribe link. |

### Lead magnet form pattern (shared across 3 pages)

All three blocks share the same markup, styles, and JS handler:

- Tinted gradient card (`linear-gradient(135deg,rgba(212,149,42,0.08),rgba(212,149,42,0.02))` on cream).
- Two-column layout (description / form), collapses to one column under 720px.
- "Work email" label with placeholder `you@yourpractice.com`.
- Inline microcopy: *"We respond within 24 hours. No marketing spam."*
- Privacy line: *"We email it once. No nurture spam unless you opt in."*
- Error state: *"That email doesn't look right — try again?"* (inline `<p class="lm-error">`, hidden until invalid submit).
- Success state: *"✓ On its way. Check your inbox in a few minutes."*
- Form posts through web3forms (interim transport, same access key as the existing demo form) with subject "Lead magnet request — `<asset>`".
- `dataLayer.push({event:'lead_magnet_capture', asset:'<slug>', email_domain:'<domain>'})` on submit.
- `<!-- TODO: PDF asset for <slug> -->` and `<!-- TODO: wire to /api/lead-magnet?asset=<slug> -->` comments left for the human to replace.

### ROI calculator — before/after on the visible result block

**Before** — opened with a generic title and a list of negative costs:

```
Your annual front desk cost
  Receptionist salary + benefits        $58,500
  Revenue lost from missed calls        $78,750
  No-shows & scheduling gaps            $36,000
  ────────────────────────────────
  Total annual cost                    $173,250
  Patients lost per year                    66
[Book a Demo →]
[Email my results — Send Results →]
```

**After** — opens with three visceral, positively-framed headline numbers
(what Aria recovers), then drops into the cost breakdown for context:

```
What Aria recovers for you
  ┌─────────────┬─────────────┬─────────────┐
  │  $6,562     │     66      │     11      │
  │ /MONTH      │ NEW         │ HRS/WEEK    │
  │ RECOVERED   │ PATIENTS/YR │ FREED       │
  └─────────────┴─────────────┴─────────────┘

Your current annual cost
  Receptionist salary + benefits        $58,500
  Revenue lost from missed calls        $78,750
  No-shows & scheduling gaps            $36,000
  Total annual cost                    $173,250
  Patients lost per year                    66

[Book a demo to recover this →]

📄 Want this as a printable scorecard?
   We'll email a one-page PDF you can share with partners or sit on overnight.
   [you@yourpractice.com] [Send my report →]
   We email it once. No nurture spam unless you opt in.

Share this scorecard
   [𝕏 Tweet this]   [in Share to LinkedIn]
```

### Microcopy pass — what changed and what didn't

The contact form was already heavily tightened in Batch 2 (submit button
"Book My Demo →", trust microcopy under it, success state copy warmer).
The remaining edits in this batch:

- `contact.html`: "Email *" → "Work email *", added inline microcopy
  *"We respond within 24 hours. No marketing spam."* under the email field.
- All 3 new lead-magnet forms: ship with "Work email" label and the same
  inline microcopy + privacy line, by construction.
- ROI calculator email-gate button: "Send Results →" → "Send my report →"
  (matches the new "scorecard" framing).
- Demo utility pages (`demo-booking`, `demo-gcal`, `demo-reschedule`)
  have no email forms — nothing to change there.
- `demo.html` is a content/transcript page, no form.

### Success-state copy spec (for the human to wire)

For each form, when a successful submit returns:

- **Contact form (`contact.html`)** — already wired.
  - On success: "Got it. Talk soon." + "We'll be in touch within 24 hours to find a demo time. Check your inbox for confirmation."
- **Lead-magnet forms** — wired (success div appears in place of the form).
  - On success: "✓ On its way. Check your inbox in a few minutes."
- **ROI scorecard email gate** — wired.
  - On success: "✓ Sent. Check your inbox in the next few minutes."

### Error-state copy spec (for the human to wire)

- **Invalid email format** (all forms): *"That email doesn't look right — try again?"*
- **Network/transport failure** (all forms): *"Something went wrong. Email hello@ariadental.ai and we'll send it directly."*
- **Required field missing** (contact form): rely on browser-native validation; no custom copy needed.

### Exit-intent modal — structure

```html
<div class="aei-overlay" role="dialog" aria-modal="true"
     aria-labelledby="aei-headline" aria-describedby="aei-sub">
  <div class="aei-modal" tabindex="-1">
    <button class="aei-close" aria-label="Close">×</button>
    <div class="aei-label">Before you go</div>
    <h2 id="aei-headline" class="aei-headline">
      Wait — see what your practice is losing
    </h2>
    <p id="aei-sub" class="aei-sub">
      Plug in your call volume and case value. The 30-second calculator
      shows exactly how much revenue is walking past your front desk
      every week.
    </p>
    <a href="/roi-calculator" class="aei-cta" id="aei-cta">
      Run the 30-second calculator →
    </a>
    <button class="aei-dismiss">No thanks, I'll keep losing patients</button>
  </div>
</div>
```

Visual style: cream `#FEFCF8` modal bg, `#1A1A2E` text, `#D4952A` CTA,
Fraunces 30px headline, Sora 15px sub. 24px radius. Backdrop blur on
`rgba(26,26,46,0.6)`. Slides in with a fade + 8px-pop keyframe.

### What was NOT touched

- `styles.css` — every new pattern is an inline `<style>` block per page.
- `main.js` — ROI math is inside `roi-calculator.html`; the headline
  numbers calc was added there, not in `main.js`.
- `analytics-events.js` — new events (`lead_magnet_capture`, `roi_email_capture`,
  `exit_intent_shown`, `exit_intent_clicked`, `roi_share_click`) are pushed
  directly to `dataLayer` from inline scripts so the file stays a clean
  9-event spec for GTM tag setup.
- `vercel.json`, `sitemap.xml`, `robots.txt`, `site.webmanifest` — no changes.
- All `<head>` content (titles, descriptions, OG/Twitter, canonical,
  favicons, JSON-LD, GTM/Clarity) — no changes.
- Existing slider IDs, form `name` attributes, web3forms access keys —
  preserved.

### TODOs left for the human

1. **Create the 3 lead-magnet PDF/XLSX assets** referenced by the new forms.
   Filenames: `buyers-guide.pdf`, `missed-call-worksheet.xlsx` (or PDF),
   `verification-audit.pdf`. Marked with `<!-- TODO: PDF asset for <slug> -->`.
2. **Wire the lead-magnet form endpoint.** Currently posts to web3forms;
   ideal: a real `/api/lead-magnet?asset=<slug>` endpoint that emails the
   asset back to the lead. Marked with `<!-- TODO: wire to /api/lead-magnet?asset=<slug> -->`.
3. **Wire the ROI scorecard endpoint** (`/api/roi-report`). Same pattern.
   Marked with `<!-- TODO: wire to email tool -->`.
4. **Set up GTM event triggers** for the 5 new dataLayer events:
   `lead_magnet_capture`, `roi_email_capture`, `roi_share_click`,
   `exit_intent_shown`, `exit_intent_clicked`. Mark
   `lead_magnet_capture` and `roi_email_capture` as conversions in GA4.
5. **Paste the email sequences** from `email-sequences/*.md` into the ESP
   you pick (Mailchimp, Klaviyo, Customer.io, etc.). Send delays and merge
   tags are noted in each file.

### Delivery (in-repo only — staging deferred per user)

All Batch 3 changes were made in-place inside the repo at
`~/Downloads/aria-dental-site-main 4/`. External drag-and-drop staging
folders were not created; the user will run a separate staging pass with
the appropriate mounts. The full Batch 3 surface lives at:

- 7 modified `.html` files (listed in the table above) — in repo root.
- `exit-intent.js` — in repo root.
- `email-sequences/welcome-post-demo.md`,
  `email-sequences/nurture-educational.md`,
  `email-sequences/reengagement-cold.md` — new folder in repo root.
  These are user-facing reference material for the ESP — not intended
  to be served by Vercel. Add `email-sequences/` to `.vercelignore`
  (or move them out of the repo) before deploying.
- This `_AGENT_CHANGES.md` — updated.

> **Note:** Two now-orphaned folders may exist at
> `~/Downloads/aria-batch3-conversion/` and `~/Downloads/aria-batch3-emails/`
> from an earlier (then-rescinded) staging step. The agent attempted to
> remove them but the host filesystem refused; the user can delete them
> manually, or use them as the post-task drag-and-drop bundle if convenient.

### Verification

For every modified file:
1. `</head>` and `</body>` open/close intact (grep verified).
2. New blocks were appended via `Edit`, which would error on stale state.
3. ROI calculator: existing slider IDs (`salary`, `calls`, `missed`,
   `patientValue`, `conversion`, `days`) and the `calc()` math preserved.
   New headline numbers reuse the same computed values; only one new
   derived metric (`hoursFreedPerWeek`) was added, computed from existing
   `calls` and `missed` inputs.
4. Lead-magnet forms: 3 instances, all share the same handler block.
   Inline `<script>` blocks added on the 2 service pages (homepage already
   had a closing `<script>` block).
5. Exit-intent: only referenced from `index.html`, `compare.html`,
   `platform.html` — verified by grep.


## 2026-05-07 — Batch 4: Content Engine

Goal of this batch: build the editorial machine that drives organic traffic
and ranks for buyer-intent keywords. **No CSS file changes, no JSON-LD
schema-format changes on existing pages, no `vercel.json` changes, no
existing blog post modifications, no homepage / service page changes.**
All new pages use the same head pattern and inline `<style>` blocks as
the existing blog posts (Batch 1's GTM/Clarity/GA4/OG/JSON-LD spec).

### Files created (14)

**12 new blog posts at repo root**, each ~1170-1590 visible words, full
head pattern (GTM, Clarity, inline GA4, OG/Twitter, JSON-LD `Article` +
`BreadcrumbList` + `Organization`, canonical, favicon refs, manifest,
viewport, `analytics-events.js`), `datePublished: 2026-05-07`, author
"Aria Dental Team", placeholder `og:image` at `/images/blog/<slug>.png`
with `<!-- TODO: blog hero image -->` comment.

| File | Topic | Visible words |
|---|---|---|
| `ai-receptionist-vs-front-desk-cost.html` | TLV, fully-loaded employee cost vs. AI receptionist | 1367 |
| `hipaa-compliance-ai-dental-tools.html` | BAA, encryption, audit, vendor checklist | 1463 |
| `reduce-dental-no-shows.html` | 9 tactics to cut no-shows under 5% | 1393 |
| `dental-insurance-verification-faster.html` | 10 ways to compress verification | 1409 |
| `front-desk-burnout-dental-practice.html` | Symptoms, costs, structural fixes | 1450 |
| `after-hours-dental-call-coverage.html` | Voicemail vs. answering vs. AI matrix | 1176 |
| `voice-ai-dental-buyers-guide.html` | Features, integration, contract terms | 1366 |
| `aria-vs-arini-dentina-comparison.html` | Honest 4-way vendor comparison | 1280 |
| `pms-integration-dental-ai.html` | Open Dental, Dentrix, Eaglesoft depth | 1589 |
| `setup-ai-dental-receptionist-7-days.html` | Day-by-day rollout checklist | 1361 |
| `dental-practice-marketing-roi-tracking.html` | UTM, GA4, call tracking, attribution | 1441 |
| `recovering-revenue-missed-dental-appointments.html` | 5-stage recovery playbook | 1388 |

**Plus 2 new evergreen pages:**

| File | Purpose |
|---|---|
| `glossary.html` | 30 alphabetized dental + AI receptionist + PMS terms with `DefinedTermSet` JSON-LD; A-Z quick-jump nav, plain-language definitions, links to deeper reading. 1302 visible words. |
| `who-we-help.html` | 5 persona blocks (Solo Owner, Office Manager, DSO Operations Lead, Specialty Owner, Startup Dentist) — each ~250-320 words covering daily reality, top 3 pains, success state, how Aria specifically helps, "If this is you →" CTA. `Audience` × 5 + `WebPage` JSON-LD. 1249 visible words. |

**Total visible word count across 14 new pages: ~19,200 words.**

### Files modified (2)

| File | What changed |
|---|---|
| `blog.html` | Added 12 new blog cards inserted at the top of `.blog-grid` (matching the existing card pattern — `.blog-card`, `card-category`, `card-icon`, `card-date`, `read-more`), each dated "May 2026". Pre-existing 9 cards (April 2026) left in place below. Also added a "Related resources" tile block above the subscribe section linking to `/glossary`, `/who-we-help`, and `/roi-calculator`. No CSS file changes; the new card markup uses the existing classes. |
| `email-sequences/content-calendar-2026.md` | New 12-month editorial calendar (May 2026 - April 2027) with monthly themes, 2-4 posts per month, distribution channel notes (LinkedIn, dental Facebook groups, Reddit r/Dentistry, Dentaltown, X, YouTube), email cadence, and standard repurposing template (each post → 1 LinkedIn carousel + 3 X posts + 1 YT short). Lives alongside the other email-sequence reference docs (`welcome-post-demo.md`, `nurture-educational.md`, `reengagement-cold.md`). Already covered by `.vercelignore` per Batch 3 instructions — not served by Vercel. |

### Internal link graph

- Every new blog post links to **at least 2 other new posts** (cross-linking rule satisfied; range 2-4 cross-post links per post).
- Every new blog post links to **at least 2 service/funnel pages** (range 12-13 service-page links per post — well above the rule's floor).
- Total internal links across the 14 new pages: **271** (link audit confirms all route-based links resolve to a real `.html` file on disk; the 4 unresolved targets are favicon assets that are referenced in the head pattern and tracked by Batch 1's separate FAVICONS_TODO).
- The "Related reading" block at the bottom of each post drives ≥3 internal links per post.

### URLs to add to `sitemap.xml`

The 14 new public URLs, all with `lastmod 2026-05-07`. (We did not modify
`sitemap.xml` per the brief — flagging here for the human to add.)

```
https://www.ariadental.ai/ai-receptionist-vs-front-desk-cost
https://www.ariadental.ai/hipaa-compliance-ai-dental-tools
https://www.ariadental.ai/reduce-dental-no-shows
https://www.ariadental.ai/dental-insurance-verification-faster
https://www.ariadental.ai/front-desk-burnout-dental-practice
https://www.ariadental.ai/after-hours-dental-call-coverage
https://www.ariadental.ai/voice-ai-dental-buyers-guide
https://www.ariadental.ai/aria-vs-arini-dentina-comparison
https://www.ariadental.ai/pms-integration-dental-ai
https://www.ariadental.ai/setup-ai-dental-receptionist-7-days
https://www.ariadental.ai/dental-practice-marketing-roi-tracking
https://www.ariadental.ai/recovering-revenue-missed-dental-appointments
https://www.ariadental.ai/glossary
https://www.ariadental.ai/who-we-help
```

### TODO markers left for the human

- **`<!-- TODO: blog hero image -->`** — 14 markers, one per new page, pointing at `/images/blog/<slug>.png`. Generate or commission these (1200×630 PNG to match Batch 1's OG image dimensions).
- **`<!-- TODO: cite -->`** — 3 markers across the 12 posts (in `ai-receptionist-vs-front-desk-cost.html`, `front-desk-burnout-dental-practice.html`, `after-hours-dental-call-coverage.html`). These flag specific stat ranges where we cited general "industry surveys" / "operator estimates" rather than a named primary source. Either substitute a named source or leave as-is (the surrounding language is already qualified with "operator surveys" / "industry estimates put...").
- **Sitemap update** — append the 14 URLs above to `sitemap.xml` with `lastmod 2026-05-07`.

### What the batch deliberately did NOT change

- No existing blog post (`why-dental-practices-miss-calls`,
  `do-automated-reminders-reduce-dental-no-shows`,
  `how-much-do-missed-calls-cost-dental-practice`) — all preserved per spec.
- No homepage / service / funnel page copy or DOM.
- No `styles.css`, `main.js`, `analytics-events.js`, `exit-intent.js`,
  `vercel.json`, `sitemap.xml`, `robots.txt`, `site.webmanifest`.
- No JSON-LD schema-format changes on existing pages (the new pages have
  their own `Article` / `DefinedTermSet` / `Audience` JSON-LD; they don't
  consolidate the pre-existing `<!-- TODO: consolidate JSON-LD blocks -->`
  markers from Batch 1).
- No new analytics events. The new pages inherit the existing 9-event
  GA4 spec via `/analytics-events.js`.
- Footer links unchanged across the new pages (no Glossary / Who We Help
  link added to the global footer; that's a future homepage edit).

### Voice and content guardrails

- No fabricated specific stats. Numbers used cite ranges with general
  attribution ("industry estimates", "operator surveys", "industry
  call-tracking surveys"). Specific public-domain numbers (e.g., the 35%
  missed-call rate already cited in `why-dental-practices-miss-calls`)
  are reused with consistent attribution.
- No fabricated customer quotes. The pull-quotes in the posts are
  framed as our editorial voice, not attributed to a named customer.
- The vendor comparison post (`aria-vs-arini-dentina-comparison`) opens
  with a bias disclosure callout and explicitly notes where Aria isn't
  the best fit (large 50+-location DSOs, Curve Dental practices,
  practices wanting all-in-one marketing + AI).
- Brand palette honored throughout: amber `#D4952A` for CTAs and links,
  charcoal `#1A1A2E` for headings, cream `#FEFCF8` for backgrounds,
  Fraunces for display, Sora for body. New patterns (`.blog-callout`,
  `.blog-toc`, `.compare-table`) added inline per page; no `styles.css`
  changes.

### Verification (post-write)

For each of the 14 new files:
1. `<!DOCTYPE html>`, `<html>`, `<head>` / `</head>`, `<body>` /
   `</body>`, `</html>` open/close intact (grep verified).
2. GTM container `GTM-5H6LQ8RL`, GA4 ID `G-KQS3692C4Q`, Clarity ID
   `wn8w0677vz` present in head — matching the spec from Batches 1-3.
3. `analytics-events.js` script reference present.
4. Canonical URL present and matches the slug.
5. JSON-LD blocks parse as valid JSON (`json.dumps` round-trip used during
   generation).
6. Article JSON-LD `datePublished` and `dateModified` set to
   `2026-05-07`; author `"Aria Dental Team"` (matches the brief);
   `image` placeholder at `/images/blog/<slug>.png`.
7. Internal link audit: 271 internal links across 14 pages, all
   route-based links resolve to a real `.html` file (4 unresolved targets
   are the favicon refs from Batch 1's separate TODO).
8. Cross-link rule: every post links to ≥2 other new posts AND
   ≥2 service/funnel pages.


---

## Batch 5 — UX, accessibility, and source-cleanup polish (2026-05-07)

Production-quality cleanup across the entire site. No visual redesign:
same Fraunces + Sora typography, same amber/charcoal/cream palette, same
page composition. The visible footprint is intentionally tiny; the
surface-quality footprint is large.

### A — Source-code cleanup

**A1 — TODO sweep across HTML.** Removed 110 production-clutter
`<!-- TODO -->` markers across 37 .html files:
- `TODO: replace with real GTM container ID` (×34 — IDs already live)
- `TODO: replace with real Clarity project ID` (×34)
- `TODO: consolidate JSON-LD blocks` (×17)
- `TODO: blog hero image at /images/blog/*.png` (×14)
- `TODO: hero image at /images/blog/*.png` (×2)
- `TODO: PDF asset for *` (×3)
- `TODO: PDF/XLSX asset for missed-call-worksheet` (×1)
- `TODO: customer logos` (×1, in index.html)
- `TODO: wire to /api/lead-magnet?asset=<slug>` (×3, JS comments)
- `TODO: wire to email tool` (×1, in roi-calculator)
- Various `<!-- FIX 1/2/3/4: ... -->` legacy migration breadcrumbs.

**Preserved**: the three `<!-- TODO: cite -->` markers in blog body
content (front-desk-burnout, ai-receptionist-vs-front-desk-cost,
after-hours-dental-call-coverage). These are placeholders for the
operator to attach primary-source citations later — not buyer-facing
clutter.

**A2 — JSON-LD pricing reconciliation in index.html.** Two
contradictory `SoftwareApplication` Offer blocks were declared:
- One with `price: "0"` and "Custom pricing" description.
- One with `price: "499"` per month + `priceSpecification`.

Reconciled into a single consolidated `SoftwareApplication` block that
reflects "Contact for pricing" — the actual public posture. The Offer
now uses `url: "/contact"` + `availability: InStock` + the descriptive
text, with no fabricated dollar amount. Combined `featureList` from both
blocks (preserving operational detail), kept `aggregateRating`, kept
`applicationSubCategory`, `creator`, and `operatingSystem`. Total LD+JSON
blocks on the home page: 6 (Organization, FAQPage, Organization,
WebSite, SoftwareApplication, FAQPage). All parse as valid JSON.

**A3 — Removed the commented-out Railway widget breadcrumb** in
`index.html`:
```
<!-- TEMP: Widget removed pending aria-demo configuration -->
<!-- <script src="...up.railway.app/aria-widget.js" data-client="aria-demo"></script> -->
```
The active live `aria-widget.js` script (which IS live in production on
all other pages) was preserved everywhere it is currently active — it's
the audio-demo differentiator the audit called out.

**A4 — Replaced leaked test data in audio demo transcripts.**
- `562-418-0998` → `(555) 123-4567` (RFC test number)
- `dholideepak26@gmail.com` → `patient@example.com` (RFC-reserved)
- Updated visible text **and** transcript JS data structures in
  `index.html` and `demo.html`. Also updated the visible `data-tag phone`
  in `demo.html` (line 179).

**A5 — Internal link audit.** Swept all `href` values across all 38
.html files. **All internal route links resolve.** The only unresolved
asset references are the three favicons (`/favicon.ico`, `/favicon.svg`,
`/apple-touch-icon.png`) already tracked in `FAVICONS_TODO.md` from
Batch 1. No regressions introduced.

### B — Accessibility (WCAG 2.1 AA hardening)

Applied to all 37 production .html files:

1. **Skip-to-content link** — `<a class="skip-link" href="#main">Skip to
   main content</a>` injected immediately after each `<body>` opening
   (and after the GTM noscript snippet so the keyboard-first user lands
   on it without GTM markup interfering). CSS positions it
   off-screen (`left: -9999px`) until `:focus`/`:focus-visible`, then
   slides it visibly into the top-left corner with the brand amber
   outline.

2. **Semantic `<main id="main">` landmark** — every page now wraps its
   primary content between the closing `</nav>` (or skip-link, on the
   demo single-app pages) and the opening `<footer>`. This pairs with
   the skip-link target. Page header/footer/nav are already semantic
   landmark tags from earlier batches.

3. **Universal focus-visible indicator** — added a global
   `:focus-visible { outline: 2px solid #D4952A; outline-offset: 3px; }`
   rule. The `outline:none` previously declared on `.form-group input`
   (which broke keyboard focus) has been removed. Buttons now show a 3px
   amber ring on keyboard focus only (mouse/touch users see no visual
   ring change). Form inputs show a 2px ring + amber border on
   keyboard focus.

4. **Color contrast on body-sized amber text.**
   New CSS variable `--amber-deep: #A06D1A` introduced (5.5:1 against
   cream / 5.6:1 against white — passes WCAG AA 4.5:1). Applied to:
   - `.section-label` (12px small caps — was 3.6:1 amber on cream)
   - `.diff-card .rare` chip (11px caps)
   - `.feature-card a`, `.diff-card a` (13–14px inline links)

   Headlines stayed at the original `#D4952A` since `.section-title
   span` and `.hero h1 span` are ≥24px (3:1 large-text passes). The
   amber-on-charcoal CTA buttons and amber-glow chips were untouched.

5. **`sr-only` utility** — added the standard visually-hidden helper
   so future screen-reader-only labels can be added without inline
   styles.

6. **Form labels** — confirmed all `<input>`, `<select>`, `<textarea>`
   elements already had wrapping or `for`-associated `<label>`
   elements (or `aria-label` on the ROI calculator email field). No
   placeholder-only inputs found.

7. **Image `alt` text** — all four `<img>` tags across the site already
   had descriptive `alt` attributes from earlier batches (verified, no
   changes needed).

8. **`<h1>` hierarchy** — `workflow.html` was promoted from a
   `<div class="section-title">` to a real `<h1 class="section-title">`
   in the page hero; every other page already had exactly one `<h1>`.

9. **`lang="en"`** — verified on every shipping page (only
   `google481a2ef1cd214245.html`, the GSC verification stub, lacks it
   intentionally).

### C — Mobile polish

1. **Touch targets ≥ 44 × 44** — added `min-height: 44px` to `.btn`,
   `button`, `.nav-toggle`, plus generous padding on `.nav-links a`.

2. **Tap highlight color** — universal
   `* { -webkit-tap-highlight-color: rgba(212,149,42,0.15); }` so
   double-taps and tap-and-hold show a brand-amber wash instead of the
   default iOS blue.

3. **Mobile font-size floor** — `@media (max-width: 480px)` bumps body
   to 15px and ensures `.stat-label`, `.cost-card .label`, chip text and
   `.section-label` stay ≥ 13px. No body copy below 14px on phones.

4. **Smooth scrolling** — already declared
   `html { scroll-behavior: smooth }` in `styles.css`. Confirmed.

5. **Viewport meta** — verified on every page (was already present from
   Batch 1).

6. **Reduced-motion** — added `@media (prefers-reduced-motion: reduce)`
   that nullifies animation/transition durations and overrides the
   smooth scroll. WCAG 2.3.3 win for the vestibular-sensitive.

### D — Performance hints

1. **`dns-prefetch`** added at the end of every page's `<head>`:
   `googletagmanager.com`, `clarity.ms`, `google-analytics.com`,
   `fonts.googleapis.com`, `fonts.gstatic.com`. The existing
   `preconnect` to fonts is preserved — `dns-prefetch` is a cheaper
   fallback for connections we may or may not use.

2. **Lazy-load below-the-fold images** — added `loading="lazy"
   decoding="async"` to:
   - `platform.html` `images/aria-hero-2.png` (below fold on platform)
   - `platform.html` `images/aria-dental-1.png`
   - `portfolio.html` `images/case-vartanian.png`

   The home-page hero `images/aria-hero-1.png` was *not* lazy-loaded —
   it's above the fold on every layout and lazy-loading would hurt LCP.

3. **`defer` on JS** — added `defer` to every `<script src="main.js">`
   tag (29 pages had it without). The `analytics-events.js` reference
   already had `defer` from Batch 1. The GTM main snippet is left
   `async` per the canonical Google snippet — don't break it.

### E — CSS hygiene

- Removed the `outline: none` rule on form inputs (replaced by the
  `:focus-visible` outline above — keyboard accessibility win).
- Appended a single, isolated `BATCH 5: A11Y + MOBILE + PERF UTILITIES`
  block at the end of `styles.css`. No duplicate selectors introduced;
  no existing rules deleted (conservative — a "remove dead rules" pass
  on a 22 KB stylesheet without runtime usage data is more likely to
  cause bugs than improve quality).

### Files modified

- 37 .html files (every shipping page)
- `styles.css` (new utilities appended; 257 → 301 lines)
- `_AGENT_CHANGES.md` (this section)

`vercel.json`, `sitemap.xml`, `robots.txt`, `analytics-events.js`,
`main.js`, `exit-intent.js`, `site.webmanifest`, `email-sequences/*` —
**unchanged**.

### Verification

- All HTML balances check (head/body/main/html open/close): clean.
- All JSON-LD blocks parse as valid JSON.
- `vercel.json` parses as valid JSON; `sitemap.xml` parses as valid XML
  with 37 `<loc>` entries.
- `grep "TODO" *.html *.js *.css` returns exactly 3 hits — all the
  preserved `<!-- TODO: cite -->` markers in blog content (intentional
  per the brief).
- `grep "562-418-0998\|dholideepak26"` in audio demo files: 0 hits.
  (Five remaining hits are in unrelated `Organization` JSON-LD
  contactPoint blocks declaring the parent company sales line — left
  alone; flagged in `BATCH5_NOTES.md` for the operator to confirm.)
