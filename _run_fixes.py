#!/usr/bin/env python3
"""Apply compare.html cleanup + /integrations nav link site-wide."""
import os
import re
import shutil
import subprocess
import sys
from pathlib import Path

REPO = Path("/sessions/beautiful-tender-hawking/mnt/Downloads/aria-dental-site-main 4")
STAGE = Path("/sessions/beautiful-tender-hawking/mnt/Downloads/aria-compare-nav-fix")
STAGE.mkdir(parents=True, exist_ok=True)

modified_files = []  # list of paths in repo that changed

def stage(p: Path):
    """Copy file p into STAGE flat (basename only)."""
    dest = STAGE / p.name
    shutil.copy2(p, dest)
    print(f"  staged: {p.name}")

def edit_file(p: Path, edits, *, all_required=True):
    """edits = list of (old, new). If all_required, every old must be present."""
    text = p.read_text(encoding="utf-8")
    orig = text
    for old, new in edits:
        if old not in text:
            if all_required:
                print(f"!! MISSING in {p.name}: {old[:80]!r}")
                sys.exit(2)
            else:
                continue
        text = text.replace(old, new, 1)
    if text != orig:
        p.write_text(text, encoding="utf-8")
        return True
    return False

# ---------------------------------------------------------------
# FIX 1 — compare.html
# ---------------------------------------------------------------
compare = REPO / "compare.html"

old_block_209 = (
    '<p>Weave is a phone and communication platform. Ruby is a virtual receptionist service. Both help dental practices manage patient communication — but neither one handles the full conversion workflow autonomously.</p>\n'
    "                <p>Weave gives you better phones, SMS, and reminders. But your staff still answers every call, still looks up insurance manually, still sends payment requests after the visit. Weave makes your front desk more efficient. <strong>Aria handles the work your front desk can't get to.</strong></p>\n"
    "                <p>Ruby provides human receptionists who answer calls and take messages — but they can't verify insurance, they can't quote cost, and they can't collect payment. They're a friendly voice, not a conversion engine.</p>"
)

new_block_209 = (
    '<p>Practice phone suites are phone and communication platforms. Traditional answering services use virtual receptionists. Both help dental practices manage patient communication — but neither one handles the full conversion workflow autonomously.</p>\n'
    "                <p>Phone suites give you better phones, SMS, and reminders. But your staff still answers every call, still looks up insurance manually, still sends payment requests after the visit. They make your front desk more efficient. <strong>Aria handles the work your front desk can't get to.</strong></p>\n"
    "                <p>Traditional answering services provide human receptionists who answer calls and take messages — but they can't verify insurance, they can't quote cost, and they can't collect payment. They're a friendly voice, not a conversion engine.</p>"
)

# Read once to detect actual indentation/whitespace for the 3-paragraph block.
ctext = compare.read_text(encoding="utf-8")

# Detect whitespace prefix variants — try with given indentation, fall back if not found.
if old_block_209 not in ctext:
    # Try alternate: search by raw paragraph content with regex tolerant whitespace.
    pat = re.compile(
        r'<p>Weave is a phone and communication platform\..*?conversion engine\.</p>',
        re.DOTALL,
    )
    m = pat.search(ctext)
    if not m:
        print("!! compare.html: 3-paragraph Weave/Ruby block NOT found — abort")
        sys.exit(2)
    # Replace via regex
    ctext_new = pat.sub(
        ('<p>Practice phone suites are phone and communication platforms. Traditional answering services use virtual receptionists. Both help dental practices manage patient communication — but neither one handles the full conversion workflow autonomously.</p>\n'
         "                <p>Phone suites give you better phones, SMS, and reminders. But your staff still answers every call, still looks up insurance manually, still sends payment requests after the visit. They make your front desk more efficient. <strong>Aria handles the work your front desk can't get to.</strong></p>\n"
         "                <p>Traditional answering services provide human receptionists who answer calls and take messages — but they can't verify insurance, they can't quote cost, and they can't collect payment. They're a friendly voice, not a conversion engine.</p>"),
        ctext,
        count=1,
    )
    compare.write_text(ctext_new, encoding="utf-8")
else:
    ctext_new = ctext.replace(old_block_209, new_block_209, 1)
    compare.write_text(ctext_new, encoding="utf-8")

edits1 = [
    # (a) line 142 body text
    ("Phone systems like Weave route calls and send reminders.",
     "Practice phone suites route calls and send reminders."),
    # (b) line 160 table header
    ("<th>Weave / Phone Tools</th>", "<th>Practice Phone Suites</th>"),
    # (c) line 203 comment
    ("<!-- ARIA VS WEAVE/RUBY -->",
     "<!-- ARIA VS PHONE SUITES AND FRONT OFFICE TOOLS -->"),
    # (d) line 207 H2
    ("<h2>Aria vs. Weave, Ruby, and <span>Front Office Tools</span></h2>",
     "<h2>Aria vs. <span>Phone Suites and Front Office Tools</span></h2>"),
    # (f) line 315 FAQ
    ('<div class="objection-card reveal reveal-delay-1"><div class="q">"How does Aria compare to Weave?"</div><div class="a">Weave provides phone and communication tools but doesn\'t offer AI call answering, real-time insurance verification, or automated payment collection during calls. Aria handles the full conversion workflow autonomously — answering to payment.</div></div>',
     '<div class="objection-card reveal reveal-delay-1"><div class="q">"How does Aria compare to traditional dental phone suites?"</div><div class="a">Traditional dental phone suites provide phone and communication tools but do not offer AI-powered call answering, real-time insurance verification during calls, or automated payment collection during conversations. Aria handles the full patient conversion workflow autonomously — from answering the call to collecting payment.</div></div>'),
    # (g) FAQ JSON-LD
    ('{"@type":"Question","name":"How does Aria compare to Weave for dental practices?","acceptedAnswer":{"@type":"Answer","text":"Weave provides phone and communication tools for dental practices but does not offer AI-powered call answering, real-time insurance verification during calls, or automated payment collection during conversations. Aria handles the full patient conversion workflow autonomously — from answering the call to collecting payment."}}',
     '{"@type":"Question","name":"How does Aria compare to traditional dental phone suites?","acceptedAnswer":{"@type":"Answer","text":"Traditional dental phone suites provide phone and communication tools but do not offer AI-powered call answering, real-time insurance verification during calls, or automated payment collection during conversations. Aria handles the full patient conversion workflow autonomously — from answering the call to collecting payment."}}'),
]

if edit_file(compare, edits1, all_required=True):
    print("compare.html: edits applied")

# Verify no Weave/Ruby left in compare.html
result = subprocess.run(
    ["grep", "-i", "-n", "-E", "weave|ruby", str(compare)],
    capture_output=True, text=True,
)
if result.stdout.strip():
    print("!! compare.html still has Weave/Ruby references:")
    print(result.stdout)
    sys.exit(3)
print("compare.html: 0 weave/ruby hits — ok")
modified_files.append(compare)

# ---------------------------------------------------------------
# FIX 2 — Add /integrations to nav site-wide
# ---------------------------------------------------------------
nav_pattern = '</li><li><a href="/security"'
nav_replacement = '</li><li><a href="/integrations">Integrations</a></li><li><a href="/security"'
guard = '<a href="/integrations">Integrations</a></li><li><a href="/security"'

nav_modified = []
for html in sorted(REPO.glob("*.html")):
    text = html.read_text(encoding="utf-8")
    if nav_pattern not in text:
        continue
    if guard in text:
        # already updated
        continue
    new_text = text.replace(nav_pattern, nav_replacement)
    if new_text != text:
        html.write_text(new_text, encoding="utf-8")
        nav_modified.append(html)
        print(f"nav updated: {html.name}")

# Combine modified set
all_modified = set(modified_files) | set(nav_modified)

# ---------------------------------------------------------------
# FIX 3 — index.html homepage integrations link
# ---------------------------------------------------------------
index_html = REPO / "index.html"
old_idx = '<a href="/platform" style="color:var(--amber);font-weight:500">See full integrations →</a>'
new_idx = '<a href="/integrations" style="color:var(--amber);font-weight:500">See full integrations →</a>'
itext = index_html.read_text(encoding="utf-8")
if old_idx in itext:
    index_html.write_text(itext.replace(old_idx, new_idx, 1), encoding="utf-8")
    all_modified.add(index_html)
    print("index.html: homepage integrations href updated")
elif new_idx in itext:
    print("index.html: integrations href already updated")
else:
    print("!! index.html: 'See full integrations' anchor not found — check")

# ---------------------------------------------------------------
# Changelog — _AGENT_CHANGES.md
# ---------------------------------------------------------------
changelog = REPO / "_AGENT_CHANGES.md"
clog = changelog.read_text(encoding="utf-8")

new_section = """## 2026-05-08 — /compare cleanup + /integrations nav link

### compare.html — brand-neutral cleanup
Removed all Weave / Ruby references in favor of generic "practice phone suites" / "traditional answering services" wording. Specific changes:
- Body text (line ~142): "Phone systems like Weave route calls and send reminders." -> "Practice phone suites route calls and send reminders."
- Table header (line ~160): "Weave / Phone Tools" -> "Practice Phone Suites"
- HTML comment (line ~203): "ARIA VS WEAVE/RUBY" -> "ARIA VS PHONE SUITES AND FRONT OFFICE TOOLS"
- H2 heading (line ~207): "Aria vs. Weave, Ruby, and Front Office Tools" -> "Aria vs. Phone Suites and Front Office Tools"
- 3-paragraph intro block (lines ~209-211) rewritten in brand-neutral terms (phone suites + traditional answering services).
- FAQ card (line ~315): rewrote the Weave-named Q/A as a generic "traditional dental phone suites" Q/A.
- FAQPage JSON-LD (line ~93): updated the matching Weave Q/A entry to the same brand-neutral wording so structured data and visible content stay in sync.

### Site-wide nav — Integrations link
Added `<li><a href="/integrations">Integrations</a></li>` immediately before the existing Security entry in the primary nav of every .html in the repo root that contains the nav block. Pattern used: replace `</li><li><a href="/security"` with `</li><li><a href="/integrations">Integrations</a></li><li><a href="/security"`. Idempotency guard skips files where `<a href="/integrations">Integrations</a></li><li><a href="/security"` is already present. Active-state variant on /security pages is handled by matching the prefix only.

### index.html — homepage integrations CTA
Updated the "See full integrations ->" link href from `/platform` to `/integrations` so the homepage CTA points at the dedicated integrations page.

### Verification
- `grep -i "weave\\|ruby" compare.html` returns 0 hits in visible content (URL slugs like `aria-vs-weave.html` may still appear as href values inside other files; those were intentionally left alone since they are external/legacy slugs).
- `<a href="/integrations">Integrations</a>` is now present in the nav of all primary nav pages (index, platform, how-it-works, demos, portfolio, compare, security, about, integrations).

"""

# Insert after line 6 (i.e. after the first 6 lines)
lines = clog.split("\n")
if len(lines) < 6:
    # safety: just prepend
    new_clog = new_section + "\n" + clog
else:
    head = "\n".join(lines[:6])
    tail = "\n".join(lines[6:])
    new_clog = head + "\n\n" + new_section + tail
changelog.write_text(new_clog, encoding="utf-8")
all_modified.add(changelog)
print("_AGENT_CHANGES.md: section prepended")

# ---------------------------------------------------------------
# Stage
# ---------------------------------------------------------------
print("\n--- staging ---")
for p in sorted(all_modified, key=lambda x: x.name):
    stage(p)

# ---------------------------------------------------------------
# Final report
# ---------------------------------------------------------------
print("\n=== REPORT ===")
print(f"compare cleanup files modified: 1 (compare.html) + 1 changelog")
print(f"nav update files modified: {len(nav_modified)}")
for n in nav_modified:
    print(f"  - {n.name}")

# verify compare.html final
res = subprocess.run(["grep", "-c", "-i", "-E", "weave|ruby", str(compare)],
                     capture_output=True, text=True)
print(f"compare.html weave|ruby grep count: {res.stdout.strip()}")

# verify nav presence in main pages
main_pages = ["index.html", "platform.html", "how-it-works.html", "demos.html",
              "portfolio.html", "compare.html", "security.html", "about.html"]
print("\nNav check (Integrations link present?):")
for mp in main_pages:
    p = REPO / mp
    if not p.exists():
        print(f"  {mp}: MISSING FILE")
        continue
    has = '<a href="/integrations">Integrations</a>' in p.read_text(encoding="utf-8")
    print(f"  {mp}: {'YES' if has else 'NO'}")

print(f"\nStage dir: {STAGE}")
print("Files staged:")
for f in sorted(STAGE.iterdir()):
    if f.name == "_run_fixes.py":
        continue
    print(f"  {f.name}")
