import fs from 'node:fs';
import vm from 'node:vm';

// Audit the actual build allowlist, not drafts or exported prototype files.
const build = fs.readFileSync('scripts/build-static.mjs', 'utf8');
const pages = [...build.matchAll(/"([\w-]+\.html)"/g)].map(m => m[1]);
const source = fs.readFileSync('scripts/language.js', 'utf8');
const dictionary = vm.runInNewContext(source.slice(0, source.indexOf('  const zhTitles')) + '\nreturn zh; })()', {document: {title: ''}});
const decode = value => value.replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&quot;/g, '"').replace(/&#39;|&apos;/g, "'").replace(/&gt;/g, '>').replace(/&lt;/g, '<').replace(/\s+/g, ' ').trim();
const preserved = new Set(['Cyber Projection Toolkit', 'Blender', 'EN', '中文', 'zhuyifan001225@gmail.com']);
let missingCount = 0;
for (const page of pages) {
  const html = fs.readFileSync(page, 'utf8').replace(/<(script|style|head)[\s\S]*?<\/\1>/gi, '').replace(/<!--[\s\S]*?-->/g, '');
  const values = [...html.matchAll(/>([^<>]+)</g)].map(m => decode(m[1]));
  if (process.argv.includes('--attributes')) values.push(...[...html.matchAll(/(?:aria-label|alt|title|placeholder)="([^"]+)"/g)].map(m => decode(m[1])));
  const missing = [...new Set(values.filter(text => /[A-Za-z]{3}/.test(text) && !dictionary[text] && !preserved.has(text)))];
  missingCount += missing.length;
  if (missing.length) console.log(page, JSON.stringify(missing, null, 2));
}
console.log(`Checked ${pages.length} pages / ${Object.keys(dictionary).length} translations. Untranslated strings: ${missingCount}.`);
process.exitCode = missingCount ? 1 : 0;
