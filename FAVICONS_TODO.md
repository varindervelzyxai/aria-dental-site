# Favicons + PWA Icons — TODO

The HTML now references the full favicon + manifest set described in
`Aria_Batch1_Deploy_Package/favicons_manifest.md`, but the actual icon
files do **not** exist in the repo yet. Until you generate them, the
referenced URLs will 404 and Lighthouse will mark the manifest invalid.

## Files you need to drop at the repo root

| File                          | Format | Size                   | Purpose                              |
|-------------------------------|--------|------------------------|--------------------------------------|
| `favicon.ico`                 | ICO    | 16, 32, 48 (multi)     | Legacy browser tabs                  |
| `favicon-16x16.png`           | PNG    | 16×16                  | Modern browsers                      |
| `favicon-32x32.png`           | PNG    | 32×32                  | Modern browsers                      |
| `favicon-48x48.png`           | PNG    | 48×48                  | Windows pin                          |
| `apple-touch-icon.png`        | PNG    | 180×180                | iOS / iPadOS home screen             |
| `android-chrome-192x192.png`  | PNG    | 192×192                | Android home screen                  |
| `android-chrome-512x512.png`  | PNG    | 512×512                | Android splash                       |
| `maskable-icon-512x512.png`   | PNG    | 512×512 (80% safe area) | PWA installs                         |
| `safari-pinned-tab.svg`       | SVG    | 1-color flat           | Safari pinned tabs (use `#1A1A2E`)   |
| `mstile-150x150.png`          | PNG    | 150×150                | Windows tile                         |

> `site.webmanifest` and `browserconfig.xml` are already created at the repo root.

## Brand specs

```
amber    #D4952A   (mark color)
charcoal #1A1A2E   (background, theme-color dark)
cream    #FEFCF8   (background, theme-color light)
```

Design: Aria "A" mark in amber on charcoal, with cream as the safe-area
padding for the maskable icon.

## Easiest path — RealFaviconGenerator

1. Create or grab a 1024×1024 PNG of the Aria "A" mark (amber on charcoal).
2. Upload to https://realfavicongenerator.net.
3. Configure:
   - iOS: solid background, `#1A1A2E`.
   - Android Chrome: theme color `#1A1A2E`, manifest name "Aria Dental AI",
     short name "Aria", display "standalone".
   - Windows Metro: tile color `#1A1A2E`.
   - macOS Safari pinned tab: `#1A1A2E`.
4. Download the generated package and drop every PNG/ICO/SVG above into
   the repo root (next to `index.html`).
5. **Do not** import their generated `site.webmanifest` or HTML — we
   already wrote ours so the paths and brand match.

## Alternative — `pwa-asset-generator`

```bash
# from repo root, with a 1024px source PNG at design/aria-mark.png
npx pwa-asset-generator design/aria-mark.png . \
  --background "#1A1A2E" \
  --padding "12%" \
  --favicon \
  --opaque false \
  --icon-only \
  --type png \
  --quality 90
```

Then:

```bash
npx png-to-ico favicon-16x16.png favicon-32x32.png favicon-48x48.png > favicon.ico
```

Hand-author `safari-pinned-tab.svg` as a flat single-color SVG of the
"A" mark using fill `#1A1A2E`, and verify
`maskable-icon-512x512.png` in https://maskable.app/.

## Verification

After dropping the files in:

```bash
for path in favicon.ico favicon-16x16.png favicon-32x32.png favicon-48x48.png \
            apple-touch-icon.png android-chrome-192x192.png android-chrome-512x512.png \
            maskable-icon-512x512.png safari-pinned-tab.svg mstile-150x150.png; do
  test -f "$path" && echo "ok  $path" || echo "MISS $path"
done
```

Then deploy and run Lighthouse → Application → Manifest. No 404s, no
warnings, install button appears.
