"""
Aria Dental AI — Batch 7 OG image generator.

Generates 1200x630 brand-consistent OG hero images for blog posts.
- Background: cream #FEFCF8
- Top-left: "ARIA DENTAL" wordmark in amber Sora 14pt
- Center: post title in Fraunces serif, charcoal #1A1A2E, ~48pt, max 3 lines
- Bottom-right: small amber dot + "AriaDental.AI" in Sora 12pt charcoal

Falls back to system fonts when Fraunces/Sora aren't installed:
- Serif: macOS Georgia → DejaVu Serif → Liberation Serif → PIL default
- Sans: macOS Helvetica → DejaVu Sans → Liberation Sans → PIL default
"""
import os
import re
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

# ---------- Brand ----------
CREAM = (254, 252, 248)        # #FEFCF8
AMBER = (212, 149, 42)         # #D4952A
CHARCOAL = (26, 26, 46)        # #1A1A2E
W, H = 1200, 630

# ---------- Font resolution ----------
SERIF_CANDIDATES = [
    "/Library/Fonts/Fraunces-SemiBold.ttf",
    "/Library/Fonts/Fraunces-Variable.ttf",
    "/System/Library/Fonts/Supplemental/Georgia.ttf",
    "/System/Library/Fonts/Georgia.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSerif-Bold.ttf",
]
SANS_CANDIDATES = [
    "/Library/Fonts/Sora-Regular.ttf",
    "/Library/Fonts/Sora-Variable.ttf",
    "/System/Library/Fonts/Helvetica.ttc",
    "/Library/Fonts/Helvetica.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
]
SANS_BOLD_CANDIDATES = [
    "/Library/Fonts/Sora-Bold.ttf",
    "/System/Library/Fonts/Helvetica.ttc",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
]


def first_existing(paths):
    for p in paths:
        if os.path.exists(p):
            return p
    return None


SERIF_PATH = first_existing(SERIF_CANDIDATES)
SANS_PATH = first_existing(SANS_CANDIDATES)
SANS_BOLD_PATH = first_existing(SANS_BOLD_CANDIDATES) or SANS_PATH


def font(path, size):
    if path and os.path.exists(path):
        try:
            return ImageFont.truetype(path, size)
        except Exception:
            pass
    return ImageFont.load_default()


# ---------- Text wrapping ----------
def wrap_lines(draw, text, font_obj, max_width, max_lines=3):
    words = text.split()
    if not words:
        return [""]
    lines = []
    current = []
    for word in words:
        trial = (" ".join(current + [word])).strip()
        bbox = draw.textbbox((0, 0), trial, font=font_obj)
        width = bbox[2] - bbox[0]
        if width <= max_width or not current:
            current.append(word)
        else:
            lines.append(" ".join(current))
            current = [word]
            if len(lines) == max_lines - 1:
                # last line — append remaining with ellipsis if too long
                rest = (" ".join([word] + words[words.index(word) + 1:])).strip()
                bb = draw.textbbox((0, 0), rest, font=font_obj)
                if bb[2] - bb[0] <= max_width:
                    lines.append(rest)
                    return lines
                else:
                    truncated = rest
                    while truncated:
                        bb = draw.textbbox((0, 0), truncated + "…", font=font_obj)
                        if bb[2] - bb[0] <= max_width:
                            lines.append(truncated + "…")
                            return lines
                        truncated = truncated.rsplit(" ", 1)[0] if " " in truncated else truncated[:-1]
                    return lines
    if current:
        lines.append(" ".join(current))
    return lines[:max_lines]


def fit_title(draw, title, max_width, max_lines=3, start_size=64, min_size=36):
    """Pick the largest serif size that fits in <= max_lines."""
    size = start_size
    while size >= min_size:
        f = font(SERIF_PATH, size)
        lines = wrap_lines(draw, title, f, max_width, max_lines=max_lines)
        if len(lines) <= max_lines:
            # check each fits
            ok = True
            for line in lines:
                bb = draw.textbbox((0, 0), line, font=f)
                if bb[2] - bb[0] > max_width:
                    ok = False
                    break
            if ok:
                return f, lines, size
        size -= 4
    f = font(SERIF_PATH, min_size)
    return f, wrap_lines(draw, title, f, max_width, max_lines=max_lines), min_size


def render_image(title, output_path):
    img = Image.new("RGB", (W, H), CREAM)
    draw = ImageDraw.Draw(img)

    # Top-left wordmark: "ARIA DENTAL" amber Sora 14pt
    wordmark_font = font(SANS_BOLD_PATH, 16)
    draw.text((80, 64), "ARIA DENTAL", fill=AMBER, font=wordmark_font)

    # Center: title in Fraunces serif, charcoal, max 3 lines
    PAD_X = 80
    max_text_width = W - 2 * PAD_X
    title_font, lines, _ = fit_title(draw, title, max_text_width, max_lines=3, start_size=64, min_size=36)

    # vertical center
    line_h = title_font.size + 12
    total_h = line_h * len(lines)
    y0 = (H - total_h) // 2 - 10

    for i, line in enumerate(lines):
        draw.text((PAD_X, y0 + i * line_h), line, fill=CHARCOAL, font=title_font)

    # Bottom-right: amber dot + "AriaDental.AI" in Sora 12pt charcoal
    footer_font = font(SANS_PATH, 14)
    footer_text = "AriaDental.AI"
    bb = draw.textbbox((0, 0), footer_text, font=footer_font)
    fw, fh = bb[2] - bb[0], bb[3] - bb[1]
    fx = W - PAD_X - fw
    fy = H - 64 - fh
    # amber dot
    dot_r = 4
    draw.ellipse((fx - 16, fy + fh // 2 - dot_r, fx - 16 + dot_r * 2, fy + fh // 2 + dot_r), fill=AMBER)
    draw.text((fx, fy), footer_text, fill=CHARCOAL, font=footer_font)

    img.save(output_path, "PNG", optimize=True)
    return output_path


# ---------- Title extraction ----------
def title_from_html(html_path):
    try:
        with open(html_path, "r", encoding="utf-8", errors="replace") as f:
            content = f.read()
    except Exception:
        return None
    m = re.search(r"<title>([^<]+)</title>", content, re.IGNORECASE)
    if not m:
        return None
    title = m.group(1).strip()
    # Take part before pipe character
    if "|" in title:
        title = title.split("|", 1)[0].strip()
    return title


# ---------- Slug list ----------
SLUGS = [
    "recovering-revenue-missed-dental-appointments",
    "ai-receptionist-vs-front-desk-cost",
    "hipaa-compliance-ai-dental-tools",
    "reduce-dental-no-shows",
    "dental-insurance-verification-faster",
    "front-desk-burnout-dental-practice",
    "after-hours-dental-call-coverage",
    "voice-ai-dental-buyers-guide",
    "aria-vs-arini-dentina-comparison",
    "pms-integration-dental-ai",
    "setup-ai-dental-receptionist-7-days",
    "dental-practice-marketing-roi-tracking",
    "glossary",
    "who-we-help",
]

OVERRIDE_TITLES = {
    "glossary": "Dental + AI Glossary",
    "who-we-help": "Who We Help",
}


def main():
    # Default repo is the directory this script lives in
    repo_dir = Path(__file__).parent.resolve()
    if len(sys.argv) > 1:
        repo_dir = Path(sys.argv[1]).resolve()
    out_dir = repo_dir / "images" / "blog"
    out_dir.mkdir(parents=True, exist_ok=True)

    print(f"Repo: {repo_dir}")
    print(f"Output: {out_dir}")
    print(f"Serif font: {SERIF_PATH}")
    print(f"Sans font: {SANS_PATH}")
    print()

    written = 0
    for slug in SLUGS:
        title = OVERRIDE_TITLES.get(slug)
        if not title:
            html_path = repo_dir / f"{slug}.html"
            extracted = title_from_html(html_path)
            title = extracted or slug.replace("-", " ").title()
        out_path = out_dir / f"{slug}.png"
        try:
            render_image(title, out_path)
            print(f"OK  {slug}.png  ({title[:60]})")
            written += 1
        except Exception as e:
            print(f"ERR {slug}.png  -> {e}")
    print()
    print(f"Wrote {written}/{len(SLUGS)} images to {out_dir}")


if __name__ == "__main__":
    main()
