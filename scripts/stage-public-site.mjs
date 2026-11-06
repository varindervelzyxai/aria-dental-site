import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dest = path.join(root, "publish");

const skipDirs = new Set([
  ".git",
  ".github",
  ".netlify",
  ".cursor",
  "node_modules",
  "publish",
  "lib",
  "netlify",
  "email-sequences",
  "scripts",
  "__pycache__",
  "api",
]);

const skipFiles = new Set([
  "netlify.toml",
  "vercel.json",
  ".gitignore",
  "package.json",
  "package-lock.json",
]);

const skipExt = new Set([".md", ".bak", ".py", ".pyc", ".pyo"]);

function skip(src) {
  const rel = path.relative(root, src);
  if (!rel) return false;
  const parts = rel.split(path.sep);
  if (parts.some((part) => skipDirs.has(part))) return true;
  const base = path.basename(src);
  if (skipFiles.has(base)) return true;
  if (skipExt.has(path.extname(base).toLowerCase())) return true;
  return false;
}

fs.rmSync(dest, { recursive: true, force: true });
fs.mkdirSync(dest, { recursive: true });
for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
  const src = path.join(root, entry.name);
  if (skip(src)) continue;
  fs.cpSync(src, path.join(dest, entry.name), {
    recursive: true,
    filter(child) {
      return !skip(child);
    },
  });
}

const leaked = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (skipDirs.has(entry.name) || entry.name === "__pycache__") leaked.push(full);
      else walk(full);
    } else if (skipExt.has(path.extname(entry.name).toLowerCase()) || skipFiles.has(entry.name)) {
      leaked.push(full);
    }
  }
}
walk(dest);
if (leaked.length) {
  console.error("stage-public-site: internal files landed in publish/");
  for (const file of leaked) console.error("  " + path.relative(dest, file));
  process.exit(1);
}

const requiredMedia = [
  ["media/from-first-search-to-front-desk.mp4", 7_000_000],
  ["media/from-first-search-to-front-desk-poster.jpg", 20_000],
  ["media/from-first-search-to-front-desk.vtt", 200],
];
for (const [rel, minBytes] of requiredMedia) {
  const file = path.join(dest, rel);
  if (!fs.existsSync(file) || fs.statSync(file).size < minBytes) {
    console.error("stage-public-site: missing or empty staged asset " + rel);
    process.exit(1);
  }
}

function resolvePublic(urlPath) {
  const clean = urlPath.split("#")[0].split("?")[0];
  if (!clean.startsWith("/")) return null;
  const rel = decodeURIComponent(clean.replace(/^\/+/, ""));
  if (!rel) return path.join(dest, "index.html");
  const exact = path.join(dest, rel);
  if (fs.existsSync(exact) && fs.statSync(exact).isFile()) return exact;
  if (rel.endsWith("/")) {
    const index = path.join(dest, rel, "index.html");
    if (fs.existsSync(index)) return index;
  }
  const asHtml = path.join(dest, rel + ".html");
  if (fs.existsSync(asHtml)) return asHtml;
  const asIndex = path.join(dest, rel, "index.html");
  if (fs.existsSync(asIndex)) return asIndex;
  return null;
}

const pagesToCheck = ["index.html", "marketing.html"];
const attrRe = /(?:href|src|poster|data-src)\s*=\s*["']([^"']+)["']/gi;
const broken = [];
let checked = 0;
for (const page of pagesToCheck) {
  const html = fs.readFileSync(path.join(dest, page), "utf8");
  for (const match of html.matchAll(attrRe)) {
    const url = match[1].trim();
    if (!url.startsWith("/") || url.startsWith("//")) continue;
    checked += 1;
    if (!resolvePublic(url)) broken.push(page + " -> " + url);
  }
}
if (broken.length) {
  console.error("stage-public-site: broken local links");
  for (const item of broken) console.error("  " + item);
  process.exit(1);
}

console.log(
  "Staged public site to ./publish (" +
    checked +
    " local links on index and marketing; video, poster, and captions present)"
);
