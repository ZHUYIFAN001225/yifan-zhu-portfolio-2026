// Exports the product case studies as PDFs by printing the built case pages, so the PDF always
// matches the website (diagrams included). Run after `npm run build`.
// Example (this repo has no Playwright dependency):
//   PORTFOLIO_PLAYWRIGHT=/path/to/node_modules/playwright PORTFOLIO_CHROMIUM=/path/to/chromium npm run export:cases
// Needs Playwright + Chromium: set PORTFOLIO_PLAYWRIGHT to the playwright package path if it is not installed here,
// and PORTFOLIO_CHROMIUM to a Chromium executable if Playwright has no bundled browser.
import fs from 'node:fs/promises';
import http from 'node:http';
import path from 'node:path';
import {createRequire} from 'node:module';
import {productCases} from './product-case-data.mjs';

const require = createRequire(import.meta.url);
const {chromium} = require(process.env.PORTFOLIO_PLAYWRIGHT || 'playwright');
const root = path.resolve('dist');
const types = {'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.woff2':'font/woff2','.mp4':'video/mp4'};
const server = http.createServer(async (req, res) => {
  const file = path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!file.startsWith(root)) { res.writeHead(403); return res.end(); }
  try { const body = await fs.readFile(file); res.writeHead(200, {'Content-Type': types[path.extname(file)] || 'application/octet-stream'}); res.end(body); }
  catch { res.writeHead(404); res.end(); }
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${server.address().port}/`;

// Print-only adjustments: no live prototype, no buttons, no site chrome.
const printCss = `
  .site-header,.v3-mobile-dock,.v3-mobile-sheet,footer,.back-link,.ux-head-actions,[data-case-pdf],
  #interactive-demo .ux-demo-stage,#interactive-demo [data-demo-unavailable],.v3-intro,.skip-link,a[href="#main"]{display:none!important}
  html,body{background:#fff!important}
  *{animation:none!important;transition:none!important}
  .ux-smap-l1,.ux-smap-path,.ux-details figure,.ux-pains>*,.ux-persona,.ux-needs,.ux-scenario,.ux-taps,.ux-bridge,.ux-flywheel,.ux-blueprint,.ux-iteration>*,figure,article{break-inside:avoid}
  img{max-width:100%}
  .ux-details{grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:20px 16px!important}
  .ux-shot--zoom img{max-height:240px;object-fit:cover;object-position:top}
  .ux-smap-steps,.ux-smap-row{grid-template-columns:repeat(auto-fill,minmax(96px,1fr))!important}
`;
const browser = await chromium.launch(process.env.PORTFOLIO_CHROMIUM ? {executablePath: process.env.PORTFOLIO_CHROMIUM} : {});
const out = path.resolve('assets/v3/case-pdfs');
await fs.mkdir(out, {recursive: true});
for (const c of productCases) {
  const page = c.file;
  for (const lang of ['EN', 'ZH']) {
    const ctx = await browser.newContext({reducedMotion: 'reduce', viewport: {width: 1200, height: 1600}});
    const tab = await ctx.newPage();
    await tab.goto(`${base}${page}?lang=${lang.toLowerCase()}`, {waitUntil: 'networkidle'});
    await tab.addStyleTag({content: printCss});
    await tab.evaluate(() => { document.querySelectorAll('[data-anim]').forEach(g => g.classList.add('is-on')); document.querySelectorAll('img[loading=lazy]').forEach(i => i.loading = 'eager');
      // The live frame is not printed (see print CSS); give the reader the address under the title instead.
      const stage = document.querySelector('[data-demo-stage][data-public-demo]');
      if (stage) { const p = document.createElement('p'); p.className = 'v3-demo-caption'; const zh = document.documentElement.lang.startsWith('zh'); const url = stage.dataset.publicDemo; p.innerHTML = (zh ? '在线试用交互原型：' : 'Try the interactive prototype: ') + '<a href="' + url + '">' + url.replace(/^https:\/\//, '') + '</a>'; document.querySelector('.v3-product-status').after(p); }
    });
    await tab.evaluate(async () => { await Promise.all([...document.images].map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; }))); await document.fonts.ready; });
    // Chrome stores WebP losslessly in a PDF; re-encode screen captures as compact JPEG for printing.
    await tab.evaluate(async () => {
      for (const img of document.querySelectorAll('img[src$=".webp"]')) {
        if (!img.naturalWidth) continue;
        const w = Math.min(img.naturalWidth, img.closest('.ux-shot--zoom') ? 720 : 360), h = Math.round(img.naturalHeight * w / img.naturalWidth);
        const c = document.createElement('canvas'); c.width = w; c.height = h; c.getContext('2d').drawImage(img, 0, 0, w, h);
        img.removeAttribute('loading'); img.src = c.toDataURL('image/jpeg', 0.82); await img.decode().catch(() => {});
      }
    });
    await tab.pdf({path: path.join(out, `${c.pdf}-${lang}.pdf`), format: 'A4', printBackground: true, margin: {top: '14mm', bottom: '14mm', left: '12mm', right: '12mm'}});
    await ctx.close();
    console.log(`${c.pdf}-${lang}.pdf`);
  }
}
await browser.close();
server.close();
