# Aria Dental — SEO Audit (Live Site, 2026-05-11)

Pages audited: home, how-it-works, platform, integrations, compare, enterprise, about, security, portfolio, demos, roi-calculator, california, texas (florida/illinois/new-york confirmed identical pattern), sitemap.xml, robots.txt.

robots.txt: clean. 96-URL sitemap submitted, includes hreflang xhtml:link entries for /es/* pages — good.

---

## Findings grouped by severity

### CRITICAL
- **Security page is a stale, broken outlier.** Uses `.html` extensions (rest of site is extensionless), navigation only shows "Aria vs Weave" (missing Demos/Compare/About/Integrations/Enterprise), missing canonical, missing all OG/Twitter tags, missing SoftwareApplication/FAQPage/Organization JSON-LD that every other page has, footer email is `varinder@velzyx.ai` while site standard is `info@velzyx.ai`/`hello@ariadental.ai`. Likely an old static export still being served — risks duplicate-content (`/security` vs `/security.html`) and damages a high-trust page.
- **State pages (CA/TX/FL/IL/NY) have ZERO images and ZERO LocalBusiness schema.** State landers are competing for local intent ("california dental ai") with thin content, no hero/illustration, and no `LocalBusiness`/`Service` with `areaServed.geoCoverage` or city-level `Place` markup beyond a single State name. Currently only Service + Article + BreadcrumbList + Organization. Local-pack and image SERPs both lost.

### HIGH
- **Hreflang missing on most English pages** despite /es/ equivalents existing in sitemap. The sitemap declares them, but the HTML `<link rel="alternate" hreflang>` is only present on home, platform, demos. Pages: how-it-works, integrations, compare, about, security, portfolio, roi-calculator, enterprise, all 5 state pages — no hreflang in `<head>`. Causes Google to pick wrong-language version for Spanish queries.
- **No `loading="lazy"` on below-fold images** across home, integrations, compare, about, security, demos, roi-calculator, enterprise, all state pages. Only platform (2/2) and portfolio (1/1) implement it. CWV/LCP regression risk.
- **Enterprise meta description is 170 chars** (recommended 150-160). Will truncate in SERP.
- **Integrations meta description is 187 chars.** Truncates in SERP.
- **About page heading hierarchy skips H3 entirely** (6×H2 → 4×H4, no H3). Same on how-it-works (1×H2 → 30×H4, zero H3). Both fail accessibility and break section-outline algorithms.

### MEDIUM
- **Most images appear client-rendered, not server-rendered `<img>` tags.** Home returns only 1 `<img>` in HTML; security/integrations/compare/how-it-works/roi-calculator/demos/enterprise/state pages return 0 server-side `<img>`. Means no Image SERP indexing for product mockups, no alt-text SEO value, and JS-render dependency for image discovery. Add static `<img>` (with alt) wrappers around hero illustrations.
- **Homepage heading shape: 1 H1, 1 H2, 3 H3, 19 H4.** Heavy H4 usage where H3 belongs (feature cards "Empathy AI", "Live Insurance Verification" etc. should be H3, not H4). Topical depth signal weakened.
- **Compare page has 0 H3** (8 H2 → 3 H4). Cards "Live Insurance Verification / Payment Collection / Empathy AI" should be H3.
- **Demos page missing `VideoObject` / `AudioObject` / `HowTo` schema** despite 6 audio demos with full transcripts. Has only ItemList + Organization. Adding `AudioObject` per demo would unlock rich-results for transcripts.
- **Integrations page missing `SoftwareApplication` / `Product` schema** for Open Dental, Dentrix, Eaglesoft etc. Each PMS card is essentially a `Service` offering; mark up as ItemList of Service or SoftwareApplication.
- **Sitemap lists 96 URLs but several look orphan / shell.** `/workflow` (priority 0.5), `/demo-booking`, `/demo-gcal`, `/demo-reschedule` (0.6 each) — no inbound nav links observed. Confirm or `noindex`.
- **Footer link inconsistency.** Home/Platform/How-It-Works footers list "Pricing → /platform#pricing"; Integrations/Enterprise list "Pricing → /pricing". Pick one.
- **Email inconsistency.** Footers vary: home/integrations/demos use `hello@ariadental.ai`; platform/how-it-works/portfolio/about/enterprise/compare use `info@velzyx.ai`; security uses `varinder@velzyx.ai`. NAP consistency hit.
- **State pages share near-identical title pattern** ("AI Dental Receptionist for X Practices — Aria") and 99%-similar meta descriptions (state name swapped). Borderline doorway/duplicate-content; differentiate by state-specific PMS adoption stats, payer mix, city callouts.

### LOW
- **og:image on Integrations is the generic `aria-hero-1.png`** while every other page uses dedicated `/images/og/<page>.png`. Create `og/integrations.png`.
- **Demos page has `MediaObject`** but no per-demo `AudioObject` `contentUrl`. Add for richer indexing.
- **About page Person schema for Varinder Kumar** — great. Add `sameAs` LinkedIn/Twitter to strengthen entity graph.
- **No `BreadcrumbList` on home, security, demos, about, integrations**. Add for consistency (home is optional).
- **Sitemap `<changefreq>weekly</changefreq>` on /demos, /portfolio, /case-studies** while content is stable. Set monthly to avoid wasted crawl signals.
- **robots.txt blocks Ahrefs/Semrush/MJ12** — fine for crawl-budget but kills your own competitive-intel SaaS reads. Consider verified-bot whitelist for tools you actually pay for.

---

## Page-by-page (one-liner each)

| Page | Most-impactful issue | Severity | Fix |
|---|---|---|---|
| / | H4 overuse (19) where H3 belongs | Medium | Re-tag feature/FAQ cards as H3 |
| / | Only 1 server-side `<img>` | Medium | Server-render hero/feature images for indexing |
| /how-it-works | 1 H2, 30 H4, 0 H3 | High | Insert H3 layer between H2 sections and H4 cards |
| /platform | Heading mostly fine; clean | — | None blocking |
| /integrations | 187-char description, no SoftwareApp schema, generic OG image | High | Trim to 155, add per-PMS schema, custom OG |
| /compare | 0 H3, all H4 cards | Medium | Promote diff cards to H3 |
| /enterprise | 170-char description | High | Trim to 155 |
| /about | 0 H3 between H2 and H4; missing hreflang | High/Med | Add H3 layer, add hreflang link |
| /security | Stale .html version with broken nav, no canonical, no OG, wrong email | **Critical** | Rebuild from current template; 301 .html → extensionless |
| /portfolio | Clean | — | None blocking |
| /demos | No AudioObject schema | Medium | Add per-demo AudioObject |
| /roi-calculator | Missing hreflang | Medium | Add hreflang |
| /california, /texas, /florida, /illinois, /new-york | 0 images, 0 LocalBusiness, near-duplicate descriptions | **Critical** | Add hero image, LocalBusiness/Service+Place, differentiate per state |
| /sitemap.xml | Includes likely-orphan /workflow, /demo-booking, /demo-gcal, /demo-reschedule at 0.5–0.6 | Medium | Verify or noindex |
| /robots.txt | Clean — Googlebot/Bing/GPT/Perplexity/Claude allowed; Ahrefs/Semrush/MJ12 blocked | Low | Whitelist tools you pay for |
