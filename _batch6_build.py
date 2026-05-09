#!/usr/bin/env python3
"""Batch 6 builder - creates legal/about/404/demos pages, replaces footers,
adds /demos to nav, updates sitemap, replaces customer-logo placeholders.

Run from repo root.
"""
import os, re, sys, hashlib, shutil, glob, json
from pathlib import Path

REPO = Path("/sessions/zen-kind-cannon/mnt/Downloads/aria-dental-site-main 4")
STAGE = Path("/sessions/zen-kind-cannon/mnt/Downloads/aria-batch6-upload")
STAGE.mkdir(parents=True, exist_ok=True)

# ----- shared head builder -----
def build_head(slug, title, description, og_image="/images/og/home.png"):
    canonical = f"https://www.ariadental.ai/{slug}" if slug else "https://www.ariadental.ai/"
    return f"""<!DOCTYPE html><html lang="en"><head>
<!-- Google Tag Manager -->
<script>
(function(w,d,s,l,i){{w[l]=w[l]||[];w[l].push({{'gtm.start':
new Date().getTime(),event:'gtm.js'}});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
}})(window,document,'script','dataLayer','GTM-5H6LQ8RL');
</script>
<!-- End Google Tag Manager --><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{title}</title>
<meta name="description" content="{description}">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,400;1,9..144,500&family=Sora:wght@300;400;500;600;700&display=swap" rel="stylesheet">
<link rel="canonical" href="{canonical}">
<meta property="og:site_name" content="Aria Dental AI">
<meta property="og:locale" content="en_US">
<meta property="og:type" content="website">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{description}">
<meta property="og:url" content="{canonical}">
<meta property="og:image" content="https://www.ariadental.ai{og_image}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Aria Dental AI">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:site" content="@ariadentalai">
<meta name="twitter:creator" content="@ariadentalai">
<meta name="twitter:title" content="{title}">
<meta name="twitter:description" content="{description}">
<meta name="twitter:image" content="https://www.ariadental.ai{og_image}">
<link rel="icon" type="image/x-icon" href="/favicon.ico">
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="#D4952A">
<meta name="msapplication-TileColor" content="#1A1A2E">
<meta name="apple-mobile-web-app-title" content="Aria">
<meta name="application-name" content="Aria Dental AI">
<link rel="stylesheet" href="styles.css">
<script type="application/ld+json">{{"@context":"https://schema.org","@type":"Organization","@id":"https://www.ariadental.ai/#organization","name":"Aria Dental AI","alternateName":"Aria","legalName":"Aria by Velzyx AI","url":"https://www.ariadental.ai/","logo":{{"@type":"ImageObject","url":"https://www.ariadental.ai/images/aria-logo.png","width":512,"height":512}},"description":"AI receptionist for dental practices: answers calls, verifies insurance, books patients 24/7.","foundingDate":"2025-09-01","parentOrganization":{{"@type":"Organization","name":"Aria by Velzyx AI","url":"https://velzyx.ai/"}},"sameAs":["https://www.linkedin.com/company/aria-dental-ai","https://twitter.com/ariadentalai","https://www.instagram.com/ariadentalai"],"contactPoint":[{{"@type":"ContactPoint","contactType":"sales","email":"info@velzyx.ai","availableLanguage":["English","Spanish"]}},{{"@type":"ContactPoint","contactType":"customer support","email":"info@velzyx.ai","availableLanguage":["English","Spanish"]}}]}}</script>
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-KQS3692C4Q"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){{dataLayer.push(arguments);}}gtag('js',new Date());gtag('config','G-KQS3692C4Q');</script>
<!-- Microsoft Clarity -->
<script type="text/javascript">
    (function(c,l,a,r,i,t,y){{
        c[a]=c[a]||function(){{(c[a].q=c[a].q||[]).push(arguments)}};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    }})(window, document, "clarity", "script", "wn8w0677vz");
</script>
<!-- End Microsoft Clarity -->
<script src="/analytics-events.js" defer></script>
<link rel="dns-prefetch" href="//www.googletagmanager.com"><link rel="dns-prefetch" href="//www.clarity.ms"><link rel="dns-prefetch" href="//www.google-analytics.com"><link rel="dns-prefetch" href="//fonts.googleapis.com"><link rel="dns-prefetch" href="//fonts.gstatic.com"></head><body>
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-5H6LQ8RL"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->
<a class="skip-link" href="#main">Skip to main content</a>
"""

NAV_NEW = '<nav id="nav"><div class="nav-inner"><a href="/" class="nav-logo">aria</a><ul class="nav-links" id="navLinks"><li><a href="/platform">Platform</a></li><li><a href="/how-it-works">How It Works</a></li><li><a href="/demos">Demos</a></li><li><a href="/portfolio">Portfolio</a></li><li><a href="/compare">Compare</a></li><li><a href="/security">Security</a></li><li><a href="/about">About</a></li><li><a href="/contact" class="btn btn-primary">Book a Demo</a></li></ul><button class="nav-toggle" id="navToggle" aria-label="Menu"><span></span><span></span><span></span></button></div></nav>'

# old nav patterns to replace
NAV_OLD = '<nav id="nav"><div class="nav-inner"><a href="/" class="nav-logo">aria</a><ul class="nav-links" id="navLinks"><li><a href="/platform">Platform</a></li><li><a href="/how-it-works">How It Works</a></li><li><a href="/demo">Demos</a></li><li><a href="/portfolio">Portfolio</a></li><li><a href="/compare">Compare</a></li><li><a href="/security">Security</a></li><li><a href="/contact" class="btn btn-primary">Book a Demo</a></li></ul><button class="nav-toggle" id="navToggle" aria-label="Menu"><span></span><span></span><span></span></button></div></nav>'

# ----- shared footer -----
FOOTER_NEW = '''<footer><div class="container"><div class="footer-top">
<div class="footer-brand"><a href="/" class="footer-logo">aria</a><p>AI front office that closes more dental patients.</p><p style="font-size:12px;color:rgba(255,255,255,0.4);margin-top:8px">Aria by Velzyx AI</p><a href="mailto:info@velzyx.ai" style="color:var(--amber-light);text-decoration:none;font-size:14px;display:inline-block;margin-top:12px">info@velzyx.ai</a><div class="footer-address">5000 Birch St, Suite 3000<br>Newport Beach, CA 92660</div></div>
<div class="footer-col"><h5>Product</h5><a href="/platform">Platform</a><a href="/how-it-works">How It Works</a><a href="/compare">Compare</a><a href="/demos">Demos</a><a href="/platform#pricing">Pricing</a></div>
<div class="footer-col"><h5>Resources</h5><a href="/blog">Blog</a><a href="/glossary">Glossary</a><a href="/who-we-help">Who We Help</a><a href="/roi-calculator">ROI Calculator</a><a href="/voice-ai-dental-buyers-guide">Buyer&#39;s Guide</a></div>
<div class="footer-col"><h5>Company</h5><a href="/about">About</a><a href="/security">Security</a><a href="/contact">Contact</a><a href="mailto:info@velzyx.ai">Careers</a></div>
<div class="footer-col"><h5>Legal</h5><a href="/privacy">Privacy</a><a href="/terms">Terms</a><a href="/cookies">Cookie Policy</a><a href="/privacy#hipaa-notice">HIPAA Notice</a></div>
</div><div class="footer-bottom"><span>&copy; 2026 Aria by Velzyx AI. All rights reserved.</span><span class="footer-social"><a href="https://www.instagram.com/ariadentalai" target="_blank" rel="noopener" aria-label="Instagram">Instagram</a> &middot; <a href="https://twitter.com/ariadentalai" target="_blank" rel="noopener" aria-label="X (Twitter)">X</a> &middot; <a href="https://www.linkedin.com/company/aria-dental-ai" target="_blank" rel="noopener" aria-label="LinkedIn">LinkedIn</a></span></div></div></footer>'''

print("Build script loaded. Use individual functions below.")
