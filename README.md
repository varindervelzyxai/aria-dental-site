# Aria Dental site

Static site. Netlify functions stay at the repo root (`netlify/functions`) and load `lib/` from there. They are not part of the published site.

## Deploy

Production is deployed with the Netlify CLI from a machine that is not linked to Git. Stage the public files first, then deploy that folder:

```bash
node scripts/stage-public-site.mjs && netlify deploy --prod
```

`netlify deploy --prod` uploads `[build].publish` (`publish/`). It does not run the build command unless you pass `--build`. The command above runs the staging script itself, so the upload matches the public site.

`netlify deploy --prod --build` is equivalent: Netlify runs `node scripts/stage-public-site.mjs`, then uploads `publish/`.

Do not deploy the repo root. `netlify deploy --prod --dir=.` would publish internal notes, `lib/`, `netlify/`, `email-sequences/`, and scripts.

`node scripts/stage-public-site.mjs` copies the public site into `./publish` and leaves out `*.md`, `*.bak`, `*.py`, `*.pyc`, `lib/`, `netlify/`, `email-sequences/`, `scripts/`, and planning files. `publish/` is gitignored. Rebuild it before every production deploy.
