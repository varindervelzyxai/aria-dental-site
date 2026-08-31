#!/usr/bin/env python3
"""SEO Pass 2: claim, OG, and schema corrections. No new articles."""
from __future__ import annotations

import os
import re
from pathlib import Path

ROOT = Path("/workspace")
SKIP_DIRS = {".git", "node_modules", ".netlify", "scripts"}

# Longer strings first.
REPLACEMENTS: list[tuple[str, str]] = [
    # --- Insurance exclusivity ---
    (
        "Yes — and no other AI receptionist can do this. Aria collects member ID and date of birth, verifies coverage across 3,400+ payers, reads back deductibles and remaining benefits, calculates exact out-of-pocket cost, and offers to collect — all while the patient is still on the line. Works for dependents too.",
        "Yes. Aria is built to collect member ID and date of birth during the call, run eligibility, read back deductibles and remaining benefits, estimate out-of-pocket cost, and offer to collect — including when a parent calls for a dependent. Other AI receptionists also advertise insurance verification; Aria’s differentiation is verification timing, benefit detail, dependent handling, and write-back where the PMS integration is live.",
    ),
    (
        "Yes — and no other AI receptionist can. Aria collects member ID and date of birth, verifies across 3,400+ payers, reads back deductibles and remaining benefits, and quotes exact out-of-pocket cost while the patient is still on the line. Works for dependents too.",
        "Yes. Aria is built to verify eligibility during the live call — member ID, dependents, remaining benefits, and an out-of-pocket estimate — then offer to collect. Other vendors advertise verification; we differentiate on timing, benefit detail, and write-back where Open Dental is live.",
    ),
    (
        "No other AI receptionist verifies insurance during the live call. Most require manual verification after — or don't offer it at all. Aria checks 3,400+ payers in real time and gives the patient their cost estimate before they hang up.",
        "Several AI receptionists advertise insurance verification. Aria is built to run eligibility during the live call, including dependents and remaining benefits, then quote an estimated patient cost and offer payment — and write results back where Open Dental is live.",
    ),
    (
        "Yes — and no other AI receptionist can do this.",
        "Yes. Aria is built to verify eligibility during the live call.",
    ),
    (
        "Yes — and no other AI receptionist can.",
        "Yes. Aria is built to verify eligibility during the live call.",
    ),
    (
        "and no other AI receptionist can do this. ",
        "",
    ),
    (
        "and no other AI receptionist can. ",
        "",
    ),
    (
        "no other AI receptionist can do this",
        "Aria is built to do this during the live call",
    ),
    (
        "no other AI receptionist can",
        "Aria is built to",
    ),
    (
        "No other AI receptionist can",
        "Aria is built to",
    ),
    # --- Only-Aria badges ---
    ('<span class="rare">Only Aria</span>', ""),
    ('<span class="only-tag">Only Aria</span>', ""),
    # --- Languages ---
    (
        "All of them. Aria responds in whatever language the patient speaks — Spanish, Mandarin, Vietnamese, and 100+ more. No \"press 2\" menus. No hiring bilingual staff. Every non-English caller becomes a booked patient instead of a lost opportunity.",
        "Conversational support across 100+ languages, with 17 production-tuned public voices currently available across English, Spanish, Chinese and Hindi. No “press 2” menus.",
    ),
    (
        "Aria responds instantly in whatever language the patient speaks — Spanish, Mandarin, Vietnamese, and 100+ more. No press-2-for-Spanish menus. No lost revenue from language barriers.",
        "Conversational support across 100+ languages, with 17 production-tuned public voices currently available across English, Spanish, Chinese and Hindi.",
    ),
    (
        "✓ 100+ languages, automatically",
        "✓ Conversational support across 100+ languages (17 production-tuned voices in EN/ES/ZH/HI)",
    ),
    (
        "✓ 100+ languages instantly",
        "✓ Conversational support across 100+ languages",
    ),
    (
        "✓ 100+ languages",
        "✓ Conversational support across 100+ languages",
    ),
    (
        "100+ languages, unlimited simultaneous",
        "Conversational support across 100+ languages",
    ),
    (
        "100+ languages, instantly",
        "Conversational support across 100+ languages",
    ),
    (
        "100+ languages, matched to caller",
        "Conversational support across 100+ languages, matched to the caller",
    ),
    (
        "in 100+ languages, around the clock",
        "with conversational support across 100+ languages, around the clock",
    ),
    (
        "in 100+ languages",
        "with conversational support across 100+ languages",
    ),
    (
        "24 hours a day, in 100+ languages",
        "24 hours a day, with conversational support across 100+ languages",
    ),
    (
        "Aria's voice and chat agents auto-detect 100+ languages. Spanish is fully supported with dental-specific terminology and culturally competent prompt tuning.",
        "Aria’s voice and chat agents offer conversational support across 100+ languages. Spanish is one of four languages with production-tuned public voices (English, Spanish, Chinese, Hindi).",
    ),
    (
        "Aria's voice agent supports 100+ languages with caller-language detection",
        "Aria’s voice agent offers conversational support across 100+ languages with caller-language detection, and 17 production-tuned public voices across English, Spanish, Chinese and Hindi",
    ),
    # --- Stale Open Dental launch dates ---
    (
        "OpenDental — Launching April 2026",
        "Open Dental — Live production write-back",
    ),
    (
        "Open Dental launches April 2026. Dentrix and Eaglesoft are next on the roadmap.",
        "Open Dental write-back is live. Dentrix and Eaglesoft remain on the roadmap.",
    ),
    (
        "Open Dental integration launches April 2026, with Dentrix and Eaglesoft support next on the roadmap.",
        "Open Dental write-back is live. Dentrix and Eaglesoft remain on the roadmap. Calendar and webhook sync are available today.",
    ),
    (
        "We don't write to your PMS yet. Open Dental launches April 2026; <a href=\"/aria-for-dentrix\" style=\"color:var(--amber);font-weight:500\">Dentrix</a> and Eaglesoft follow. Today, Aria writes to your calendar and your CRM via webhook, and your team mirrors confirmed appointments into your PMS — typically two clicks per day.",
        "Open Dental write-back is live. Native Dentrix and Eaglesoft write-back remain on the roadmap. On other systems, Aria writes to Google Calendar or a confirmation queue — that is calendar/webhook behavior, not native PMS write-back.",
    ),
    (
        "The first AI receptionist that writes directly to Open Dental — not a parallel calendar.",
        "Aria writes appointments back to Open Dental — not only to a parallel calendar.",
    ),
    (
        "Aria's Open Dental integration shipped to production with paying customers in April 2026.",
        "Aria’s Open Dental write-back is in production.",
    ),
    # --- Absolutes ---
    ("Zero missed calls — ever", "Aria answers every assigned inbound line, 24/7"),
    ("Zero missed calls", "Assigned lines answered 24/7"),
    ("conversion skyrockets", "more callers stay on the line long enough to book"),
    (
        "Live in 48 hours. No code to write, no PMS migration, no training your staff.",
        "Calendar-only deployments can go live in about two business days after discovery. Open Dental write-back typically takes 5–10 business days. No code to write and no PMS migration.",
    ),
    (
        "Practices on Aria today see 99.95%+ uptime; our infra runs on the same cloud your bank does.",
        "During an outage, calls failover to your existing voicemail or forward number so the line is not dead air. We do not publish an unverified uptime percentage.",
    ),
    (
        "99.95%+ uptime",
        "failover to your existing voicemail or forward number",
    ),
    # --- Review / recall yield claims ---
    (
        "After the visit, Aria sends a review request. 3-5x more reviews = more new patients finding you. Your best marketing channel on autopilot.",
        "After the visit, Aria can send a review request so more patients are actually asked. Volume depends on your baseline and how patients respond — not a guaranteed multiple.",
    ),
    (
        "Patients who haven't visited in 6+ months get automated re-engagement. Each reactivated patient = $500-$1,500 in treatment revenue.",
        "Patients who haven’t visited in 6+ months can get automated re-engagement. Any recovered visit value is illustrative — typically hygiene plus exam, not a guaranteed $500–$1,500 per patient.",
    ),
    # --- PMS overclaims ---
    (
        "Aria writes confirmed appointments directly into Open Dental, Dentrix, Eaglesoft, Curve, Carestream, and Practice-Web. Cancellations and reschedules mirror back automatically.",
        "Aria writes confirmed appointments into Open Dental when that integration is live. Dentrix, Eaglesoft, Curve, Carestream, and Practice-Web native write-back are not generally available — those practices book to Google Calendar or a confirmation queue unless a custom integration is scoped.",
    ),
    (
        "Aria is integrated through the certified path; <a href=\"/dental-insurance-verification-ai\">our verification work pulls live eligibility</a> and writes appointments back in real time on Dentrix.",
        "Native Dentrix write-back is on the roadmap. Eligibility can run independently of Dentrix; appointments today land in Google Calendar or a confirmation queue unless a custom Dentrix path is scoped.",
    ),
    (
        "Aria supports Eaglesoft with real-time read and write. Some competing vendors do; some only support it via overnight sync, which means a booking made by AI at 2 PM doesn't show up in your office until the next morning. That's a meaningful operational difference.",
        "Native Eaglesoft read/write is on the roadmap. Until it ships, Eaglesoft practices use Aria for voice, chat, and eligibility, and book to Google Calendar or a confirmation queue — not native Eaglesoft write-back.",
    ),
    (
        "Live: Open Dental, Dentrix, Eaglesoft. Coming soon: Curve Dental. Planned: Carestream/SoftDent, Practice-Web. See /integrations for the full directory.",
        "Live production write-back: Open Dental. Live calendar: Google Calendar. Roadmap: Dentrix, Eaglesoft, Curve, Carestream/SoftDent, Practice-Web, Dentrix Ascend, Denticon. See /integrations.",
    ),
    (
        "PMS depth varies — \"integration\" means full appointment write-back, patient creation, provider sync, and (for Open Dental and Dentrix) insurance details and treatment plan visibility. Ask for a demo of write-back into your specific PMS test environment before signing.",
        "PMS depth varies. Open Dental supports two-way write-back in production. Other systems should be treated as roadmap or custom until you see write-back in your own test environment.",
    ),
    (
        "We integrate with all three.",
        "Open Dental write-back is live. Dentrix and Eaglesoft are on the roadmap.",
    ),
    (
        "Open Dental, Dentrix, and Eaglesoft via secure middleware. We also support Curve, Denticon and Carestream on a per-account basis.",
        "Open Dental write-back is live. Dentrix and Eaglesoft are on the roadmap. Google Calendar and webhook sync are available today. Other PMS systems are scoped per account.",
    ),
    # --- Fake reviews / Type I ---
    (
        "For enterprise DSO buyers whose security review requires SOC 2 today, we share our Type I report and audit roadmap, plus our subprocessors' attestations. Most security teams accept this as evidence of mature controls during the in-progress period.",
        "For enterprise buyers whose security review requires SOC 2 today, we share control documentation, our audit roadmap, and subprocessors’ attestations. We are not SOC 2 Type I or Type II certified.",
    ),
    (
        "Not yet. Honest answer: we're working toward it with a target completion of Q3 2026. We will not claim certification we don't have.",
        "Not yet. SOC 2 Type II is in progress. We will not claim certification we don’t have.",
    ),
    # --- Case-study placeholders that invent metrics ---
    (
        "How a solo dentist on <a href=\"/aria-for-dentrix\" style=\"color:var(--amber);font-weight:500\">Dentrix</a> went from 32% missed-call rate to under 4%",
        "Solo Dentrix practice — story published only with customer approval",
    ),
    (
        "Coming Q3 2026. Single-location, two-provider general dentistry. Story in approval.",
        "No approved metrics yet. Placeholder only.",
    ),
    (
        "5-location dental group: how AI front office freed 2 FTEs to focus on treatment coordination",
        "Group practice — story published only with customer approval",
    ),
    (
        "Coming Q3 2026. 5 locations on Open Dental, ~3,200 calls/month combined. Story in approval.",
        "No approved metrics yet. Placeholder only.",
    ),
    (
        "14-location DSO standardizes insurance verification across all sites with Aria",
        "DSO — story published only with customer approval",
    ),
    (
        "Coming Q4 2026. Mixed PMS environment (Dentrix + Eaglesoft). Story in approval.",
        "No approved DSO case study is published. Placeholder only.",
    ),
    (
        "Pediatric dental practice: how AI receptionist handles parent-vs-child caller routing",
        "Pediatric specialty — additional stories published only with customer approval",
    ),
    (
        "Coming Q3 2026. Specialty practice with high after-school call volume.",
        "No additional approved pediatric metrics yet.",
    ),
    (
        "Orthodontic practice: how Aria handles ortho consult bookings and treatment-fee questions",
        "Orthodontic specialty — story published only with customer approval",
    ),
    (
        "Coming Q4 2026. Multi-provider ortho practice on Dentrix.",
        "No approved ortho metrics yet. Placeholder only.",
    ),
    (
        "Real numbers from real practices. We're publishing what we can — including the messy parts. More stories rolling out as customers approve.",
        "Named deployments are labeled. Metrics appear only with customer approval. Dashboards on this site are illustrative unless marked otherwise.",
    ),
    (
        "<em style=\"font-size:12px;opacity:.85\">Full case study with metrics published Q3 2026 with customer approval.</em>",
        "<em style=\"font-size:12px;opacity:.85\">REAL DEPLOYMENT. No approved public metrics. Case-study numbers will publish only with customer approval.</em>",
    ),
    (
        "Aria handles protected health information for thousands of dental patients every day. Here's exactly how we protect it — and what we expect of every vendor in our chain.",
        "Aria is built to handle protected health information for dental practices. Here is the current security posture — and what we expect of every vendor in our chain.",
    ),
    (
        "In progress. Target completion: Q3 2026. We are not currently SOC 2 Type II certified — we will not claim certification we don't have. Our enterprise cloud, payment, and communications subprocessors hold their own SOC 2 attestations, and we maintain SOC 2-aligned controls in advance of formal audit.",
        "In progress. We are not SOC 2 Type I or Type II certified. Enterprise cloud, payment, and communications subprocessors hold their own SOC 2 attestations, and we maintain SOC 2-aligned controls in advance of formal audit.",
    ),
    # Dentrix public price quote
    (
        "Aria pricing is independent of PMS. Most single-location practices land in the $499–$699/month range, all-in. See the pricing page or talk to us about volume.",
        "Aria pricing is independent of PMS and is scoped on a walkthrough against your volume. We do not publish a rate card here.",
    ),
    (
        "Most general dental practices that move from manual reminders to an AI front office see a 30-50% reduction in no-shows within 90 days.",
        "Practices that add confirmation at booking plus automated reminders often see fewer no-shows. We do not treat 30–50% as a verified Aria customer result.",
    ),
    (
        "cuts no-shows 30-40%",
        "can reduce no-shows when patients confirm and reschedule — not a guaranteed 30–40%",
    ),
    (
        "The first production deployment went live with a Southern California pediatric dental and orthodontic practice in early 2026.",
        "The first named production deployment is WizKids Dental &amp; Orthodontics, a Southern California pediatric and orthodontic practice (REAL DEPLOYMENT; no approved public metrics).",
    ),
]

AGG_RE = re.compile(
    r',\s*"aggregateRating"\s*:\s*\{\s*"@type"\s*:\s*"AggregateRating"\s*,\s*"ratingValue"\s*:\s*"4\.9"\s*,\s*"reviewCount"\s*:\s*"47"\s*\}'
)
PRICE_OFFER_RE = re.compile(
    r'"offers"\s*:\s*\{\s*"@type"\s*:\s*"Offer"\s*,\s*"priceCurrency"\s*:\s*"USD"\s*,\s*"price"\s*:\s*"499"\s*,\s*"priceSpecification"\s*:\s*\{[^}]*\}\s*,\s*"availability"\s*:\s*"https://schema.org/InStock"\s*\}'
)
OG_RE = re.compile(
    r"https://(?:www\.)?ariadental\.ai/images/og/([A-Za-z0-9_./-]+\.(?:png|jpg|webp))"
)
CASE_WIZ = "https://ariadental.ai/images/case-wizkids.png"
CASE_WIZ_NEW = "https://ariadental.ai/images/wizkids-dental-front-desk.png"
HERO = "https://ariadental.ai/images/aria-hero-1.png"
EXISTING_OG = {"enterprise.png"}


def iter_files() -> list[Path]:
    out = []
    for dirpath, dirnames, filenames in os.walk(ROOT):
        dirnames[:] = [d for d in dirnames if d not in SKIP_DIRS]
        for name in filenames:
            if name.endswith((".html", ".js", ".md")):
                out.append(Path(dirpath) / name)
    return out


def fix_og(text: str) -> str:
    def repl(m: re.Match) -> str:
        rel = m.group(1)
        if (ROOT / "images/og" / rel).exists():
            return m.group(0)
        return HERO

    text = OG_RE.sub(repl, text)
    text = text.replace(CASE_WIZ, CASE_WIZ_NEW)
    text = text.replace("/images/case-wizkids.png", "/images/wizkids-dental-front-desk.png")
    return text


def process(path: Path) -> bool:
    raw = path.read_text(encoding="utf-8", errors="surrogateescape")
    text = raw
    for old, new in REPLACEMENTS:
        if old in text:
            text = text.replace(old, new)
    text = AGG_RE.sub("", text)
    text = PRICE_OFFER_RE.sub(
        '"offers":{"@type":"Offer","priceCurrency":"USD","url":"https://ariadental.ai/contact","availability":"https://schema.org/InStock","description":"Custom pricing based on practice size and configuration. Book a demo for a scoping call."}',
        text,
    )
    text = fix_og(text)
    if text != raw:
        path.write_text(text, encoding="utf-8")
        return True
    return False


def main() -> None:
    changed = []
    for path in iter_files():
        if process(path):
            changed.append(str(path.relative_to(ROOT)))
    print(f"updated {len(changed)} files")
    for p in changed:
        print(" ", p)


if __name__ == "__main__":
    main()
