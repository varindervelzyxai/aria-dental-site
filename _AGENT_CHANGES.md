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

