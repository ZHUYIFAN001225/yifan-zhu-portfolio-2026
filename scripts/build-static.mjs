import { cp, mkdir, readdir, rm, stat } from "node:fs/promises";
import path from "node:path";
import { renderPortfolio } from "./render-portfolio.mjs";

const root = process.cwd();
const dist = path.join(root, "dist");
await renderPortfolio();
const entries = [
  "index.html",
  "work.html",
  "about.html",
  "case-studies.html",
  "practice.html",
  "resource-platform.html",
  "project-cyber-projection-toolkit.html",
  "project-biodiversity-clock.html",
  "project-cross-culture.html",
  "project-ear-shield.html",
  "project-machine-mapping.html",
  "project-scone-through-time.html",
  "project-seedwalkers.html",
  "project-anxiety-market.html",
  "project-beauty-marketplace.html",
  "project-glasgow-booking.html",
  "scripts/language.js",
  "scripts/portfolio-catalog.mjs",
  "scripts/gallery.mjs",
  "scripts/v3-site.js",
  "scripts/theme.js",
  "scripts/mobile-work-nav.mjs",
  "styles.css",
  "v3.css",
  "themes.css",
  "assets",
  "demos"
];

if (path.resolve(dist) !== path.join(path.resolve(root), "dist")) throw new Error("Unsafe output directory");
await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

for (const entry of entries) {
  const destination = path.join(dist, entry);
  await mkdir(path.dirname(destination), { recursive: true });
  await cp(path.join(root, entry), destination, {
    recursive: true,
    // This ignored camera/export master is not referenced by the website.
    // Keep it in the source project and the backup, outside the web output.
    filter: source => path.resolve(source) !== path.resolve(root, "assets/practice-videos/hyper3d-ai-pipeline-collaboration.mp4")
  });
}

async function collectFiles(dir) {
  const files = [];
  for (const item of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) files.push(...await collectFiles(full));
    else files.push(full);
  }
  return files;
}

const files = await collectFiles(dist);
let totalBytes = 0;
for (const file of files) totalBytes += (await stat(file)).size;

console.log(`Built ${files.length} files into dist/ (${(totalBytes / 1024 / 1024).toFixed(1)} MB).`);
