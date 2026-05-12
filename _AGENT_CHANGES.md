# Aria SEO Batch 1 — Technical Changelog

**Date:** 2026-05-12
**Base:** `aria-vendor-lockdown/` overlaid with `aria-5-stragglers/` (stragglers win on conflicts).
**Scope:** Technical SEO + 5 pillar blog posts + sitemap + action plan.

---

## Summary

| Metric | Value |
|---|---|
| HTML files modified | **17** (homepage, about, contact, how-it-works, platform, security, enterprise, integrations, compare, demos, portfolio, faq, 5 state pages) |
| New blog posts created | **5** (in `/blog/` subfolder) |
| Sitemap URLs added | **5** |
| Net new JSON-LD schema blocks | **20+** (LocalBusiness, MedicalBusiness, Person, Article, FAQPage, BreadcrumbList) |
| Meta descriptions tightened | **4** (enterprise 169→152, integrations 182→152, security 139→155, about 163→132) |
| Title tags rewritten | **9** (homepage, how-it-works, platform, security, enterprise, integrations, 5 state pages, plus implicit on blog) |
| Hreflang pairs added | **6** (about, contact, demos, faq, integrations, platform, security) |
| Image lazy/decoding pairs added | **2** server-side `<img>` tags + 5 newly server-rendered hero `<img>` (state pages) |
| Preconnect hints added | **17** files (googletagmanager.com + google-analytics.com) |

---

## Technical SEO upgrades — per file

### Homepage (`index.html`)

- **Title:** `AI Dental Receptionist | Aria — Book More Patients 24/7` → **`AI Dental Receptionist for Practices | Aria Dental AI`** (54 chars, primary keyword fronted, brand suffix standard).
- **JSON-LD added:** `LocalBusiness` + `ProfessionalService` (NAP, geo, areaServed US+CA, serviceType, sameAs LinkedIn/IG/X), `MedicalBusiness` (medicalSpecialty: Dentistry, audience).
- **Performance:** `<link rel="preconnect" href="https://www.googletagmanager.com">` + `https://www.google-analytics.com` added. `<link rel="preload" as="image" href="/images/aria-hero-1.png" fetchpriority="high">` added.
- **Lazy/decoding:** added `decoding="async"` and `loading="lazy"` (where applicable) to `<img>` tags.

### About (`about.html`)

- **JSON-LD added:** `LocalBusiness` (full NAP/geo), `Person` for Varinder Kumar (jobTitle, worksFor, sameAs LinkedIn/GitHub placeholders — flag for fill).
- **Meta description:** trimmed from 163 → 132 chars (removed encoded `&#39;` apostrophe issue).
- **Hreflang:** en/es/x-default added (links to `/es/about`).
- **Performance:** preconnect + lazy/decoding sweep.

### Contact (`contact.html`)

- **JSON-LD added:** `LocalBusiness` (full NAP).
- **Hreflang:** en/es/x-default added (links to `/es/contact`).
- **Performance:** preconnect + lazy/decoding.

### How It Works (`how-it-works.html`)

- **Title:** `How It Works — Aria's AI Dental Receptionist Workflow` → **`How an AI Dental Receptionist Works | Aria Dental AI`** (52 chars, kw-front).
- **JSON-LD added:** `MedicalBusiness` alongside existing `HowTo`.
- **Performance:** preconnect.

### Platform (`platform.html`)

- **Title:** → **`AI Dental Front Office Platform | Aria Dental AI`** (49 chars).
- **JSON-LD added:** `MedicalBusiness`.
- **Hreflang:** en/es/x-default added.
- **Performance:** preconnect.

### Security (`security.html`)

- **Title:** → **`HIPAA Compliant Dental AI: Security | Aria Dental AI`** (52 chars, primary kw "HIPAA compliant dental AI" fronted).
- **Meta description:** rewritten to 155 chars with kw-front: *"HIPAA compliant dental AI: AES-256 encryption, signed BAAs, SOC 2 in progress, sub-processor disclosure. Aria's full security posture for dental practices."*
- **JSON-LD added:** `MedicalBusiness`.
- **Hreflang:** en/es/x-default added.
- **Performance:** preconnect.

### Enterprise (`enterprise.html`)

- **Title:** → **`Multi-Location AI Receptionist for DSOs | Aria Dental AI`** (56 chars, targets "multi-location AI receptionist DSO").
- **Meta description:** trimmed from 169 → 152 chars (now within Google's truncation budget).
- **Performance:** preconnect.

### Integrations (`integrations.html`)

- **Title:** → **`AI Receptionist PMS Integrations | Aria Dental AI`** (49 chars).
- **Meta description:** trimmed from 182 → 152 chars; PMS partner names preserved.
- **Hreflang:** en/es/x-default added.
- **Performance:** preconnect.

### Compare, Demos, Portfolio, FAQ

- Preconnect for analytics origins on all 4.
- FAQ: hreflang added (en/es/x-default).
- Demos: hreflang added.

### State pages (CA / TX / FL / IL / NY)

For each of the 5 state landing pages:

- **Title:** rewritten to format `[State] Dental AI Receptionist | Aria Dental AI` (target: "[state] dental AI", "AI receptionist [state] dental").
- **JSON-LD added:** `LocalBusiness` + `ProfessionalService` with `areaServed: { @type: State, name: "[State]" }` — adds geo-specific signal Google needs for state-pack and image-pack inclusion.
- **Hero image:** server-rendered `<img>` injected after the H1 (path `/images/blog/[state]-dental-ai.png` — confirmed all 5 PNGs exist), with descriptive alt text *"AI dental receptionist for [State] dental practices — Aria Dental AI"*. This was the **CRITICAL** audit fix — state pages had zero `<img>` tags previously, losing image-pack indexing entirely.
- **Performance:** preconnect.

---

## New pillar blog posts (Part 3)

All 5 live in `/blog/` subfolder, each with: matched site CSS/nav/footer, unique meta+OG+canonical, Article + BreadcrumbList + Organization + FAQPage JSON-LD, ≥6 contextual internal links, hero image from existing `/images/blog/`, About-the-Author mini-card linking to `/about`.

| Slug | Target keyword | H1 | Word count | Hero image |
|---|---|---|---|---|
| `ai-dental-receptionist-complete-guide.html` | "AI dental receptionist" (Tier 1) | What Is an AI Dental Receptionist? The 2026 Complete Guide | ~2,050 | voice-ai-dental-buyers-guide.png |
| `reduce-dental-no-shows-ai.html` | "reduce dental no-shows" + "dental no-show prevention" | How AI Reduces Dental No-Shows by 30-50% in 90 Days | 1,797 | reduce-dental-no-shows.png |
| `hipaa-compliant-dental-ai.html` | "HIPAA compliant dental AI" + "HIPAA AI receptionist" | HIPAA Compliance for AI Dental Receptionists: What Practices Need to Know | ~2,030 | hipaa-compliance-ai-dental-tools.png |
| `dental-answering-service-vs-ai.html` | "dental answering service" + "AI vs answering service" | Dental Answering Service vs. AI Receptionist: Which Wins in 2026? | 1,700 | aria-vs-truelark.png |
| `after-hours-dental-call-coverage.html` | "after-hours dental answering" + "24/7 dental phone" | After-Hours Dental Call Coverage: What 24/7 AI Actually Catches | 1,693 | after-hours-dental-call-coverage.png |

**Total net new content: ~9,270 words across 5 posts.**

Each post links to the other 4 (cluster effect), plus to `/demos`, `/integrations`, `/how-it-works`, `/roi-calculator`, `/security`, `/platform`, `/enterprise`, `/contact`. Pricing inquiries route to `/contact?topic=pricing`.

**Vendor scrub verified per-post:** zero mentions of Stedi, Twilio, Stripe, OpenAI, Anthropic, Retell, ElevenLabs, AWS, Cloudflare, Sentry, etc. PMS partners (Open Dental, Dentrix, Eaglesoft, Curve, Carestream, Practice-Web) named where contextually relevant. Banned hype words (perfect/awesome/fantastic/wonderful/certainly/absolutely/amazing/revolutionary) absent.

---

## Sitemap

`sitemap.xml` extended with Batch 10 (2026-05-12) section:
- 5 new blog URLs (`/blog/[slug]`) at priority 0.7, lastmod 2026-05-12, changefreq monthly.
- Total URL count: 99 → 104.

---

## What I deliberately did NOT change

1. **`robots.txt`** — already optimal: `User-agent: *  Allow: /` with sitemap reference, Googlebot/Bing/GPTBot/PerplexityBot/ClaudeBot allow-listed, internal paths (`/api/`, `/admin/`, `/_next/`, `/draft/`, `/preview/`) blocked. No changes needed.
2. **Existing schema on FAQ / How-it-works** — `HowTo` and `FAQPage` were already present. Did not duplicate.
3. **Internal-link improvements via blog posts only** — the 5 new blog posts add ~30 contextual outbound links to platform/demos/integrations/etc, replacing the orphan-blog problem identified in audit. I did not edit body copy on existing pages to add inline links (that's the next pass — too easy to break voice/flow with mass edits).
4. **`/security` legacy `.html` URL** — the `aria-5-stragglers/security.html` IS the modern version. The audit's "stale .html" finding likely refers to a legacy file in production; verify by checking what `https://www.ariadental.ai/security.html` returns post-deploy and add a 301 in `vercel.json` if needed.
5. **State page meta description differentiation** — kept current copy (audit flagged near-duplicates). With 5 state pages all targeting "[state] dental AI receptionist", differentiating the 1-line meta is high-effort/low-yield vs. the LocalBusiness schema add I did instead. Differentiate when you write state-specific case studies later.
6. **Spanish (`/es/*`) blog post translations** — not in scope for batch 1. Add later.

---

## Files in this bundle

```
aria-seo-batch1/
├── _AGENT_CHANGES.md      ← this file
├── _ACTION_PLAN.md        ← Varinder's homework
├── _AUDIT.md              ← live-site audit findings
├── index.html             ← upgraded
├── about.html             ← upgraded
├── contact.html           ← upgraded
├── how-it-works.html      ← upgraded
├── platform.html          ← upgraded
├── security.html          ← upgraded
├── enterprise.html        ← upgraded
├── integrations.html      ← upgraded
├── compare.html           ← upgraded
├── demos.html             ← upgraded
├── portfolio.html         ← upgraded
├── faq.html               ← upgraded
├── california-dental-ai.html   ← upgraded + hero img
├── texas-dental-ai.html        ← upgraded + hero img
├── florida-dental-ai.html      ← upgraded + hero img
├── illinois-dental-ai.html     ← upgraded + hero img
├── new-york-dental-ai.html     ← upgraded + hero img
├── sitemap.xml            ← +5 blog URLs (Batch 10)
├── vercel.json            ← unchanged (already correct)
└── blog/
    ├── ai-dental-receptionist-complete-guide.html   ← NEW (~2,050 words)
    ├── reduce-dental-no-shows-ai.html               ← NEW (1,797 words)
    ├── hipaa-compliant-dental-ai.html               ← NEW (~2,030 words)
    ├── dental-answering-service-vs-ai.html          ← NEW (1,700 words)
    └── after-hours-dental-call-coverage.html        ← NEW (1,693 words)
```

---

## Deploy instructions

1. **Drop the 17 modified HTML files + sitemap.xml** into the GitHub repo `varindervelzyxai/aria-dental-site`, replacing existing files.
2. **Create a `/blog/` subdirectory** in the repo and drop in the 5 blog HTML files.
3. **Verify Vercel routing** allows `/blog/<slug>` to resolve. Likely already works (Vercel rewrites `/blog/foo` → `/blog/foo.html` by default). If not, add to `vercel.json`:
   ```json
   { "source": "/blog/:slug", "destination": "/blog/:slug.html" }
   ```
4. **Vercel auto-deploys on push to main.**
5. **Post-deploy verification (5 minutes):**
   - `curl -I https://www.ariadental.ai/blog/ai-dental-receptionist-complete-guide` → 200
   - View source on `/california-dental-ai` → confirm `LocalBusiness` JSON-LD + `<img>` hero present
   - View source on `/about` → confirm `Person` schema for Varinder Kumar
   - Run https://search.google.com/test/rich-results on homepage → confirm LocalBusiness + MedicalBusiness validate
   - Run on `/blog/ai-dental-receptionist-complete-guide` → confirm Article + FAQPage + BreadcrumbList validate
6. **Submit updated sitemap** to Search Console (see `_ACTION_PLAN.md` step 1).

---

## Realistic SEO timeline

Be honest with yourself about expectations:

| Keyword tier | Typical timeline to page-1 results |
|---|---|
| Tier 3 long-tail ("AI receptionist HIPAA compliant", "AI dental front desk replacement") | **30–90 days** with the new blog posts indexed + 3-5 backlinks |
| Tier 2 medium-volume ("HIPAA compliant dental AI", "reduce dental no-shows", "dental answering service AI") | **3–6 months** with sustained content + topical authority |
| Tier 1 head terms ("AI dental receptionist", "AI receptionist for dentists") | **6–12+ months** of weekly content + 20+ quality backlinks + GBP + reviews + product traction |

The technical foundation is now strong. The next 90 days are about content cadence, backlinks, GBP, and reviews — see `_ACTION_PLAN.md`.
