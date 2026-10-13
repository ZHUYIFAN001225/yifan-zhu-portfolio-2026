import { categories, projects, normalizeCategory, orderedProjects } from './portfolio-catalog.mjs';

const root = document.querySelector('.v3-workspace');
const cards = [...root.querySelectorAll('[data-project]')];
const gallery = root.querySelector('.v3-gallery');
const filters = [...root.querySelectorAll('[data-filter]')];
const language = () => document.documentElement.lang.startsWith('zh') ? 'zh' : 'en';
const local = (en,zh) => language()==='zh' ? zh : en;
let active = 'all';
let frame = 0;
let opener;
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const reduceMotion=()=>motion.matches||document.documentElement.dataset.motion==='reduce';

// CSS grid preserves DOM/keyboard order while variable media ratios form the gallery.
function layout() {
  cancelAnimationFrame(frame);
  frame=requestAnimationFrame(()=>{
    gallery.classList.add('is-masonry');
    const css=getComputedStyle(gallery), row=parseFloat(css.gridAutoRows), gap=parseFloat(css.rowGap);
    cards.forEach(card=>{ if(!card.hidden)card.style.gridRowEnd=`span ${Math.ceil((card.firstElementChild.getBoundingClientRect().height+gap)/(row+gap))}`; });
  });
}
const observer = new ResizeObserver(layout);
cards.forEach(card=>observer.observe(card.firstElementChild));
gallery.querySelectorAll('img').forEach(img=>img.addEventListener('load',layout));
window.addEventListener('resize',layout);
document.fonts?.ready.then(layout);

function contextLinks() {
  root.querySelectorAll('[data-case-link]').forEach(link=>{
    const url=new URL(link.href);
    url.searchParams.set('from',active);
    url.searchParams.set('lang',language());
    link.href=url.pathname+url.search+url.hash;
  });
}
function labels() {
  const category=categories.find(c=>c.id===active);
  root.querySelector('[data-gallery-title]').textContent=category.label[language()];
  root.querySelector('[data-gallery-description]').textContent=category.description[language()];
  root.querySelector('[data-visible-count]').textContent=cards.filter(c=>!c.hidden).length;
  const share=root.querySelector('[data-share]');
  share.textContent=local('Copy collection link','复制分类链接')+' ↗';
  share.setAttribute('aria-label',local('Copy collection link','复制分类链接'));
  contextLinks();
}
function applyFilter(value,{push=false}={}) {
  const next=normalizeCategory(value),changed=next!==active;
  active=next;
  gallery.dataset.collection=active;
  const ordered=orderedProjects(active);
  // DOM, reading and keyboard order all follow this role's priorities.
  for(const project of ordered)gallery.append(cards.find(c=>c.dataset.project===project.id));
  if(push&&changed){ const url=new URL(location.href);url.searchParams.set('filter',active);history.pushState({filter:active},'',url); }
  filters.forEach(link=>{ const current=link.dataset.filter===active;link.classList.toggle('is-active',current);current?link.setAttribute('aria-current','page'):link.removeAttribute('aria-current'); });
  let visibleIndex=0;
  cards.forEach(card=>{
    const visible=active==='all'||card.dataset.categories.split(' ').includes(active);
    card.hidden=!visible;card.classList.toggle('is-filter-enter',visible&&push&&changed&&!reduceMotion());
    if(visible)card.style.setProperty('--reveal-delay',`${Math.min(visibleIndex++,3)*35}ms`);
    if(!visible)card.querySelector('video')?.pause();
  });
  labels();layout();
  document.dispatchEvent(new CustomEvent('portfolio:collection',{detail:{collection:active}}));
}
filters.forEach(link=>link.addEventListener('click',event=>{
  if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
  event.preventDefault();applyFilter(link.dataset.filter,{push:true});
}));
window.addEventListener('popstate',()=>applyFilter(new URL(location.href).searchParams.get('filter')));
document.addEventListener('portfolio:select-collection',event=>{
  applyFilter(event.detail.collection,{push:true});
  // A deep scroll position should not strand visitors below a shorter collection.
  root.scrollIntoView({block:'start',behavior:'instant'});
});
document.addEventListener('portfolio:language',labels);
applyFilter(new URL(location.href).searchParams.get('filter'));
const initialURL=new URL(location.href);
if(initialURL.searchParams.has('filter')&&initialURL.searchParams.get('filter')!==active){initialURL.searchParams.set('filter',active);history.replaceState(null,'',initialURL);}

root.querySelector('[data-share]').addEventListener('click',async event=>{
  const button=event.currentTarget;
  const url=new URL('work.html',location.href);url.searchParams.set('filter',active);url.searchParams.set('lang',language());
  try{await navigator.clipboard.writeText(url.href);button.textContent=local('Link copied','链接已复制')+' ↗';button.setAttribute('aria-label',local('Link copied','链接已复制'));}
  catch{let field=root.querySelector('.v3-copy-fallback');if(!field){field=document.createElement('input');field.className='v3-copy-fallback';field.readOnly=true;root.querySelector('.v3-gallery-top').after(field);}field.setAttribute('aria-label',local('Copy this URL','复制此链接'));field.value=url.href;field.focus();field.select();}
});

// Preview clips load only on deliberate mouse interaction, never on page load.
const finePointer=matchMedia('(hover: hover) and (pointer: fine)');
const revealObserver=new IntersectionObserver(entries=>entries.forEach(entry=>{
  if(!entry.isIntersecting)return;
  if(!reduceMotion())entry.target.classList.add('is-image-revealed');
  revealObserver.unobserve(entry.target);
}),{threshold:.12});
cards.filter(card=>card.getBoundingClientRect().top>innerHeight).forEach(card=>revealObserver.observe(card.querySelector('.v3-media')));
root.querySelectorAll('.v3-media').forEach(media=>{
  const video=media.querySelector('video');if(!video)return;
  const stop=()=>{video.pause();video.classList.remove('is-playing');};
  media.addEventListener('pointerenter',async()=>{if(reduceMotion()||!finePointer.matches||document.visibilityState!=='visible')return;if(!video.src)video.src=video.dataset.preview;try{await video.play();if(media.matches(':hover')&&!reduceMotion())video.classList.add('is-playing');else stop();}catch{stop();}});
  media.addEventListener('pointerleave',stop);
  media.addEventListener('blur',stop);
  motion.addEventListener('change',stop);
  document.addEventListener('portfolio:motion',stop);
});
document.addEventListener('visibilitychange',()=>{if(document.hidden)root.querySelectorAll('video').forEach(v=>{v.pause();v.classList.remove('is-playing');});});

const dialog=document.createElement('dialog');dialog.className='v3-video-dialog';dialog.setAttribute('aria-labelledby','v3-video-title');
dialog.innerHTML='<div class="v3-dialog-header"><h2 id="v3-video-title"></h2><button type="button" data-close></button></div><video controls playsinline preload="metadata"></video><p class="v3-video-error" hidden></p><div class="v3-dialog-footer"><a data-dialog-case></a><a data-original target="_blank" rel="noopener noreferrer"></a><a data-release target="_blank" rel="noopener noreferrer" hidden></a></div>';
document.body.append(dialog);
const player=dialog.querySelector('video');
function close(){player.pause();dialog.close();}
dialog.querySelector('[data-close]').addEventListener('click',close);
dialog.addEventListener('click',event=>{if(event.target===dialog){const b=dialog.getBoundingClientRect();if(event.clientX<b.left||event.clientX>b.right||event.clientY<b.top||event.clientY>b.bottom)close();}});
dialog.addEventListener('close',()=>{player.pause();player.removeAttribute('src');player.load();document.documentElement.classList.remove('v3-dialog-open');opener?.focus({preventScroll:true});});
dialog.addEventListener('cancel',()=>player.pause());
player.addEventListener('error',()=>{dialog.querySelector('.v3-video-error').hidden=false;});
export function openVideo(id,trigger) {
  const project=projects.find(p=>p.id===id);if(!project?.video)return;
  opener=trigger;document.querySelectorAll('video').forEach(v=>v.pause());
  dialog.querySelector('h2').textContent=project.title[language()];
  dialog.querySelector('[data-close]').textContent=local('Close video','关闭视频');
  const link=dialog.querySelector('[data-dialog-case]');link.textContent=(project.href.startsWith('practice.html')?local('View film & details','查看影像与制作信息'):local('Read the full story','阅读完整案例'))+' ↗';const target=new URL(project.href,location.href);target.searchParams.set('from',active);target.searchParams.set('lang',language());link.href=target;
  const source=dialog.querySelector('[data-original]');source.textContent=local('Open original video','打开原视频')+' ↗';source.href=project.video;
  const release=dialog.querySelector('[data-release]');release.hidden=!project.external;if(project.external){release.href=project.external;release.textContent=project.externalLabel[language()]+' ↗';}else release.removeAttribute('href');
  const error=dialog.querySelector('.v3-video-error');error.textContent=local('Video could not play. Open the original file.','视频暂时无法播放，请打开原视频文件。');error.hidden=true;
  player.poster=project.cover;player.src=project.webVideo||project.video;dialog.showModal();document.documentElement.classList.add('v3-dialog-open');player.play().catch(()=>{ /* Native controls remain available if autoplay is restricted. */ });
}
root.querySelectorAll('[data-play]').forEach(button=>button.addEventListener('click',()=>openVideo(button.dataset.play,button)));
