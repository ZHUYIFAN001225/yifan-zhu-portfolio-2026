import { cp, mkdir, readdir, rm, stat } from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const dist = path.join(root, "dist");
const entries = [
  "index.html",
  "work.html",
  "about.html",
  "case-studies.html",
  "practice.html",
  "resource-platform.html",
  "project-biodiversity-clock.html",
  "project-cross-culture.html",
  "project-ear-shield.html",
  "project-machine-mapping.html",
  "project-scone-through-time.html",
  "project-seedwalkers.html",
  "styles.css",
  "assets"
];

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

for (const entry of entries) {
  await cp(path.join(root, entry), path.join(dist, entry), { recursive: true });
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
