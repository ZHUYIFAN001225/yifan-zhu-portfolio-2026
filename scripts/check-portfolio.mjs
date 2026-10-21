import assert from 'node:assert/strict';
import fs from 'node:fs';
import {categories,projects,normalizeCategory,collectionOrder,orderedProjects,forthcoming,caseHighlights,featured} from './portfolio-catalog.mjs';
assert.ok(featured.every(id=>projects.some(p=>p.id===id)),'Unknown featured project');

assert.equal(categories.length,5);
assert.equal(new Set(projects.map(p=>p.id)).size,projects.length);
for(const category of categories){
  assert.equal(normalizeCategory(category.id),category.id);
  assert.ok(category.id==='all'||projects.some(p=>p.categories.includes(category.id)),`Empty collection: ${category.id}`);
}
assert.equal(normalizeCategory('service'),'service-transformation');
assert.equal(normalizeCategory('unknown'),'all');
for(const [category,ids] of Object.entries(collectionOrder)){
  assert.deepEqual(new Set(ids),new Set(projects.filter(p=>category==='all'||p.categories.includes(category)).map(p=>p.id)),`Incomplete priorities: ${category}`);
  assert.deepEqual(orderedProjects(category).map(p=>p.id),ids);
}
assert.equal(forthcoming.length,2);
assert.deepEqual(orderedProjects('digital-products-ux').slice(0,2).map(p=>p.id),['beauty-marketplace','salon-booking']);
assert.ok(forthcoming.every(f=>!projects.some(p=>p.id===f.id)));
for(const [id,highlight] of Object.entries(caseHighlights)){
  const project=projects.find(p=>p.id===id);assert.ok(project);
  assert.ok(fs.readFileSync(project.href,'utf8').includes(`id="${highlight.anchor}"`),`Missing outcome: ${id}`);
  if(highlight.hero){assert.ok(fs.existsSync(highlight.hero));assert.ok(fs.existsSync(highlight.original));}
}
for(const project of projects){
  for(const category of project.categories)assert.ok(categories.some(c=>c.id===category));
  for(const media of [project.cover,project.video,project.webVideo,project.preview].filter(Boolean))assert.ok(fs.existsSync(media),`Missing media: ${media}`);
  for(const link of [project.href,project.jump].filter(Boolean)){
    const [file,anchor]=link.split('#');assert.ok(fs.existsSync(file),`Missing case: ${file}`);
    if(anchor)assert.ok(fs.readFileSync(file,'utf8').includes(`id="${anchor}"`),`Missing section: ${link}`);
  }
}
for(const page of ['index.html','work.html']){
  const html=fs.readFileSync(page,'utf8');
  assert.equal([...html.matchAll(/data-project="/g)].length,projects.length);
  for(const c of categories)assert.ok(html.includes(`href="work.html?filter=${c.id}"`));
  assert.ok(html.includes('type="module" src="scripts/gallery.mjs"'));
}
// Every local link and media reference in public HTML resolves, including original cases.
const build=fs.readFileSync('scripts/build-static.mjs','utf8');
const pages=[...build.matchAll(/"([\w-]+\.html)"/g)].map(m=>m[1]);
for(const page of pages){
  const html=fs.readFileSync(page,'utf8');
  for(const [,link] of html.matchAll(/(?:src|href)="([^"#]+)"/g)){
    if(/^(?:https?:|mailto:|data:)/.test(link))continue;
    const file=link.split(/[?#]/)[0];
    assert.ok(fs.existsSync(file),`Broken local reference in ${page}: ${link}`);
  }
}
console.log(`Verified ${projects.length} works, ${categories.length} collections, media, case anchors and ${pages.length} public pages.`);
