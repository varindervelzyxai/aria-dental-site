#!/usr/bin/env python3
"""Batch 6 - apply footer/nav/sitemap/css edits across the site, stage outputs.

Run from anywhere; uses absolute paths.
"""
import os, re, hashlib, shutil, glob, json
from pathlib import Path

REPO = Path("/sessions/zen-kind-cannon/mnt/Downloads/aria-dental-site-main 4")
STAGE = Path("/sessions/zen-kind-cannon/mnt/Downloads/aria-batch6-upload")
STAGE.mkdir(parents=True, exist_ok=True)

# ---- New shared blocks ------------------------------------------------

NAV_NEW = '<nav id="nav"><div class="nav-inner"><a href="/" class="nav-logo">aria</a><ul class="nav-links" id="navLinks"><li><a href="/platform">Platform</a></li><li><a href="/how-it-works">How It Works</a></li><li><a href="/demos">Demos</a></li><li><a href="/portfolio">Portfolio</a></li><li><a href="/compare">Compare</a></li><li><a href="/security">Security</a></li><li><a href="/about">About</a></li><li><a href="/contact" class="btn btn-primary">Book a Demo</a></li></ul><button class="nav-toggle" id="navToggle" aria-label="Menu"><span></span><span></span><span></span></button></div></nav>'

NAV_OLD = '<nav id="nav"><div class="nav-inner"><a href="/" class="nav-logo">aria</a><ul class="nav-links" id="navLinks"><li><a href="/platform">Platform</a></li><li><a href="/how-it-works">How It Works</a></li><li><a href="/demo">Demos</a></li><li><a href="/portfolio">Portfolio</a></li><li><a href="/compare">Compare</a></li><li><a href="/security">Security</a></li><li><a href="/contact" class="btn btn-primary">Book a Demo</a></li></ul><button class="nav-toggle" id="navToggle" aria-label="Menu"><span></span><span></span><span></span></button></div></nav>'

FOOTER_NEW = '''<footer><div class="container"><div class="footer-top">
<div class="footer-brand"><a href="/" class="footer-logo">aria</a><p>AI front office that closes more dental patients.</p><p style="font-size:12px;color:rgba(255,255,255,0.4);margin-top:8px">Aria by Velzyx AI</p><a href="mailto:info@velzyx.ai" style="color:var(--amber-light);text-decoration:none;font-size:14px;display:inline-block;margin-top:12px">info@velzyx.ai</a><div class="footer-address">5000 Birch St, Suite 3000<br>Newport Beach, CA 92660</div></div>
<div class="footer-col"><h5>Product</h5><a href="/platform">Platform</a><a href="/how-it-works">How It Works</a><a href="/compare">Compare</a><a href="/demos">Demos</a><a href="/platform#pricing">Pricing</a></div>
<div class="footer-col"><h5>Resources</h5><a href="/blog">Blog</a><a href="/glossary">Glossary</a><a href="/who-we-help">Who We Help</a><a href="/roi-calculator">ROI Calculator</a><a href="/voice-ai-dental-buyers-guide">Buyer&#39;s Guide</a></div>
<div class="footer-col"><h5>Company</h5><a href="/about">About</a><a href="/security">Security</a><a href="/contact">Contact</a><a href="mailto:info@velzyx.ai">Careers</a></div>
<div class="footer-col"><h5>Legal</h5><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/cookies">Cookie Policy</a><a href="/privacy#hipaa-notice">HIPAA Notice</a></div>
</div><div class="footer-bottom"><span>&copy; 2026 Aria by Velzyx AI. All rights reserved.</span><span class="footer-social"><a href="https://www.instagram.com/ariadentalai" target="_blank" rel="noopener" aria-label="Instagram">Instagram</a> &middot; <a href="https://twitter.com/ariadentalai" target="_blank" rel="noopener" aria-label="X (Twitter)">X</a> &middot; <a href="https://www.linkedin.com/company/aria-dental-ai" target="_blank" rel="noopener" aria-label="LinkedIn">LinkedIn</a></span></div></div></footer>'''

# ---- File processing --------------------------------------------------

# Pattern that matches *any* existing <footer>...</footer> block (single or multi-line)
FOOTER_RX = re.compile(r'<footer\b[^>]*>.*?</footer>', re.DOTALL)

modified = []
not_modified = []

html_files = sorted([p for p in REPO.glob('*.html')])
print(f"Found {len(html_files)} html files")

for f in html_files:
    name = f.name
    content = f.read_text(encoding='utf-8')
    orig = content

    # 1. Footer replacement (covers ALL pages including new ones with FOOTER_PLACEHOLDER)
    if '<!--FOOTER_PLACEHOLDER-->' in content:
        content = content.replace('<!--FOOTER_PLACEHOLDER-->', FOOTER_NEW)
    elif FOOTER_RX.search(content):
        content = FOOTER_RX.sub(FOOTER_NEW, content, count=1)
    # else: page has no footer; skip

    # 2. Nav replacement (only on pages with the OLD nav exactly; new pages already have NAV_NEW)
    if NAV_OLD in content:
        content = content.replace(NAV_OLD, NAV_NEW)

    # 3. Strip any bare aria-vs-arini-dentina-comparison pages that have a slightly different nav
    # (we'll handle those with a regex catch-all in case)
    # Look for any nav that still has /demo (singular, the old) instead of /demos
    nav_rx = re.compile(r'(<nav id="nav">.*?</nav>)', re.DOTALL)
    m = nav_rx.search(content)
    if m and '"/demo"' in m.group(1) and '"/demos"' not in m.group(1):
        # surgically swap href="/demo" -> href="/demos" inside the nav block, AND insert /about before contact
        old_block = m.group(1)
        new_block = old_block.replace('href="/demo"', 'href="/demos"')
        # Insert About link before the Book a Demo button if not present
        if '/about' not in new_block:
            new_block = new_block.replace(
                '<li><a href="/contact" class="btn btn-primary">Book a Demo</a></li>',
                '<li><a href="/about">About</a></li><li><a href="/contact" class="btn btn-primary">Book a Demo</a></li>'
            )
        content = content.replace(old_block, new_block)

    if content != orig:
        f.write_text(content, encoding='utf-8')
        modified.append(name)
    else:
        not_modified.append(name)

print(f"Modified: {len(modified)}")
print(f"Not modified: {len(not_modified)}")
for n in not_modified:
    print(f"  not modified: {n}")
