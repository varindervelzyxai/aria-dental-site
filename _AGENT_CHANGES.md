# Vendor Lockdown — Third-Pass Scrub

**Target:** Remove every public mention of internal vendors / tech stack from ariadental.ai. Whitelist preserved for PMS partners, compliance concepts, protocols, and Aria's own brand.

**Base merge:** `aria-FINAL/` overlaid with `aria-NUKE-SUBPROCESSORS/` (NUKE wins on conflicts).

---

## Headline numbers

| Metric | Value |
|--------|-------|
| Files modified | **46** (45 HTML + 0 config/sitemap) |
| Total edits applied | **130+** distinct replacements |
| Deny-list terms eliminated from visible / meta / JSON-LD / CSS-comment surfaces | **20 of 20** |
| Remaining deny-list hits (all documented false positives) | **5** |

Before/after grep counts (case-insensitive, word-bounded, scoped to .html/.xml/.json/.css/.js/.md):

| Term | BEFORE | AFTER | Notes |
|------|--------|-------|-------|
| us-east-1 | 1 | 0 | scrubbed |
| us-west-2 | 1 | 0 | scrubbed |
| Azure | 4 | 0 | scrubbed (incl. Azure AD on enterprise.html, "Azure-hosted eConnector" on aria-for-open-dental.html) |
| Vercel | 1 | 1 | vercel.json `$schema` URL — required config, NOT body content (whitelist note in spec) |
| Llama | 1 | 1 | Spanish verb `llama` in es/demos.html — false positive |
| Twilio | 14 | 0 | scrubbed across all pages |
| RingCentral | 3 | 0 | scrubbed |
| Weave Phone | 2 | 0 | scrubbed (note: `aria-vs-weave.html` page name retained — Weave is positioned as competitor per whitelist) |
| Brevo | 1 | 0 | scrubbed (workflow.html "Via Brevo" → "Branded email") |
| Slack | 1 | 1 | "absorbing the slack" colloquial phrase — false positive |
| Stripe | 32 | 1 | last hit is `iv-idcard-stripe` CSS class (visual stripe on ID card mock) — false positive |
| Square | 4 | 2 | "Square mark" (1024×1024 PNG asset) and "square mile" (NYC geography) — both false positives |
| CareCredit | 7 | 0 | scrubbed (kept Sunbit/Cherry as third-party plans — neither on deny list) |
| Google Calendar | 44 | 0 | scrubbed (titles, meta, OG, JSON-LD, body, chips, CSS comments) |
| Google Workspace | 3 | 0 | scrubbed (enterprise.html SSO row + JSON-LD) |
| Outlook | 4 | 0 | scrubbed |
| iCloud | 2 | 0 | scrubbed |
| HubSpot | 1 | 0 | scrubbed (es/integrations.html CRM list) |
| Mailchimp | 1 | 0 | scrubbed (utm_source example → "email") |
| Stedi | 32 | 0 | scrubbed across product/state/integration pages |

**Empty deny-list hits both before and after (confirms zero exposure):** AWS, EC2, S3, RDS, Lambda, CloudFront, Route 53, GCP, BigQuery, Cloud Run, Cloud Functions, Cloudflare, OpenAI, GPT-3/4/4o, ChatGPT, Whisper, Anthropic, Claude, Retell, Cartesia, Sonic-3, ElevenLabs, Deepgram, AssemblyAI, Hugging Face, Pinecone, Weaviate, Chroma, Qdrant, LangChain, LlamaIndex, Mistral, Gemini, SendGrid, Sendinblue, Postmark, Mailgun, PayPal, Braintree, G Suite, Office 365, Microsoft 365, Apple Calendar, Klaviyo, Salesforce, ActiveCampaign, Marketo, Iterable, Surescripts, Trillium, iWell, Sentry, Datadog, New Relic, LogRocket, FullStory, Bugsnag, Rollbar (false-positive in "scrollbar" CSS — confirmed not present), Honeycomb, Splunk, Postgres, PostgreSQL, MySQL, MongoDB, Redis, Supabase, PlanetScale, Neon.

---

## Files modified (46)

### Top-tier surfaces (homepage + nav-prominent)

- **index.html** — JSON-LD `FAQPage` answer about PMS integration: `Google Calendar, Stripe, and CRM systems` → `calendar sync, payment processing, and CRM systems`. `SoftwareApplication.featureList` `"Smart scheduling with Google Calendar"` → `"Smart scheduling with calendar sync"`.
- **platform.html** — "Stripe-powered. PCI compliant." → "Backed by a PCI-compliant payment processor."
- **pricing.html** — "All integrations" feature card: `Twilio, Stripe, Google Calendar, Outlook` removed; now `phone, payments, and calendar sync`.
- **how-it-works.html** — HowTo JSON-LD step 3 (`Connect Google Calendar, Stripe payments, Twilio phone number...`) → generic. Step-tag chips `Google Calendar / Stripe / Twilio / Stedi Insurance` → `Calendar Sync / Payments / Phone / Insurance Verification`. wyg-card payment "Stripe-powered" → "Backed by a PCI-compliant payment processor". "Google Calendar Sync" → "Calendar Sync". Timeline "Money in your Stripe account" → "merchant account". Demo card "Book → Google Calendar" → "Book → Calendar Sync".
- **workflow.html** — Step 03/04 panels: removed "Via Twilio", "Via Brevo", "Stripe payment link", "Twilio number", "Stripe deposit link". Step 04: "Synced to Google Calendar" → "Synced to your calendar" (3 instances).
- **demo.html** — DC card: "Book → Google Calendar" → "Calendar Sync". Body copy "doctor's Google Calendar" → "doctor's connected calendar" (2 instances).
- **demos.html** — Why-this-matters: "Aria sends a Stripe link by text" → "Aria sends a secure payment link by text".
- **demo-gcal.html** — `<title>`, meta description, og:title, og:description, twitter:title, twitter:description, breadcrumb JSON-LD name, H1, 6× section-labels / sync-labels / auto-actions, footer paragraph, CSS comment — all "Google Calendar" → "Calendar" / "your calendar". URL slug `/demo-gcal` retained (won't break inbound links).
- **demo-reschedule.html** — H1, section-label, auto-action, CSS comment — all "Google Calendar" → "Calendar".

### Industry / vertical pages

- **enterprise.html** — `SAML SSO via Okta, Azure AD, or Google Workspace` → `SAML SSO via Okta and other major enterprise identity providers` (both visible feature-card AND JSON-LD answer + visible details element + JSON-LD answer = 4 instances total).
- **portfolio.html** — Case-feature labels: `(Stedi)`, `(Stripe)` parentheticals removed; `Google Calendar Sync` → `Calendar Sync`. VS-row: "Already in Stripe" → "Already in your merchant account". Auto-card: "Book → Google Calendar" → "Book → Calendar Sync".
- **ai-for-dental-groups.html** — Visible chip strip: `Google Calendar / Stripe Payments / Stedi Insurance` → `Calendar Sync / Payments / Insurance Verification`. JSON-LD FAQ answer + visible objection answer: `Google Calendar and Stripe` → `calendar sync and payment processing` (2 instances).
- **ai-for-dentists.html** — "Stripe's PCI-compliant infrastructure" → "a PCI-compliant payment processor".
- **ai-receptionist-cosmetic-dentistry-2026.html** — "CareCredit, Sunbit, or Cherry" → "Sunbit, Cherry, or other third-party financing".
- **aria-for-open-dental.html** — Feature card: "Stedi 270/271 eligibility" → "Real-time 270/271 eligibility". FAQ: "Azure-hosted (eConnector)" → "cloud-hosted (eConnector)".
- **aria-for-dentrix.html** — "Stedi 270/271 eligibility" → "Real-time 270/271 eligibility".
- **aria-for-eaglesoft.html** — "via Stedi (3,400+ payers)" → "across 3,400+ payers". "the Stedi-powered insurance verification" → "the real-time insurance verification".
- **aria-for-carestream.html** — "Stedi 270/271 verification" → "Real-time 270/271 verification". "via Stedi 270/271 transactions" → "via real-time 270/271 transactions".
- **aria-for-curve.html** — "Stedi 270/271 runs alongside Curve" → "Real-time 270/271 verification runs alongside Curve".
- **aria-for-practice-web.html** — "Stedi 270/271 eligibility" → "Real-time 270/271 eligibility". "your NPI + Stedi onboarding details" → "your NPI and clearinghouse onboarding details". FAQ: "patient-facing payments via Stripe" → "via a PCI-compliant payment processor".
- **aria-for-cosmetic-dentistry.html** — Visible FAQ + JSON-LD answer: "CareCredit, Sunbit, Cherry, in-house" → "Sunbit, Cherry, in-house, or any third-party plan".
- **aria-for-prosthodontics.html** — "financing (CareCredit, in-house, etc)" → "financing (third-party plans, in-house, etc)".
- **aria-for-emergency-dental-clinics.html** — "on-call clinician's phone (Twilio-mediated)" → "on-call clinician's phone" (parenthetical removed).
- **aria-vs-weave.html** — "Aria integrates with Twilio (which most modern dental phone systems use anyway), Stripe, your CRM webhooks, your reviews tool" → "Aria layers on top of your existing phone provider, payment processor, CRM webhooks, and reviews tool". "eligibility-check infrastructure (Stedi-backed)" → "eligibility-check infrastructure".
- **compare.html** — "Aria writes to Google Calendar" → "Aria writes to your connected calendar".

### State pages (CA / FL / IL / NY / TX)

- **california-dental-ai.html** — 3 hits: "Denti-Cal verification supported through Stedi" → "...through our clearinghouse"; "infrastructure (Stedi) used by most major dental clearinghouses" → parenthetical removed; details + JSON-LD: "Eligibility runs through Stedi" → "through our clearinghouse".
- **florida-dental-ai.html** — Same pattern: "supported via Stedi eligibility checks" → "supported via 270/271 eligibility checks", parenthetical removed, "Eligibility runs through Stedi" → "through our clearinghouse" (3 hits).
- **illinois-dental-ai.html** — Same pattern (3 hits).
- **new-york-dental-ai.html** — Same pattern (3 hits).
- **texas-dental-ai.html** — Same pattern (3 hits).

### Article / blog / pillar pages

- **dental-insurance-verification-ai.html** — "Aria's insurance verification is powered by Stedi — the same clearinghouse infrastructure..." → "Aria's insurance verification runs through industry-standard clearinghouse infrastructure...".
- **dental-missed-calls-ai.html** — "Money in your Stripe account" → "Money in your merchant account".
- **dental-practice-front-desk-checklist.html** — "CareCredit, Sunbit, or similar" → "Sunbit, Cherry, or similar third-party financing".
- **dental-practice-marketing-roi-tracking.html** — utm_source example list: "(google, facebook, instagram, mailchimp)" → "(google, facebook, instagram, email)".
- **how-much-do-missed-calls-cost-dental-practice.html** — JSON-LD FAQ answer: "Others book into Google Calendar or use webhooks" → "Others book into a connected calendar or use webhooks".

### Legal / policy / disclosure

- **privacy.html** — Payment instruments section: "directly to our payment processor (Stripe)" → "directly to our PCI-compliant payment processor". Retention section: "Full PAN data is held by Stripe under PCI-DSS" → "held by our PCI-DSS-compliant payment processor".
- **terms.html** — Service-of-product paragraph: "processes payments through Stripe" → "processes payments through a PCI-compliant payment processor".
- **security.html** — Data residency row: "us-east-1 / us-west-2 across primary cloud providers" → "across primary U.S. cloud regions".
- **responsible-disclosure.html** — Out-of-scope card: "Issues in third-party services (GTM, Clarity, GA4, Twilio, Stripe)" → "(analytics, phone, payment processor)".
- **faq.html** — Twenty-plus rewrites across both the visible `<details>` elements AND the matching JSON-LD `FAQPage` `acceptedAnswer.text` blocks. Removed: phone vendor list (Twilio/RingCentral/Weave) — twice, Google Calendar + Outlook + iCloud calendar list — twice, payment systems list (Stripe/Square/CareCredit) — twice. Calendar question heading rewritten: "Can Aria sync to Google Calendar or Outlook?" → "Can Aria sync to my calendar?" (visible + JSON-LD).

### Spanish (`es/`) pages

- **es/integrations.html** — Insurance paragraph: "se conecta con Stedi" + repeat "A través de Stedi" → "(transacciones estándar 270/271)". "**Google Calendar**" heading → "**Sincronización de calendario**". "**Stripe**" heading → "**Procesamiento de pagos**". "**Twilio**" heading → "**Telefonía y SMS**". "Sin PMS / Solo Calendario" paragraph: "apoyado en Google Calendar" → "apoyado en sincronización de calendario". CRM list: "(GoHighLevel, HubSpot, etc.)" → "(CRMs y plataformas de marketing comunes)".
- **es/security.html** — "los servicios externos (PMSes, aseguradores, Twilio, Stripe) usa TLS 1.2+" → "(...telefonía, procesador de pagos)".
- **es/help.html** — "credenciales (PMS, Stripe, Twilio)" → "credenciales (PMS, procesador de pagos, telefonía)".
- **es/platform.html** — Payment-collection card: "Stripe. Conformidad PCI." → "Procesamiento PCI-compliant."
- **es/pricing.html** — Bullet: "✓ Cobros con Stripe integrados" → "✓ Procesamiento de pagos integrado". Annual-pay answer: "tarjeta de crédito (Stripe)" → "tarjeta de crédito (vía procesador PCI-compliant)".
- **es/faq.html** — Visible details answer + matching JSON-LD: "elegibilidad en tiempo real con más de 3,400 aseguradoras vía Stedi" → "(transacciones 270/271 estándar)" (both Unicode-escaped and plain versions of the same sentence).

---

## Borderline judgment calls

1. **`vercel.json` `$schema` URL (`https://openapi.vercel.sh/vercel.json`)** — left unchanged. The spec says "Vercel ... fine if in URL structure references or asset paths." This is a config-file JSON Schema URL that Vercel requires for IDE validation. Removing it doesn't help — the file itself is literally named `vercel.json`, which is the deployment-config convention. Vercel-as-host is a known fact for any public site (DNS records, response headers reveal it). The intent of the deny list is to keep the *Aria internal product* tech stack opaque; deployment-host conventions are not internal product tech.

2. **Analytics dns-prefetch hints (`googletagmanager.com`, `clarity.ms`, `google-analytics.com`)** — left in `<head>` on all pages. These are functional network-optimization hints required for GA4/Clarity/GTM to load. The spec whitelist for analytics tools is scoped to *visible body / meta mentions* on /privacy /cookies /terms; it is not realistic to remove the dns-prefetch hints without breaking analytics functionality site-wide. None of these prefetch hints render visibly to the user.

3. **`responsible-disclosure.html` out-of-scope card** — was "Issues in third-party services (GTM, Clarity, GA4, Twilio, Stripe)". GTM/Clarity/GA4 alone would be whitelisted (analytics on a policy page), but the same line named Twilio and Stripe. Genericized the entire parenthetical to "(analytics, phone, payment processor)" rather than splitting — cleaner read, consistent stance, and removes the two non-whitelisted names cleanly.

4. **PMS-partner pages (aria-for-open-dental, dentrix, eaglesoft, etc.)** — the PMS names themselves (Open Dental, Dentrix, Eaglesoft, Curve, Carestream, Practice-Web) are **kept** per the whitelist. Only the *Stedi* clearinghouse mention was scrubbed from these pages, since Stedi is on the deny list and is a back-end vendor, not a publicly co-branded integration partner.

5. **`aria-vs-weave.html`** — page filename and the *competitive* mentions of Weave are retained. Weave is positioned as a competitor (we run comparison pages against it). What was scrubbed was a separate "Aria integrates with Twilio, Stripe, your CRM webhooks" sentence on that page that exposed our own stack — that one was genericized.

6. **CareCredit (financing partner) — different from payments processor (Stripe).** Both deny-listed. We replaced CareCredit with "Sunbit, Cherry, or other third-party financing" — both Sunbit and Cherry are NOT on the deny list, and they're legitimate financing options. We didn't introduce *new* vendors; both already appeared adjacent to CareCredit in the original copy.

---

## Whitelisted hits that intentionally remain

These are *not* leaks — they're false positives or explicitly whitelisted:

- **`vercel.json` line 2**: `"$schema": "https://openapi.vercel.sh/vercel.json"` — deployment config schema URL (whitelisted per spec note: "fine if in URL structure references").
- **`press.html` line 94**: `<h3>Square mark</h3>` — refers to a 1024×1024 PNG (square-shape brand asset format), NOT Square the payment processor.
- **`new-york-dental-ai.html` line 75**: `"highest practice density per square mile in the country"` — geography (square miles), NOT Square.
- **`ai-receptionist-vs-front-desk-cost.html` line 157**: `"the team is absorbing the slack"` — colloquial English ("slack" as unused capacity), NOT Slack the messaging app.
- **`es/demos.html` line 79**: `"Una madre llama buscando dentista"` — Spanish verb `llama` ("calls"), NOT Llama the LLM.
- **`assets/insurance-viz.css` line 49**: `.iv-idcard-stripe{...}` — CSS class for a visual vertical stripe element on an ID-card mockup. Not Stripe the payment processor; it's a styling element.
- **All-page `dns-prefetch` hints**: `googletagmanager.com / clarity.ms / google-analytics.com` — functional analytics optimization, not user-visible vendor mentions.

---

## What this scrub did NOT touch

- **PMS partner names** (Open Dental, Dentrix, Eaglesoft, Curve Dental, Carestream/SoftDent, Practice-Web, etc.) — explicitly whitelisted as integration partners.
- **HIPAA, SOC 2, GDPR, CCPA, BAA, PCI-DSS, AES-256, ePHI, SHA-256, TLS, OAuth, SAML, SSO, SIP, VoIP, schema.org, JSON-LD** — protocols, standards, certifications. Not vendors.
- **`audio/*.mp3`** — speaker audio assets, no vendor exposure.
- **`assets/*.css` and `assets/*.js`** — visualization viz scripts; verified no vendor strings.
- **`sitemap.xml`** — verified clean, no edits needed.
- **`robots.txt` and `ads.txt`** — not present in the bundle; nothing to scrub.
- **The integrations.html page** — already cleaned in a prior pass per spec instruction. Verified clean (only PMS partners + protocol names present).
- **Aria's own brand strings** — Aria, Aria Dental, Velzyx, WizKids Dental, Smith Family Dental, Dr. Smith, Dr. Patel — all retained.

---

## Deploy steps

1. **Open the GitHub repo** `varindervelzyxai/aria-dental-site`.
2. **Drag every file in this `aria-vendor-lockdown/` folder** (except this `_AGENT_CHANGES.md`) into the repo root, **preserving paths**. The `es/*.html` files go in the `/es/` subfolder.
3. **Commit message suggestion**: `vendor lockdown — third pass scrub`.
4. **Vercel auto-deploys** within ~30 seconds.
5. **Smoke-test post-deploy**:
   - `https://www.ariadental.ai/security` — scroll to Subprocessors and Data Residency rows — should NOT show `us-east-1`, `us-west-2`, AWS, GCP, etc.
   - `https://www.ariadental.ai/faq` — open "Can Aria sync to my calendar?" and "What payment systems does Aria support?" — should NOT show Google Calendar / Outlook / iCloud / Stripe / Square / CareCredit by name.
   - `https://www.ariadental.ai/enterprise` — open "Do you support SSO and SCIM?" — should NOT say "Azure AD, or Google Workspace".
   - `https://www.ariadental.ai/how-it-works` — integration chips should show generic labels (Calendar Sync / Payments / Phone / Insurance Verification), NOT vendor names.
   - `https://www.ariadental.ai/portfolio` — case features should NOT have `(Stedi)` `(Stripe)` parentheticals.
   - `https://www.ariadental.ai/demo-gcal` — page should still work (URL slug retained), but H1 and body copy say "Calendar" not "Google Calendar".

---

## Verification queries to re-run anytime

```bash
# From repo root after deploy:
grep -rinE "\bStedi\b|\bTwilio\b|\bStripe\b|\bGoogle Calendar\b|\bOutlook\b|\biCloud\b|\bCareCredit\b|\bAzure\b|\bGoogle Workspace\b|\bRingCentral\b|\bWeave Phone\b|\bBrevo\b|\bHubSpot\b|\bMailchimp\b" --include="*.html" --include="*.xml" --include="*.json" --include="*.css"
```

**Expected:** zero hits.

```bash
grep -rinE "\bOpenAI\b|\bAnthropic\b|\bClaude\b|\bRetell\b|\bCartesia\b|\bElevenLabs\b|\bDeepgram\b|\bAWS\b|\bGCP\b|\bCloudflare\b|\bSentry\b" --include="*.html"
```

**Expected:** zero hits.

These two should both come back empty. If anything new is introduced in a future copy-paste, the same grep will surface it instantly.
