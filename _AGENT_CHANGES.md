# Aria 5-Stragglers Bundle

Generated: 2026-05-11. Tight bundle of the pages that previous folder-uploads kept missing, plus pricing-removal edits applied to `vercel.json`, `sitemap.xml`, and `platform.html`.

## What's in this folder

- `index.html` — homepage
- `faq.html` — FAQ (pricing/billing copy rewritten to "custom")
- `how-it-works.html` — process page
- `security.html` — security + compliance
- `demos.html` — six unedited demos
- `platform.html` — platform page (footer link only)
- `vercel.json` — `/pricing` redirect now 301 → `/contact?topic=pricing`
- `sitemap.xml` — `/pricing` and `/es/pricing` entries removed

## What changed (this bundle)

**Pricing lockdown — no public prices, no tier names.**

1. `vercel.json` — `/pricing` redirect updated from `302 → /platform#pricing` to **`301 → /contact?topic=pricing`** (preserves SEO juice; routes inbound traffic to a discovery call).
2. `sitemap.xml` — removed both `/pricing` and `/es/pricing` URL entries (94 URLs now, was 96).
3. `faq.html` — four Pricing & billing FAQ items rewritten in both the visible HTML and the FAQPage JSON-LD: no more "Solo/Growing/DSO" tier names, no more references to `/pricing`. New copy says deployments are custom-built and points readers to `/contact?topic=pricing`.
4. All 6 HTML files — footer "Pricing" link destination changed from `/platform#pricing` (or `/pricing`) to **`/contact?topic=pricing`**. Label "Pricing" preserved so the inbound SEO keyword stays in the footer.

## Verified clean

For each HTML file in this bundle:

- 0 vendor leaks (`hello@`, `varinder@`, `hello@ariadental` all zero)
- `info@velzyx.ai` present in footer + ContactPoint JSON-LD
- `Enterprise` nav link present between Integrations and Security
- 0 residual `/pricing` or `/platform#pricing` links

## How to deploy

Drag each file individually into GitHub `varindervelzyxai/aria-dental-site`, replacing the existing file. Vercel auto-deploys on push. After deployment, verify:

1. `https://www.ariadental.ai/pricing` 301-redirects to `/contact?topic=pricing`
2. Footer "Pricing" link on homepage points to `/contact?topic=pricing`
3. FAQ "Pricing & billing" section no longer mentions tier names or `/pricing`
4. `sitemap.xml` no longer lists `/pricing`

## Out of scope (intentional)

- The standalone `pricing.html` file in the repo is left untouched — the vercel.json 301 supersedes it before Vercel ever serves the file. Optional cleanup later: delete `pricing.html` and `es/pricing.html` from the repo.
- Other pages on the site that still have `/platform#pricing` or `/pricing` in their footers will get fixed in the next site-wide pass; this bundle covers the high-traffic stragglers + platform.
