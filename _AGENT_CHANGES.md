# Integrations page rewrite — vendor exposure removal

**Scope:** `integrations.html` only (plus its meta tags and JSON-LD).
**Goal:** "We integrate with everything" — without naming the vendors Aria itself is built on.

---

## What changed

### 1. Meta tags (description, og:description, twitter:description)
Stripped Twilio, Stripe, Google Calendar from descriptions. Replaced with the 8 PMS names — those are the customer's tools, not Aria's vendors.

**New copy:**
> Aria integrates with every major dental PMS — Open Dental, Dentrix, Eaglesoft, Dentrix Ascend, Denticon, Curve, Carestream, Practice-Web — plus custom builds for proprietary systems.

### 2. JSON-LD `ItemList`
Removed Twilio, Google Calendar, Stripe, Mailchimp. Now lists only the 8 PMSes (positions 1–8): Open Dental, Dentrix, Eaglesoft, Dentrix Ascend, Denticon, Curve, Carestream, Practice-Web.

### 3. PMS section — 8 cards, no status pills, simpler language
Expanded from 6 to 8 PMS cards (added Dentrix Ascend and Denticon as separate cards; previously Dentrix Ascend was buried as "tested across" copy on the Dentrix card).

**Removed all status pills** on PMS cards — no more "Live," "Coming Soon," or "Planned." Each card is now a flat statement that Aria integrates with that PMS. CSS class definitions for `.status-pill`, `.status-live`, `.status-coming`, `.status-planned`, `.status-launching` are kept in the stylesheet as legacy (no markup uses them on this page).

**Stripped technical phrases:**
- "Full write-back integration. Appointments, patients, providers, insurance, recall — all sync bi-directionally." → "Aria integrates with Open Dental for appointments, patients, providers, insurance, and recall. Cloud and on-prem deployments supported."
- "Appointment write-back, patient creation, provider sync. Tested across Dentrix Ascend and Enterprise." → "Aria handles appointments, patient records, and provider routing in Dentrix. Works with Dentrix G7 and Enterprise installations."
- "Appointment write-back and patient sync. Production-tested with Eaglesoft cloud and on-prem deployments." → "Aria works with Eaglesoft in cloud and on-prem deployments. Appointments, patients, and provider scheduling handled in-system."

No more "writeback," "write-back," "bi-directional," or "two-way sync" anywhere on the page.

### 4. Phone, Calendar, Payments, CRM/Marketing — collapsed to one generic card each
Replaced the multi-vendor card grids with a single capability statement per category. Removed every named vendor (Twilio, RingCentral, Weave Phone, Google Calendar, Outlook 365, iCloud Calendar, Stripe, Square, CareCredit, Mailchimp, Klaviyo, HubSpot CRM).

**Phone:**
> Aria works with your existing phone infrastructure — VoIP, SIP, or traditional carrier. No number porting required. We route calls to Aria first; transfers to your team happen seamlessly when patient needs require human handoff.

**Calendar:**
> Aria syncs with the calendar your practice already uses. Appointments booked through Aria appear instantly on your providers' schedules. Reschedules and cancellations sync both ways.

**Payments:**
> Aria collects payments and copays during the call or via secure SMS link. PCI-compliant card-on-file, post-visit payment links, and patient financing options. Works with your existing merchant processor.

**CRM & Marketing:**
> Patient records, lead capture, and marketing automation flow into your existing CRM and email platform. Two-way contact sync supported across the major dental marketing tools.

### 5. Prominent "Using a different PMS?" callout
Added a full-width charcoal section with cream/amber typography, positioned **immediately after the PMS card grid** and before the Phone/Calendar/Payments/Marketing block. Frames custom PMS work as a 48-hour scoping turnaround with 2–6 week build timeline. CTA → `/contact?type=custom-integration`.

### 6. Hero, chip filter, "Don't see your tool?" footer
- Chip filter renamed last entry from "Marketing / CRM" to "CRM & Marketing" to match new section heading.
- "Don't see your tool?" closing section retained — softened wording slightly to remove the "send us the vendor name" phrasing that hinted at vendor lists.

---

## Verification

```
$ grep -in "twilio\|ringcentral\|weave phone\|stripe\|square\|carecredit\|mailchimp\|klaviyo\|hubspot\|google calendar\|outlook 365\|icloud" integrations.html
(no matches)

$ grep -in "write-back\|writeback\|bi-directional\|bidirectional" integrations.html
(no matches)

$ grep -in "planned" integrations.html
67:.status-planned{background:rgba(26,26,46,0.04);color:var(--charcoal-50)}
```

Only one "planned" hit — a CSS class definition kept as legacy (no markup uses it). All status pills removed from card markup.

---

## Files staged

- `integrations.html` — rewritten page
- `_AGENT_CHANGES.md` — this file
