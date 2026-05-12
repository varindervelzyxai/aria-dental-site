# NUKE SUBPROCESSORS — Deploy Bundle

**Target:** Remove all public exposure of Aria's internal vendor/tech stack from ariadental.ai.

---

## ⚠️ CRITICAL — MANUAL GITHUB STEP REQUIRED

**No `subprocessors.html` file was found in `aria-FINAL/`.** A dedicated page at that path does not exist in this deploy bundle — the public vendor exposure was actually inside `privacy.html` (a full 11-row subprocessor table) and `security.html` (a named-vendor "Subprocessors" section).

**BUT** — if a `subprocessors.html` file exists in the live GitHub repo (i.e. it was deployed in a previous bundle), you must **manually delete it via the GitHub web UI**. Uploading this bundle will NOT auto-delete files that aren't in the upload.

### How to delete `subprocessors.html` from GitHub web UI (if present)

1. Open the repo: `varindervelzyxai/aria-dental-site`
2. Click into the file `subprocessors.html` (root of repo)
3. Click the **trash icon (🗑)** at the top right of the file view
4. Commit the deletion directly to `main` ("Delete subprocessors.html")
5. Vercel will redeploy automatically; `/subprocessors` will then return 301 → `/security` per the new redirect added below.

**If the file doesn't exist in GitHub, you're done — the 301 redirect in `vercel.json` covers any old inbound links.**

---

## Files in this bundle

| File | Change |
|------|--------|
| `privacy.html` | **STRIPPED** — removed full 11-row subprocessor table (AWS, GCP, OpenAI, Anthropic, Retell AI, Twilio, Stripe, Stedi, Sentry, Brevo, Cloudflare). Replaced with NDA-request pattern. Also removed "subprocessors" from meta description. |
| `security.html` | **STRIPPED** — removed entire named-vendor block (AWS, GCP, Retell AI, OpenAI/GPT-4o, Claude/Anthropic, Twilio, Stripe, Stedi, Sentry). Replaced with NDA-request pattern. Also genericized the "SOC 2 Type II" definition row (was "AWS, GCP, Stripe, Twilio"). Google Analytics 4 / Microsoft Clarity / Google Tag Manager mention retained (industry-standard analytics disclosure). |
| `faq.html` | **STRIPPED** — "Is Aria SOC 2 Type II certified?" answer in both JSON-LD and visible details element. Was: "Our subprocessors (AWS, GCP, Stripe, Twilio, OpenAI, Anthropic) hold their own SOC 2..." Now: generic "Our cloud hosting, messaging, payment, and model-inference subprocessors..." |
| `hipaa-compliance-ai-dental-tools.html` | **REWRITTEN** — section heading was "Subprocessors and the OpenAI question" (referenced OpenAI, Anthropic, AWS, Azure by name in body copy). Now "Subprocessors and the AI-model question" with generic copy. TOC link updated. |
| `index.html` | **STRIPPED** — integration chip strip in body had "Stedi Insurance" pill visible to all visitors. Replaced with "Insurance verification". |
| `vercel.json` | **ADDED** — 301 redirect: `/subprocessors → /security` (permanent: true). |
| `sitemap.xml` | unchanged (no /subprocessors entry was present). Included for completeness. |
| `dso-buyers-guide-ai-receptionist.html` | unchanged (mentions "subprocessor list" generically — no vendor names). Included for completeness. |

**5 HTML files modified + vercel.json redirect.**

---

## Vendor exposure caught (the "bonus")

Beyond the obvious `privacy.html` table and `security.html` section, these visible body-text vendor mentions were also stripped:

- `index.html` line 407: **"Stedi Insurance"** chip in the integrations strip on the homepage → genericized to "Insurance verification".
- `faq.html`: explicit vendor list (AWS, GCP, Stripe, Twilio, OpenAI, Anthropic) in the SOC 2 FAQ in both visible HTML and the JSON-LD `FAQPage` schema → genericized.
- `hipaa-compliance-ai-dental-tools.html`: long-form body copy naming OpenAI, Anthropic, AWS, Azure as model providers → rewritten to generic "third-party LLM providers."
- `security.html` SOC 2 row: "AWS, GCP, Stripe, Twilio" → "cloud hosting, messaging, and payment subprocessors."

**Retained (industry-standard, intentional):**
- `Google Analytics 4`, `Microsoft Clarity`, `Google Tag Manager` on `security.html` analytics paragraph — these are analytics tools whose disclosure is privacy-policy standard. They do NOT receive PHI and disclosing them is required for cookie/analytics transparency.

**Not modified (product-positioning pages — these reference integrations as features, not subprocessors):**
- `aria-for-open-dental.html`, `aria-for-dentrix.html`, `aria-for-eaglesoft.html`, etc. mention "Stedi 270/271" in PMS-integration feature descriptions. These are positioned as product capabilities, not infrastructure subprocessors. Recommend reviewing in a future pass if Varinder wants full vendor opacity; out of scope for this fast nuke.

---

## Redirect added

In `vercel.json` (line 8):

```json
{ "source": "/subprocessors", "destination": "/security", "permanent": true }
```

Old inbound links to `/subprocessors` (search engines, anyone who bookmarked the page from a previous deploy) get a 301 → `/security`. No 404s.

---

## Verification (run after Vercel deploy)

```
rg -i "subprocessor" aria-NUKE-SUBPROCESSORS/
```
**Expected:** Only the NDA-request pattern rewrites in `privacy.html`, `security.html`, `faq.html`, `hipaa-compliance-ai-dental-tools.html`, `dso-buyers-guide-ai-receptionist.html`, plus the `/subprocessors` source path in `vercel.json`. **NO** named vendors (AWS, GCP, OpenAI, Anthropic, Retell AI, Stedi, Sentry, etc.) in subprocessor context.

```
rg "/subprocessors" aria-NUKE-SUBPROCESSORS/
```
**Expected:** Only `vercel.json` redirect source.

```
ls aria-NUKE-SUBPROCESSORS/subprocessors.html
```
**Expected:** `No such file or directory` ✓ (file is NOT in the bundle).

---

## Deploy steps for Varinder

1. **Manually delete `subprocessors.html` from GitHub web UI** if it exists in the repo (see top of this doc). This is the most important step — Vercel won't drop the file just because the upload doesn't contain it.
2. Drag every file in `aria-NUKE-SUBPROCESSORS/` (except this `_AGENT_CHANGES.md`) into the GitHub repo root, overwriting existing files.
3. Commit message suggestion: `nuke vendor stack from public site — strip subprocessor exposure`
4. Vercel auto-deploys.
5. Hit `https://www.ariadental.ai/subprocessors` in an incognito window — should 301 to `/security`.
6. Hit `https://www.ariadental.ai/privacy#sharing` — vendor table should be gone, replaced with NDA pattern.
7. Hit `https://www.ariadental.ai/security` and scroll to Subprocessors — named vendor block should be gone.
