# Aria Final Fixes — Change Summary

Staging folder: `~/Downloads/aria-final-fixes/`
Base: `~/Downloads/aria-widen-all/`

## Fix #1 — Footer / fabricated emails collapsed to `info@velzyx.ai`

| File | Hits replaced | Notes |
|---|---|---|
| index.html | 4 | Line 108 JSON-LD `hello@ariadental.ai` (sales contactPoint) + `support@ariadental.ai` (customer support contactPoint); line 492 footer mailto + visible text; line 543 JS error message |
| demos.html | 1 | Line 528 footer mailto + visible text |
| integrations.html | 1 | Line 247 footer mailto + visible text |
| portfolio.html | 0 | Already clean (already used `info@velzyx.ai`) |
| how-it-works.html | 0 | Already clean |
| security.html | 0 | Already clean (already used `info@velzyx.ai` in body + footer) |

No other fabricated `@ariadental.ai`/`@ariadental.com` addresses (security@, privacy@, press@, partnerships@, dpo@, legal@, careers@) were found. URL references like `https://www.ariadental.ai` in JSON-LD/links were intentionally left in place per brief.

## Fix #2 — Vendor-name genericization (index.html only)

Body copy only. PMS names (Open Dental, Dentrix, Eaglesoft) preserved.

| Location | Before | After |
|---|---|---|
| Integrations chip strip (line 407) | `Google Calendar` | `Calendar sync` |
| Integrations chip strip (line 407) | `Stripe Payments` | `Payment processing` |
| Integrations chip strip (line 407) | `Twilio SMS` | `SMS messaging` |
| Integrations chip strip (line 407) | `Email (Brevo)` | `Transactional email` |
| FAQ "Does Aria integrate with our PMS?" (line 414) | `Google Calendar, Stripe, Twilio, and CRM systems` | `calendar sync, payment processing, SMS messaging, and CRM systems` |
| FAQ "Can Aria collect payment during the call?" (line 418) | `Stripe link via text` | `secure payment link via text` |

Remaining matches for the vendor regex live only inside `<script type="application/ld+json">` blocks (lines 104, 110) and are intentionally left alone per brief.

## Files in staging

- index.html
- demos.html
- integrations.html
- portfolio.html
- how-it-works.html
- security.html
- _AGENT_CHANGES.md (this file)
