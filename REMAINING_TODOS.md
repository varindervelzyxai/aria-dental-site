# Aria Dental Site — Remaining TODOs / Placeholders

A complete punch-list of everything on the live site that still needs to be filled out, replaced, or set up externally. Each item lists the file path(s) where the placeholder lives so you can find it fast.

Generated 2026-05-09 from a full repo sweep across `*.html`, `*.json`, `*.md`, `*.css`, `*.js`. After-the-fact references in `_AGENT_CHANGES.md` were excluded (that file is the changelog narrative, not the live site).

---

## 1. Email mailboxes referenced on the live site

The site links to these addresses via `mailto:`. If a mailbox doesn't exist, the link bounces. Set them up (or alias them) before a real visitor sends mail.

- [ ] **enterprise@ariadental.ai** — referenced from `enterprise.html` (DSO custom-pricing CTA)
- [ ] **security@ariadental.ai** — referenced from `security.html`, `responsible-disclosure.html`
- [ ] **press@ariadental.ai** — referenced from `press.html` (5+ links: hero CTA, brand assets fallback, coverage section, founder interviews, conference bookings)
- [ ] **partnerships@ariadental.ai** — referenced from `press.html` (partnership inquiries block)
- [ ] **privacy@ariadental.ai** — referenced from `privacy.html`, `cookies.html`
- [ ] **legal@ariadental.ai** — referenced from `terms.html`
- [ ] **support@ariadental.ai** — referenced from `help.html` (hero CTA + body), every page's contact-point JSON-LD `"contactType":"customer support"`
- [ ] **hello@ariadental.ai** — referenced in every footer (`footer-brand` block) + every page's contact-point JSON-LD `"contactType":"sales"`. Also fallback in `index.html` lead-magnet error message.
- [x] **info@velzyx.ai** — confirmed exists per Varinder. Now wired into `about.html` (Careers section) and 87 other pages' footer Careers links by this update.

> **Tip:** if you can't stand up 8 separate mailboxes in Zoho, alias all of them to a single inbox (e.g. `info@velzyx.ai`) and prioritize by "To:" header. The user-visible addresses still need to resolve.

---

## 2. Image assets that are missing (live `<img>` tags will 404)

A full sweep of `images/*.(png|jpg|svg)` references found **27 missing files**. Grouped:

### Founder / team
- [ ] **`images/team/varinder-kumar.jpg`** — referenced from `about.html` (inline TODO comment we just placed; the rendered `team-photo-slot` currently shows the letter "V" placeholder until this file exists)

### Customer / case study
- [ ] **`images/case-wizkids.png`** — referenced from `case-studies.html` and `portfolio.html` (the WizKids hero image; old `images/case-vartanian.png` is still on disk and unused)

### Brand
- [ ] **`images/aria-logo.png`** — referenced from JSON-LD `"logo"` blocks across **most pages** (the actual `aria-logo.png` is missing despite being the canonical logo URL in Organization schema)

### Article inline illustrations
- [ ] **`images/articles/automated-reminders.png`** — `do-automated-reminders-reduce-dental-no-shows.html`
- [ ] **`images/articles/missed-calls-cost.png`** — `how-much-do-missed-calls-cost-dental-practice.html`
- [ ] **`images/articles/missed-calls-cover.png`** — `dental-missed-calls-ai.html`
- [ ] **`images/articles/verify-insurance.png`** — `verify-insurance-during-the-call.html`

### OG / social share images (16 missing)
Only `images/og/enterprise.png` exists today. **All 16 of the others referenced in `og:image` / `twitter:image` meta are missing**, so social-share previews and Slack/iMessage unfurls will render broken or fall back to nothing:
- [ ] `images/og/home.png`
- [ ] `images/og/og-default.png`
- [ ] `images/og/platform.png`
- [ ] `images/og/how-it-works.png`
- [ ] `images/og/compare.png`
- [ ] `images/og/portfolio.png`
- [ ] `images/og/blog.png`
- [ ] `images/og/contact.png`
- [ ] `images/og/demo.png`
- [ ] `images/og/roi-calculator.png`
- [ ] `images/og/workflow.png`
- [ ] `images/og/insurance-verification.png`
- [ ] `images/og/missed-calls.png`
- [ ] `images/og/after-hours.png`
- [ ] `images/og/ai-for-dentists.png`
- [ ] `images/og/ai-for-dental-groups.png`

### OG variants for older articles
- [ ] `images/og/articles/automated-reminders.png`
- [ ] `images/og/articles/cost-of-missed-calls.png`
- [ ] `images/og/articles/verify-insurance.png`
- [ ] `images/og/articles/why-miss-calls.png`

> **Note:** every blog post in `images/blog/*.png` is accounted for — that directory has 43 files and matches all 37 unique blog OG references. The gap is only in `images/og/` and `images/articles/`.

### Favicons / PWA icons
A separate `FAVICONS_TODO.md` already exists at the repo root listing 10 missing icon files (`favicon.ico`, `favicon-16x16.png`, `favicon-32x32.png`, `favicon-48x48.png`, `apple-touch-icon.png`, `android-chrome-192x192.png`, `android-chrome-512x512.png`, `maskable-icon-512x512.png`, `safari-pinned-tab.svg`, `mstile-150x150.png`). These are referenced from every page's `<head>`. Generate via RealFaviconGenerator from a 1024×1024 Aria "A" mark in amber `#D4952A` on charcoal `#1A1A2E`.

---

## 3. Audio assets

### Existing but wrong content
- [ ] **`aria-call-demo.mp3`** (used on `index.html` and `demo.html`) — the audio still says "Dr. Vartanian's dental office" while the on-screen transcripts have been rewritten to WizKids. **Re-record** with WizKids language or generic "this is Aria" framing so audio + transcript match.

### Referenced but don't exist (the entire `/audio/` folder is missing)
The `demos.html` page has 6 audio players + a `MediaObject` JSON-LD block that all link to `/audio/demo-*.mp3`. Until these MP3s are created, every player on `/demos` shows broken audio:
- [ ] **`/audio/demo-insurance-verification.mp3`** (~1m35s — insurance verification flow)
- [ ] **`/audio/demo-book-self.mp3`** (~1m10s — patient books for self)
- [ ] **`/audio/demo-book-child.mp3`** (~1m35s — parent books for child)
- [ ] **`/audio/demo-sms-billing.mp3`** (~45s — SMS billing link for copay)
- [ ] **`/audio/demo-recall-automation.mp3`** (~55s — recall automation)
- [ ] **`/audio/demo-history-lookup.mp3`** (~1m35s — past appointment history lookup)

> Cartesia is one option for synthesizing these in the same Aria voice used elsewhere; durations above match the JSON-LD that's already published, so try to land within those windows for SEO/structured-data accuracy.

---

## 4. Customer-supplied content

- [ ] **WizKids Dental real metrics** — `case-studies.html` line 174 displays "Full case study with metrics published Q3 2026 with customer approval." Pull live numbers (calls answered, after-hours bookings, insurance-verifications-per-week, etc.) and replace the placeholder card.
- [ ] **WizKids Dental real domain** — confirm `wizkidsdental.com` is the correct external link (currently used in case-studies.html outbound link if any). If different, update.
- [ ] **WizKids customer quote / testimonial** — `index.html` line 264 still shows `<em>WizKids Dental story coming soon — Q3 2026 with customer approval.</em>`. Replace with a real attributed quote when approved.
- [ ] **Customer story #2 / #3** — `case-studies.html` line 188 shows "More stories coming soon" placeholder card. Add real second + third customer when ready.
- [ ] **`[Practice Name]` template tokens** — left in 4 email-sequence files (intentional merge tags, not placeholders): `email-sequences/customer-expansion.md` line 68, `email-sequences/win-back-canceled.md` line 117, `email-sequences/onboarding-post-signup.md` line 70, `recovering-revenue-missed-dental-appointments.html` line 203 (sample script, not a real form). These are intentional — confirm they get filled at send-time by your ESP.

---

## 5. Vendor / claim confirmations

- [ ] **Confirm "Denticon" vendor name** — site uses "Denticon" (Planet DDS) in FAQ JSON-LD on `index.html` and `ai-for-dentists.html`. Original brief mentioned "Dentalcon" — confirm Denticon is correct (or replace globally if not).
- [ ] **Pricing tiers in `pricing.html`** — three rows currently show `$ — / month` with `<!-- TODO: confirm pricing -->` markers (lines 162, 180, 198). Decide whether to publish dollar amounts or keep "Contact for a custom quote." If publishing, fill all three.
- [ ] **Practice-Web API integration timeline** — `aria-for-practice-web.html` line 84/97 shows TBD on insurance plan write-back. Confirm or remove.
- [ ] **Carestream / SoftDent treatment-plan visibility** — `aria-for-carestream.html` line 97 shows "TBD pending Carestream API access." Confirm timeline or remove.
- [ ] **Lab-management software integration** — `aria-for-prosthodontics.html` line 93 shows "Lab management software integration is TBD." Confirm or remove.

---

## 6. Press kit / brand assets

`press.html` — multiple placeholders:
- [ ] **`[Founder Name]`** still appears on lines 79 and 109 of `press.html` (founder card + bio paragraph). Replace with **Varinder Kumar** + DRE-broker-turned-engineer narrative (parallel to `about.html`).
- [ ] **Wordmark — light** asset (PNG + SVG) — line 92, "Coming soon"
- [ ] **Wordmark — dark** asset (PNG + SVG) — line 93, "Coming soon"
- [ ] **Square mark** asset (1024×1024 PNG) — line 94, "Coming soon"
- [ ] **Brand guidelines** asset (PDF) — line 95, "Coming soon"

---

## 7. Lead-magnet / form wiring

- [ ] **PDF: `buyers-guide.pdf`** — referenced by the lead-magnet form on `index.html` (`<!-- TODO: PDF asset for buyers-guide -->`)
- [ ] **PDF/XLSX: `missed-call-worksheet`** — referenced by ROI calculator
- [ ] **PDF: `verification-audit.pdf`** — referenced by another lead-magnet form
- [ ] **API endpoint `/api/lead-magnet?asset=<slug>`** — currently posting via web3forms as interim transport (`<!-- TODO: wire to /api/lead-magnet?asset=<slug> -->` in roi-calculator and index)
- [ ] **Email tool wiring on ROI calculator** — `<!-- TODO: wire to email tool -->` in `roi-calculator.html`
- [ ] **Newsletter form on `/changelog` and `/resources`** — currently a placeholder; pick an ESP and wire it.
- [ ] **Site-wide search on `/resources`** — currently routes to `/blog` only ("Site-wide search coming soon").

---

## 8. Accounts / external setup

- [ ] **GA4: mark 3 events as Key events** — after they fire on the live site at least once:
  - `roi_email_capture`
  - `lead_magnet_capture`
  - `exit_intent_clicked`
- [ ] **GA4: add `varinder@velzyx.ai` as Admin** to the GA4 property (currently owned by Coldwell Banker realtor account). Transfer ownership when access is added.
- [ ] **Search Console: link to GA4** for organic-traffic attribution.
- [ ] **Capterra listing** — set up dental-software directory listing.
- [ ] **G2 listing** — set up product page with category + feature tags.
- [ ] **Google Business Profile** — set up for "Aria by Velzyx AI" at the Newport Beach address (5000 Birch St, Suite 3000).
- [ ] **Remove inline GA4 snippet** from every `.html` file once GTM is verified live in DebugView. Currently both fire (double-counting). Roughly 23 files × 2 lines each — see `_AGENT_CHANGES.md` line 162 for the cleanup spec.

---

## 9. Legal review

- [ ] **`/privacy`** — full lawyer review before launch (HIPAA notice block in particular).
- [ ] **`/terms`** — full lawyer review.
- [ ] **`/cookies`** — full lawyer review (Cookie Policy + tracking disclosures).

---

## 10. Spanish content review

- [ ] **`es/platform.html` line 84** — `<!-- TODO: native speaker review -->` flagging integrations sub-line. The other 4 `/es/` pages (Mexican-Spanish business tone) should also get a native review pass before high-traffic season.

---

## 11. Blog post citations

Five `<!-- TODO: cite -->` markers across 5 files. Surrounding language is already qualified ("operator surveys" / "industry estimates"), so these can either be cited with a named primary source or left as-is — your call:

- [ ] `front-desk-burnout-dental-practice.html` line 169 — $11K-$16K front-desk replacement cost claim _(Batch 4)_
- [ ] `ai-receptionist-vs-front-desk-cost.html` line 163 — $52K-$76K fully loaded seat cost _(Batch 4)_
- [ ] `after-hours-dental-call-coverage.html` line 162 — "industry call-tracking surveys" stat-source line _(Batch 4)_
- [ ] `dso-buyers-guide-ai-receptionist.html` line 212 — front-desk net retention claim
- [ ] `practice-management-software-comparison-2026.html` line 154 — three PMS market-share percentages in one row (3 separate `TODO: cite` markers)

---

## 12. Other in-page placeholders

- [ ] **`responsible-disclosure.html`** line 99 — `<!-- TODO: hall of fame entries -->`. Intentional empty state until first researcher disclosure. Leave for now; populate when applicable.
- [ ] **`changelog.html`** line 96 — "Newsletter form coming soon." Either ship the form or remove the line.
- [ ] **`about.html`** line 140 — `<!-- TODO: founder photo at /images/team/varinder-kumar.jpg -->`. The asset itself is in §2; the comment marker stays as the location pin until the file is added.

---

## 13. Operational / known-blocking

From `_AGENT_CHANGES.md` "Punted / TODOs" section, plus other notes the project has accumulated:
- [ ] **WizKids case-studies metrics gate** — same as §4; tracked here because it's blocking the `case-studies.html` rendering of real numbers.
- [ ] **Hall-of-fame placeholder** — same as §12; intentional, not a bug.
- [ ] **Vercel CSP promotion** — currently report-only. Move to enforced after 1-2 weeks of clean violation reports.

---

## Tally

**Total items: ~85**, breaking down roughly as:

- **Can be filled directly by you (no external party needed): ~22**
  - 16 missing OG images, 4 OG/article variants, 1 founder photo, 1 brand logo source PNG (via image generation / commission)
- **Requires external setup or accounts: ~14**
  - 8 mailboxes, 6 GA4/Search Console/Capterra/G2/GBP/inline-GA4-cleanup tasks
- **Requires customer / vendor / legal input: ~13**
  - 4 WizKids items (metrics, domain, quote, customer #2-#3), 1 Denticon vendor confirm, 3 pricing-tier amounts, 3 PMS-roadmap confirmations, 3 legal reviews (privacy/terms/cookies)
- **Audio re-records: 7** (1 existing + 6 missing demo MP3s)
- **Press kit / founder copy on `/press`: 5** (`[Founder Name]` x 2 + 4 brand asset files)
- **Lead-magnet / form wiring: 6** (3 PDFs + email API + ROI tool wiring + newsletter form)
- **Citations: 5** blog posts (7 `<!-- TODO: cite -->` markers total — `practice-management-software-comparison-2026.html` has 3 in one row)
- **Spanish native review: 1 explicit marker + 4 pages soft pass**
- **Misc in-page placeholders: 3**
- **Favicons: 10 icon files** (tracked in separate `FAVICONS_TODO.md`)

Once these are done, the site has zero `TODO`, zero `[Founder Name]`, zero `[Practice Name]`, zero "Coming Soon," and zero broken `<img>`/`<audio>`/`mailto:` links.
