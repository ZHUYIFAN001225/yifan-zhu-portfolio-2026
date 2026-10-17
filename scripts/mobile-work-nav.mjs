import {categories,normalizeCategory} from './portfolio-catalog.mjs';

// Phone navigation stays within thumb reach on the gallery and every case page.
const phone=matchMedia('(max-width:760px)');
const language=()=>document.documentElement.lang.startsWith('zh')?'zh':'en';
const text=(en,zh)=>language()==='zh'?zh:en;
const collection=()=>normalizeCategory(document.querySelector('.v3-gallery')?.dataset.collection||new URL(location.href).searchParams.get('from'));
const dock=document.createElement('nav');dock.className='v3-mobile-dock';
const trigger=document.createElement('button');trigger.type='button';trigger.className='v3-mobile-browse';trigger.setAttribute('aria-haspopup','dialog');trigger.setAttribute('aria-controls','v3-mobile-collections');trigger.setAttribute('aria-expanded','false');
trigger.innerHTML='<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="3" width="7" height="7" rx="2"/><rect x="14" y="3" width="7" height="7" rx="2"/><rect x="3" y="14" width="7" height="7" rx="2"/><rect x="14" y="14" width="7" height="7" rx="2"/></svg><span><strong></strong><small></small></span><span class="v3-mobile-chevron" aria-hidden="true">⌃</span>';
const top=document.createElement('button');top.type='button';top.className='v3-mobile-top';top.innerHTML='<span aria-hidden="true">↑</span>';
dock.append(trigger,top);
const sheet=document.createElement('dialog');sheet.id='v3-mobile-collections';sheet.className='v3-mobile-sheet';sheet.setAttribute('aria-labelledby','v3-mobile-collections-title');
const header=document.createElement('div');header.className='v3-mobile-sheet-head';
const title=document.createElement('h2');title.id='v3-mobile-collections-title';
const close=document.createElement('button');close.type='button';close.textContent='×';header.append(title,close);
const list=document.createElement('nav');list.className='v3-mobile-choices';
categories.forEach(c=>{const a=document.createElement('a');a.dataset.mobileCollection=c.id;const label=document.createElement('span'),check=document.createElement('span');check.className='v3-mobile-check';check.setAttribute('aria-hidden','true');check.textContent='✓';a.append(label,check);list.append(a);});
// Pages outside the collections stay reachable on phones, where the header hides them.
const more=document.createElement('nav');more.className='v3-mobile-choices v3-mobile-more';
const films=document.createElement('a');films.dataset.mobilePage='practice.html';const filmsLabel=document.createElement('span'),filmsCheck=document.createElement('span');filmsCheck.className='v3-mobile-check';filmsCheck.setAttribute('aria-hidden','true');filmsCheck.textContent='✓';films.append(filmsLabel,filmsCheck);more.append(films);
sheet.append(header,list,more);document.body.append(dock,sheet);

function labels(){
  const lang=language(),active=collection(),category=categories.find(c=>c.id===active);
  dock.setAttribute('aria-label',text('Mobile work navigation','手机作品导航'));
  trigger.querySelector('strong').textContent=text('Browse work','作品分类');
  trigger.querySelector('small').textContent=category.label[lang];
  trigger.setAttribute('aria-label',text('Browse work. Current collection: ','作品分类，当前：')+category.label[lang]);
  top.setAttribute('aria-label',text('Back to top','回到顶部'));title.textContent=text('Explore by discipline','按职业方向浏览');
  close.setAttribute('aria-label',text('Close work categories','关闭作品分类'));more.setAttribute('aria-label',text('More pages','更多页面'));filmsLabel.textContent=text('Films & Tools','影像与工具');films.href=`practice.html?lang=${lang}`;if(location.pathname.endsWith('/practice.html'))films.setAttribute('aria-current','page');else films.removeAttribute('aria-current');list.setAttribute('aria-label',text('Work categories','作品分类'));
  list.querySelectorAll('a').forEach(a=>{const c=categories.find(c=>c.id===a.dataset.mobileCollection);a.firstElementChild.textContent=c.label[lang];a.href=`work.html?filter=${c.id}&lang=${lang}#work`;if(c.id===active&&!location.pathname.endsWith('/practice.html'))a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
}
function dismiss(){sheet.close();}
trigger.addEventListener('click',()=>{if(!phone.matches)return;labels();sheet.showModal();trigger.setAttribute('aria-expanded','true');document.documentElement.classList.add('v3-mobile-nav-open');});
close.addEventListener('click',dismiss);
sheet.addEventListener('close',()=>{trigger.setAttribute('aria-expanded','false');document.documentElement.classList.remove('v3-mobile-nav-open');if(phone.matches)trigger.focus({preventScroll:true});});
sheet.addEventListener('click',e=>{if(e.target!==sheet)return;const r=sheet.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dismiss();});
more.addEventListener('click',()=>dismiss());
list.addEventListener('click',e=>{
  const a=e.target.closest('[data-mobile-collection]');if(!a||e.metaKey||e.ctrlKey||e.shiftKey||e.altKey)return;
  if(document.querySelector('.v3-workspace:not(.v3-featured)')){
    e.preventDefault();dismiss();document.dispatchEvent(new CustomEvent('portfolio:select-collection',{detail:{collection:a.dataset.mobileCollection}}));
  }else dismiss();
});
top.addEventListener('click',()=>window.scrollTo({top:0,behavior:document.documentElement.dataset.motion==='reduce'||matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'}));
phone.addEventListener('change',()=>{if(!phone.matches&&sheet.open)dismiss();});
document.addEventListener('portfolio:language',labels);document.addEventListener('portfolio:collection',labels);window.addEventListener('popstate',labels);
labels();
