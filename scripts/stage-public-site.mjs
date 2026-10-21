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

console.log("Staged public site to ./publish");
