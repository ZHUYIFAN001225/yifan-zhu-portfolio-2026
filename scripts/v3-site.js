(() => {
  import('./mobile-work-nav.mjs');
  const zh=()=>document.documentElement.lang.startsWith('zh');
  const text=(en,cn)=>zh()?cn:en;
  // On case pages, preserve the recruiter's collection context and expose real media.
  if(!document.body.classList.contains('v3-index')){
    import('./portfolio-catalog.mjs').then(({projects,categories,normalizeCategory,caseHighlights})=>{
      const page=location.pathname.split('/').pop();const project=projects.find(p=>p.href===page+location.hash)||projects.find(p=>p.href.split('#')[0]===page);
      if(!project)return;
      const from=normalizeCategory(new URL(location.href).searchParams.get('from'));
      const tools=document.createElement('nav');tools.className='v3-case-tools';tools.setAttribute('aria-label',text('Project navigation','项目导航'));
      const back=document.createElement('a');back.className='v3-collection-back';tools.append(back);
      if(project.video){const a=document.createElement('a');a.href=page==='practice.html'?(location.hash||'#blender-visual-reel'):'#product-demo-title';a.className='v3-tool-primary';a.dataset.toolLabel='video';tools.append(a);}
      if(project.demo){const a=document.createElement('a');a.href='#interactive-demo';a.className='v3-tool-primary';a.dataset.toolLabel='demo';tools.append(a);}
      if(caseHighlights[project.id]){const a=document.createElement('a');a.href='#'+caseHighlights[project.id].anchor;a.className='v3-tool-primary';a.dataset.toolLabel='outcome';tools.append(a);}
      if(project.jump){const a=document.createElement('a');a.href=project.jump.split('#')[1]?'#'+project.jump.split('#')[1]:project.jump;a.className='v3-tool-primary';a.dataset.toolLabel='prototype';tools.append(a);}
      if(project.external){const a=document.createElement('a');a.href=project.external;a.target='_blank';a.rel='noopener noreferrer';a.dataset.toolLabel='live';tools.append(a);}
      const nav=document.createElement('nav');nav.className='v3-case-categories';nav.setAttribute('aria-label',text('Work categories','作品分类'));
      categories.forEach(c=>{const a=document.createElement('a');a.dataset.collection=c.id;nav.append(a);});
      document.querySelector('.site-header').after(tools,nav);
      // One way back: the collection link replaces the older breadcrumb at the top of the case.
      const main=document.querySelector('main'),crumb=main?.querySelector('.back-link');
      if(crumb&&crumb.getBoundingClientRect().top-main.getBoundingClientRect().top<240)crumb.hidden=true;
      function update(){
        const lang=zh()?'zh':'en',url=`work.html?filter=${from}&lang=${lang}`;
        back.href=url;back.textContent='← '+text('Back to collection','返回作品分类');
        document.querySelectorAll('.back-link').forEach(a=>{if(a.getAttribute('href')?.includes('work.html'))a.href=url;});
        tools.querySelectorAll('[data-tool-label]').forEach(a=>a.textContent=a.dataset.toolLabel==='demo'?text('Try the prototype','试用原型'):a.dataset.toolLabel==='video'?(page==='practice.html'?text('Watch film','观看影像'):text('Watch walkthrough','观看演示')):a.dataset.toolLabel==='prototype'?text('See prototype evidence','查看原型证据'):a.dataset.toolLabel==='outcome'?text('View outcome','查看成果'):text(project.externalLabel?.en||'View live product',project.externalLabel?.zh||'查看在线产品'));
        nav.querySelectorAll('a').forEach(a=>{const c=categories.find(c=>c.id===a.dataset.collection);a.href=`work.html?filter=${c.id}&lang=${lang}`;a.textContent=c.label[lang];if(c.id===from)a.setAttribute('aria-current','page');});
      }
      update();document.addEventListener('portfolio:language',update);
    });
  }
  // Full-resolution evidence stays accessible instead of being cropped to a cover.
  const evidence=document.querySelectorAll('.image-stack img,.evidence-gallery img,.v3-evidence img,.case-head img,.bio-hero img,.v3-product-hero img,.v3-product-screens img,.ux-screens img,.ux-field-evidence img');
  evidence.forEach(img=>{if(img.closest('a'))return;const a=document.createElement('a');a.className='v3-image-link';a.href=img.getAttribute('src');a.target='_blank';a.rel='noopener';a.setAttribute('aria-label',text('Open image at full size','查看完整图片'));img.before(a);a.append(img);});
  document.addEventListener('portfolio:language',()=>document.querySelectorAll('.v3-image-link').forEach(a=>a.setAttribute('aria-label',text('Open image at full size','查看完整图片'))));
  const updateCasePdfs=()=>document.querySelectorAll('[data-case-pdf]').forEach(a=>{a.href=`assets/v3/case-pdfs/${a.dataset.casePdf}-${zh()?'ZH':'EN'}.pdf`;});
  updateCasePdfs();document.addEventListener('portfolio:language',updateCasePdfs);
  // Embedded prototypes: a public deployment (set per case) or, during local review,
  // the running local demo service. Public builds never publish localhost links.
  const stages=document.querySelectorAll('[data-demo-stage]');
  if(stages.length){
    const local=['127.0.0.1','localhost','::1'].includes(location.hostname);
    const ready=demos=>{
      stages.forEach(stage=>{
        // A build hosted with the site wins; the local demo services only fill in when there is none.
        const key=stage.dataset.demoStage,url=stage.dataset.publicDemo||(local&&demos[key]);
        const unavailable=stage.parentElement.querySelector('[data-demo-unavailable]');
        if(!url){if(unavailable)unavailable.hidden=false;return;}
        // Public prototypes follow the portfolio language (they default to English).
        const withLang=(u,embed)=>{if(!stage.dataset.publicDemo&&local&&demos[key])return u;try{const x=new URL(u,location.href);x.searchParams.set('lang',(document.documentElement.lang||'en').startsWith('zh')?'zh':'en');if(embed)x.searchParams.set('embed','1');return x.href;}catch{return u;}};
        const frame=stage.querySelector('[data-demo-frame]');frame.src=withLang(url,true);
        // Some prototypes refresh when their window gains focus, which swallowed the first tap.
        // Give the frame focus as the pointer arrives, so the first real click goes through.
        frame.addEventListener('pointerenter',()=>{try{if(document.activeElement!==frame)frame.contentWindow.focus();}catch{}});stage.hidden=false;if(unavailable)unavailable.hidden=true;
        const links=()=>stage.querySelectorAll('[data-demo-launch]').forEach(a=>{const name=a.dataset.demoLaunch,hosted=name===key?stage.dataset.publicDemo:name===key+'Admin'?stage.dataset.publicAdmin:'',route=hosted||(local&&demos[name]);if(route){a.href=hosted?withLang(route):route;a.hidden=false;}});links();
        document.addEventListener('portfolio:language',()=>{const next=withLang(url,true);if(frame.src!==next)frame.src=next;links();});
        const note=stage.querySelector('[data-demo-local-note]');if(note)note.hidden=!(!stage.dataset.publicDemo&&local&&demos[key]);
        const cta=document.querySelector('[data-demo-cta]');
        if(cta){const label=()=>{cta.textContent=text('Try the prototype ↓','试用交互原型 ↓');};label();document.addEventListener('portfolio:language',label);}
      });
    };
    if(local)fetch('/__local-demos.json').then(r=>r.ok?r.json():{}).then(ready).catch(()=>ready({}));else ready({});
  }
})();

// Shared motion: native scrolling and navigation stay in control.
(() => {
  const html=document.documentElement, os=matchMedia('(prefers-reduced-motion: reduce)');
  const localReview=['127.0.0.1','localhost','::1'].includes(location.hostname);
  const params=new URL(location.href).searchParams;
  let chosen=false;try{chosen=localStorage.getItem('portfolio-reduce-motion')==='true';}catch{}
  if(localReview&&params.get('motion')==='reduce')chosen=true;
  const reduced=()=>os.matches||chosen;
  const update=()=>{html.dataset.motion=reduced()?'reduce':'full';document.dispatchEvent(new CustomEvent('portfolio:motion'));if(reduced())document.querySelector('.v3-signature')?.remove();};
  update();os.addEventListener('change',update);
  const setting=document.createElement('div');setting.className='v3-motion-setting';
  const label=document.createElement('label'),input=document.createElement('input'),caption=document.createElement('span');
  input.type='checkbox';input.checked=chosen;label.append(input,caption);setting.append(label);document.body.append(setting);
  const labels=()=>{caption.textContent=document.documentElement.lang.startsWith('zh')?'减少动态效果':'Reduce motion';};labels();document.addEventListener('portfolio:language',labels);
  input.addEventListener('change',()=>{chosen=input.checked;try{localStorage.setItem('portfolio-reduce-motion',String(chosen));}catch{}update();});
  // These local review logs record actual browser animation events, not simulated timers.
  if(localReview){const log=[];for(const name of ['animationstart','animationend','transitionstart','transitionend'])document.addEventListener(name,e=>{if(log.length>90)log.shift();log.push({event:name,name:e.animationName||e.propertyName,target:e.target.className,time:Math.round(performance.now())});html.dataset.motionLog=JSON.stringify(log);});}
  let seen=false;try{seen=sessionStorage.getItem('portfolio-intro-seen')==='true'||localStorage.getItem('portfolio-intro-seen')==='true';}catch{}
  const restoring=performance.getEntriesByType('navigation')[0]?.type==='back_forward';
  if(!reduced()&&!restoring&&(!seen||(localReview&&params.get('intro')==='preview'))){
    const signature=document.createElement('div');signature.className='v3-signature';signature.setAttribute('aria-hidden','true');
    const name=document.createElement('span');name.className='v3-signature-name';name.textContent='Yifan Zhu';const line=document.createElement('span');line.className='v3-signature-line';line.textContent=html.lang.startsWith('zh')?'从研究，到体验。':'Inquiry → Experience.';signature.append(name,line);document.body.append(signature);html.dataset.introState='running';
    const finish=()=>{signature.remove();html.dataset.introState='complete';};
    signature.addEventListener('animationend',e=>{if(e.animationName==='v3-signature-shell')finish();});setTimeout(finish,1600);
    try{sessionStorage.setItem('portfolio-intro-seen','true');localStorage.setItem('portfolio-intro-seen','true');}catch{}
  }else html.dataset.introState=reduced()?'reduced':'skipped';
  // Elements are always visible; only new off-screen sections get a one-time reveal.
  const io=new IntersectionObserver(entries=>{for(const entry of entries){if(!entry.isIntersecting)continue;if(!reduced()){entry.target.classList.add('is-in-view');html.dataset.lastReveal=entry.target.id||entry.target.className;}io.unobserve(entry.target);}},{threshold:.08});
  document.querySelectorAll('main .case-section,main .embedded-demo,main .product-proof,main .product-feature-system,main .product-iteration,main .v3-evidence,main .image-stack>figure,main .v3-case-outcome,main .v3-product-section,main .v3-product-screens,main .v3-approach,main .v3-public,main .skills-section,main .v3-role-links').forEach(el=>{if(el.closest('details')||el.getBoundingClientRect().top<innerHeight)return;el.dataset.scrollReveal='';io.observe(el);});
  // Deep links, find-in-page and history can open preserved detailed evidence.
  const revealTarget=()=>{if(!location.hash)return;let target;try{target=document.getElementById(decodeURIComponent(location.hash.slice(1)));}catch{}if(!target)return;let details=target.closest('details');while(details){details.open=true;details=details.parentElement.closest('details');}requestAnimationFrame(()=>target.scrollIntoView({block:'start',behavior:'instant'}));};
  revealTarget();window.addEventListener('hashchange',revealTarget);window.addEventListener('pageshow',event=>{if(event.persisted){document.querySelector('.v3-signature')?.remove();html.dataset.introState='skipped';}});
})();

// The header steps aside while reading down a page and returns as soon as the visitor scrolls up.
(() => {
  const html=document.documentElement;let last=scrollY,ticking=false;
  const update=()=>{ticking=false;const y=scrollY,open=html.classList.contains('v3-mobile-nav-open')||document.querySelector('dialog[open]');
    if(open||y<140||y<last-4)html.classList.remove('v3-header-hidden');else if(y>last+4)html.classList.add('v3-header-hidden');
    html.classList.toggle('v3-header-scrolled',y>8);last=y;};
  addEventListener('scroll',()=>{if(!ticking){ticking=true;requestAnimationFrame(update);}},{passive:true});
  document.addEventListener('focusin',e=>{if(e.target.closest('.site-header'))html.classList.remove('v3-header-hidden');});
})();

// Film players start as a poster with one clear play button; native controls appear once playing.
(() => {
  const zh=()=>document.documentElement.lang.startsWith('zh');
  document.querySelectorAll('main video[controls]').forEach(video=>{
    if(video.closest('.v3-player'))return;
    const wrap=document.createElement('div');wrap.className='v3-player';video.before(wrap);wrap.append(video);
    video.controls=false;
    const button=document.createElement('button');button.type='button';button.className='v3-player-button';
    const label=document.createElement('span'),time=document.createElement('small');label.append(document.createTextNode(''),time);button.append(label);wrap.append(button);
    const text=()=>{label.firstChild.nodeValue=zh()?'播放':'Play';button.setAttribute('aria-label',(zh()?'播放视频':'Play video')+(video.getAttribute('aria-label')?': '+video.getAttribute('aria-label'):''));};
    const duration=()=>{if(isFinite(video.duration)&&video.duration>0){const d=Math.round(video.duration);time.textContent=`${Math.floor(d/60)}:${String(d%60).padStart(2,'0')}`;}};
    text();duration();video.addEventListener('loadedmetadata',duration);document.addEventListener('portfolio:language',text);
    button.addEventListener('click',()=>{wrap.classList.add('is-playing');video.controls=true;video.muted=false;video.play().catch(()=>{});video.focus({preventScroll:true});});
  });
})();

// Shared element: the project image the visitor clicked continues into the case page header.
(() => {
  const key='portfolio-vt-project',reduce=()=>document.documentElement.dataset.motion==='reduce'||matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.addEventListener('click',event=>{
    const link=event.target.closest('a[data-case-link]');if(!link||reduce()||link.getAttribute('href')?.includes('practice.html')||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey)return;
    const card=link.closest('[data-project]'),img=card?.querySelector('.v3-media>img');if(!img)return;
    document.querySelectorAll('[style*="view-transition-name"]').forEach(el=>el.style.viewTransitionName='');
    img.style.viewTransitionName='yz-project';
    try{sessionStorage.setItem(key,card.dataset.project);}catch{}
  });
  window.addEventListener('pageshow',()=>document.querySelectorAll('.v3-media>img').forEach(img=>img.style.viewTransitionName=''));
  window.addEventListener('pagereveal',event=>{
    let id=null;try{id=sessionStorage.getItem(key);sessionStorage.removeItem(key);}catch{}
    if(!event.viewTransition||!id||reduce())return;
    const hero=document.querySelector('.v3-product-hero img,.case-head img,.bio-hero img,main .image-stack img,main img');
    if(!hero)return;
    hero.style.viewTransitionName='yz-project';
    event.viewTransition.finished.finally(()=>{hero.style.viewTransitionName='';});
  });
})();

window.addEventListener('pagereveal',event=>{
 if(!event.viewTransition)return;
 document.documentElement.dataset.pageTransition='running';
 // Rapid history navigation can cancel a browser transition before it is ready.
 // Keep that optional effect from producing an unhandled promise rejection.
 event.viewTransition.ready.catch(()=>{});
 if(document.documentElement.dataset.motion==='reduce'||matchMedia('(prefers-reduced-motion: reduce)').matches){event.viewTransition.skipTransition();document.documentElement.dataset.pageTransition='reduced';return;}
 event.viewTransition.finished.then(()=>{document.documentElement.dataset.pageTransition='complete';}).catch(()=>{document.documentElement.dataset.pageTransition='skipped';});
});

// Case diagrams play once as they scroll into view, so the logic unfolds in order.
// Without JavaScript, or with reduced motion, everything is simply shown in its final state.
(() => {
  const html=document.documentElement;
  // One motion language across the site: product diagrams, case-study grids, method chains and public metrics.
  const groups=document.querySelectorAll(['.ux-case :is(.ux-pains,.ux-persona,.ux-needs,.ux-lanes,.ux-bridge,.ux-flywheel,.ux-blueprint,.ux-scenario,.ux-phases,.ux-principles,.ux-chips--off,.ux-process,.ux-iterations,.ux-taps,.ux-journey,.ux-architecture,.ux-screens,.ux-research-plan,.ux-evidence-slots,.ux-roadmap,.ux-audience)',
    'main :is(.v3-approach ol,.v3-public-metrics,.skills-grid,.about-grid,.archive-grid,.practice-evidence-grid,.metrics-grid,.platform-grid,.link-card-grid,.support-grid,.process-flow,.role-grid,.research-card-grid,.reflection-grid,.outcome-grid,.logic-grid,.journey-grid,.method-card-grid,.scope-flow,.scone-criteria-grid,.product-problem-grid,.product-feature-grid,.iteration-evidence-grid,.impact-timeline,.ai-video-process,.practice-video-grid)'].join(','));
  if(!groups.length)return;
  const reduced=()=>html.dataset.motion==='reduce'||matchMedia('(prefers-reduced-motion: reduce)').matches;
  groups.forEach(g=>{
    g.dataset.anim='';
    if(g.classList.contains('ux-blueprint'))g.querySelectorAll('.ux-bp-row').forEach(row=>[...row.children].forEach((cell,i)=>cell.style.setProperty('--i',i)));
    else if(g.classList.contains('ux-lanes'))[...g.children].forEach((lane,l)=>lane.querySelectorAll('li').forEach((li,i)=>li.style.setProperty('--i',l*2+i)));
    else if(g.classList.contains('ux-persona'))g.querySelectorAll('li').forEach((li,i)=>li.style.setProperty('--i',i+1));
    else if(!g.classList.contains('ux-flywheel'))[...g.children].forEach((el,i)=>el.style.setProperty('--i',i));
  });
  // Count a figure up from zero, keeping its decimals and suffix (e.g. 381K+, 11.6K, 1.1K+).
  const countUp=(el,delay)=>{
    const node=[...el.childNodes].find(n=>n.nodeType===3&&/\d/.test(n.nodeValue));if(!node)return;
    const m=/^(\D*)(\d+(?:\.\d+)?)(.*)$/s.exec(node.nodeValue);if(!m)return;
    const [,pre,num,post]=m,end=parseFloat(num),dp=(num.split('.')[1]||'').length,start=performance.now()+delay,dur=1100;
    const tick=now=>{const k=Math.min(1,Math.max(0,(now-start)/dur)),e=1-Math.pow(1-k,3);node.nodeValue=pre+(end*e).toFixed(dp)+post;if(k<1)requestAnimationFrame(tick);};
    node.nodeValue=pre+(0).toFixed(dp)+post;requestAnimationFrame(tick);
  };
  const play=g=>{if(g.classList.contains('is-on'))return;g.classList.add('is-on');if(reduced())return;
    if(g.matches('.ux-taps'))g.querySelectorAll('b').forEach((el,i)=>countUp(el,i*160));
    else if(g.matches('.v3-public-metrics,.metrics-grid,.platform-metrics .platform-grid'))g.querySelectorAll(':scope>* strong').forEach((el,i)=>countUp(el,i*160));};
  if(reduced()||!('IntersectionObserver' in window)){groups.forEach(g=>g.classList.add('is-on'));return;}
  html.classList.add('ux-motion');
  const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){play(e.target);io.unobserve(e.target);}}),{threshold:0,rootMargin:'0px 0px -10% 0px'});
  groups.forEach(g=>io.observe(g));
  // Content at the very end of a page can never travel up past the trigger line; play it on arrival.
  const atEnd=()=>{if(innerHeight+scrollY>=document.documentElement.scrollHeight-8)groups.forEach(g=>{if(g.getBoundingClientRect().top<innerHeight){play(g);io.unobserve(g);}});};
  addEventListener('scroll',atEnd,{passive:true});atEnd();
  document.addEventListener('portfolio:motion',()=>{if(reduced()){html.classList.remove('ux-motion');groups.forEach(g=>g.classList.add('is-on'));}});
})();

// Screen map: side switch and a full-size viewer for every captured screen.
(() => {
  const zh=()=>document.documentElement.lang.startsWith('zh');
  document.querySelectorAll('[data-smap]').forEach(map=>{
    const tabs=[...map.querySelectorAll('[data-smap-tab]')],sides=[...map.querySelectorAll('[data-smap-side]')];
    const show=id=>{tabs.forEach(b=>b.setAttribute('aria-selected',String(b.dataset.smapTab===id)));sides.forEach(s=>{s.hidden=s.dataset.smapSide!==id;});};
    tabs.forEach(b=>b.addEventListener('click',()=>show(b.dataset.smapTab)));
    tabs.forEach((b,i)=>b.addEventListener('keydown',e=>{if(e.key!=='ArrowRight'&&e.key!=='ArrowLeft')return;const n=tabs[(i+(e.key==='ArrowRight'?1:tabs.length-1))%tabs.length];n.focus();show(n.dataset.smapTab);}));
    if(tabs[0])show(tabs[0].dataset.smapTab);
  });
  const shots=[...document.querySelectorAll('[data-shot]')];
  if(!shots.length||typeof HTMLDialogElement==='undefined')return;
  const dialog=document.createElement('dialog');dialog.className='ux-viewer';
  dialog.innerHTML='<div class="ux-viewer-inner"><button type="button" data-prev>←</button><figure><img alt=""><figcaption></figcaption></figure><button type="button" data-next>→</button></div><button type="button" data-close>×</button>';
  document.body.append(dialog);
  const img=dialog.querySelector('img'),cap=dialog.querySelector('figcaption');
  let group=[],index=0,opener=null;
  const label=()=>{dialog.querySelector('[data-prev]').setAttribute('aria-label',zh()?'上一张':'Previous');dialog.querySelector('[data-next]').setAttribute('aria-label',zh()?'下一张':'Next');dialog.querySelector('[data-close]').setAttribute('aria-label',zh()?'关闭':'Close');};
  const render=()=>{const b=group[index],name=b.querySelector('strong')?.textContent||b.dataset.caption||'';img.src=zh()?b.dataset.shot.replace(/\/([^/]+)$/,'/zh/$1'):b.dataset.shot;img.alt=name;cap.innerHTML='';cap.append(name);const s=document.createElement('small');s.textContent=`${index+1} / ${group.length}`;cap.append(s);};
  const step=d=>{index=(index+d+group.length)%group.length;render();};
  shots.forEach(b=>b.addEventListener('click',()=>{const box=b.closest('.ux-smap-side,.ux-details')||document;group=[...box.querySelectorAll('[data-shot]')];index=group.indexOf(b);opener=b;label();render();dialog.showModal();}));
  dialog.querySelector('[data-prev]').addEventListener('click',()=>step(-1));
  dialog.querySelector('[data-next]').addEventListener('click',()=>step(1));
  dialog.querySelector('[data-close]').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',e=>{if(e.target===dialog||e.target.classList.contains('ux-viewer-inner'))dialog.close();});
  dialog.addEventListener('keydown',e=>{if(e.key==='ArrowRight')step(1);if(e.key==='ArrowLeft')step(-1);});
  dialog.addEventListener('close',()=>opener?.focus());
  let x0=null;dialog.addEventListener('touchstart',e=>{x0=e.touches[0].clientX;},{passive:true});
  dialog.addEventListener('touchend',e=>{if(x0===null)return;const dx=e.changedTouches[0].clientX-x0;if(Math.abs(dx)>40)step(dx<0?1:-1);x0=null;});
})();

// Case contents: keep the sticky index under the header and mark the section being read.
(() => {
  const index=document.querySelector('[data-case-index]');if(!index)return;
  const header=document.querySelector('.site-header');
  const setH=()=>document.documentElement.style.setProperty('--v3-header-h',(header?header.offsetHeight:0)+'px');
  setH();addEventListener('resize',setH,{passive:true});
  const links=[...index.querySelectorAll('a[href^="#"]:not(.ux-index-top):not(.ux-index-try)')];
  const sections=links.map(a=>document.getElementById(a.hash.slice(1))).filter(Boolean);
  let current=null;
  const mark=id=>{if(id===current)return;current=id;links.forEach(a=>{const on=a.hash.slice(1)===id;on?a.setAttribute('aria-current','location'):a.removeAttribute('aria-current');if(on){const l=a.offsetLeft-24,r=a.offsetLeft+a.offsetWidth+24;if(l<index.scrollLeft||r>index.scrollLeft+index.clientWidth)index.scrollTo({left:Math.max(0,l),behavior:'smooth'});}});};
  const pick=()=>{const line=innerHeight*.3;let id=null;for(const s of sections){if(s.getBoundingClientRect().top<=line)id=s.id;}mark(id);};
  addEventListener('scroll',()=>requestAnimationFrame(pick),{passive:true});pick();
})();

// Links with a Chinese twin (data-href-zh) follow the page language.
(() => {
  const apply=()=>{const zh=document.documentElement.lang.startsWith('zh');document.querySelectorAll('a[data-href-zh]').forEach(a=>{const en=a.dataset.hrefEn||(a.dataset.hrefEn=a.getAttribute('href'));a.setAttribute('href',zh?a.dataset.hrefZh:en);});};
  apply();document.addEventListener('portfolio:language',apply);
})();

// Product screenshots follow the page language: each image has a Chinese twin in a sibling zh/ folder.
(() => {
  const zhSrc=s=>s.replace(/\/([^/]+)$/,'/zh/$1');
  const apply=()=>{const zh=document.documentElement.lang.startsWith('zh');document.querySelectorAll('img[data-i18n-img]').forEach(img=>{const en=img.dataset.enSrc||(img.dataset.enSrc=img.getAttribute('src'));const want=zh?zhSrc(en):en;if(img.getAttribute('src')!==want)img.setAttribute('src',want);});};
  apply();document.addEventListener('portfolio:language',apply);
})();

// Arriving with #interactive-demo (from a homepage card): line the live prototype up under the header
// once images and the frame have settled, so the first thing on screen is something to try.
(() => {
  if (location.hash !== '#interactive-demo') return;
  const el = document.getElementById('interactive-demo'); if (!el) return;
  // Wide screens show the title and the prototype side by side, so the top of the page is the right place.
  const align = () => { if (matchMedia('(min-width: 761px)').matches) { scrollTo({ top: 0, behavior: 'auto' }); return; } const h = document.querySelector('.site-header')?.offsetHeight || 0; const y = el.getBoundingClientRect().top + scrollY - h - 16; scrollTo({ top: Math.max(0, y), behavior: 'auto' }); };
  addEventListener('load', () => { align(); setTimeout(align, 400); }, { once: true });
})();

// Motion layer: custom cursor, rolling nav labels and the homepage showcase.
(() => {
  const fine = matchMedia('(hover:hover) and (pointer:fine)');
  const calm = matchMedia('(prefers-reduced-motion: reduce)');
  const zh = () => document.documentElement.lang.startsWith('zh');

  // Opening on the homepage: the name rises, then fades into the page. Once per visit; any click or key skips it.
  if (document.body.classList.contains('v3-index') && location.pathname.replace(/\/index\.html$/, '/').endsWith('/') && !calm.matches) {
    // Play on every direct visit; skip when arriving from another page of this site.
    let internal = false; try { internal = !!document.referrer && new URL(document.referrer).origin === location.origin; } catch {}
    let off = false; try { off = sessionStorage.getItem('v3-intro-off') === '1'; } catch {}
    if (!internal && !off) {
      const intro = document.createElement('div'); intro.className = 'v3-intro'; intro.setAttribute('aria-hidden', 'true');
      intro.innerHTML = `<p class="v3-intro-name"><i><span>Yifan Zhu</span></i><small>${zh() ? '研究驱动的跨领域设计师' : 'Research-led Multidisciplinary Designer'}</small></p><button class="v3-intro-skip" type="button" tabindex="-1">${zh() ? '跳过' : 'Skip'}</button>`;
      document.body.append(intro);
      const done = skip => { if (intro.classList.contains('is-leaving')) return; if (skip) intro.classList.add('is-skipped'); intro.classList.add('is-leaving'); setTimeout(() => intro.remove(), skip ? 400 : 1400); };
      requestAnimationFrame(() => requestAnimationFrame(() => intro.classList.add('is-named')));
      const timer = setTimeout(() => done(false), 1700);
      const skip = () => { clearTimeout(timer); done(true); };
      intro.addEventListener('click', skip); addEventListener('keydown', skip, { once: true }); addEventListener('wheel', skip, { once: true, passive: true });
    }
  }

  // Page transitions: a coloured curtain rises over the page carrying the next title, then lifts on the new page.
  const curtain = (color, title) => { const c = document.createElement('div'); c.className = 'v3-curtain'; c.style.setProperty('--curtain', color); c.setAttribute('aria-hidden', 'true'); c.innerHTML = `<b><span></span></b>`; c.querySelector('span').textContent = title || ''; document.body.append(c); return c; };
  try {
    const came = JSON.parse(sessionStorage.getItem('v3-curtain') || 'null'); sessionStorage.removeItem('v3-curtain');
    if (came && Date.now() - came.t < 4000) {
      const c = curtain(came.color, came.title); c.classList.add('is-in'); c.style.transition = 'none';
      requestAnimationFrame(() => { document.documentElement.classList.remove('is-curtained'); requestAnimationFrame(() => { c.style.transition = ''; setTimeout(() => { c.classList.add('is-out'); setTimeout(() => c.remove(), 900); }, calm.matches ? 0 : 280); }); });
    } else document.documentElement.classList.remove('is-curtained');
  } catch { document.documentElement.classList.remove('is-curtained'); }
  if (!calm.matches) {
    document.addEventListener('click', e => {
      const a = e.target.closest?.('a[href]');
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (a.target && a.target !== '_self' || a.hasAttribute('download')) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.protocol.indexOf('http') !== 0) return;
      if (url.pathname === location.pathname && url.search === location.search) return;
      if (!/\.html$|\/$/.test(url.pathname)) return;
      e.preventDefault();
      const host = a.closest('[style*="--ink"],[style*="--project-ink"]');
      const ink = host ? (getComputedStyle(host).getPropertyValue('--ink') || getComputedStyle(host).getPropertyValue('--project-ink')).trim() : '';
      // The curtain carries the destination project's name when we know it, otherwise the link text.
      const named = [...document.querySelectorAll('.sc-list a, .v3-card h3 a, .project-nav a')].find(x => { try { return new URL(x.href).pathname === url.pathname; } catch { return false; } });
      const title = ((named && (named.querySelector('.sc-name') || named).textContent) || a.getAttribute('aria-label') || a.textContent || '').replace(/[↗→▶]/g, '').trim().slice(0, 60);
      const color = ink || '#0f1a14';
      try { sessionStorage.setItem('v3-curtain', JSON.stringify({ color, title, t: Date.now() })); } catch {}
      const c = curtain(color, title); c.getBoundingClientRect(); c.classList.add('is-in');
      c.addEventListener('transitionend', ev => { if (ev.target === c && ev.propertyName === 'transform') location.href = url.href; }, { once: true });
      setTimeout(() => { location.href = url.href; }, 900);
    });
    addEventListener('pageshow', e => { if (e.persisted) document.querySelectorAll('.v3-curtain').forEach(c => c.remove()); });
  }

  // Sections rise gently into view as you scroll (content already on screen is left alone).
  if (!calm.matches && 'IntersectionObserver' in window) {
    const blocks = [...document.querySelectorAll('main section:not(.sc):not(.v3-hero):not(.xp), main .case-section, main article > section')]
      .filter((el, i, all) => !all.some(o => o !== el && o.contains(el)) && el.getBoundingClientRect().top > innerHeight * 0.9);
    const io = new IntersectionObserver(entries => entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -8% 0px' });
    blocks.forEach(el => { el.classList.add('v3-rv'); io.observe(el); });
    addEventListener('beforeprint', () => blocks.forEach(el => el.classList.add('is-in')));
  }

  // Header links roll to a second copy of their label on hover.
  document.querySelectorAll('.v3-header nav > a').forEach(a => {
    const target = a.querySelector('.v3-contact-label') || (a.children.length ? null : a);
    if (!target || target.querySelector('.v3-roll')) return;
    const label = target.textContent.trim(); if (!label) return;
    target.textContent = '';
    const roll = document.createElement('span'); roll.className = 'v3-roll';
    for (const k of [0, 1]) { const s = document.createElement('span'); s.textContent = label; if (k) s.setAttribute('aria-hidden', 'true'); roll.append(s); }
    target.append(roll);
  });

  // A small dot that follows the pointer; it grows into a labelled disc over project visuals.
  if (fine.matches && !calm.matches) {
    const dot = document.createElement('div'); dot.className = 'v3-cursor'; dot.setAttribute('aria-hidden', 'true');
    const tag = document.createElement('span'); dot.append(tag); document.body.append(dot);
    document.documentElement.classList.add('has-v3-cursor');
    let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y, shown = false;
    const words = { view: ['View case', '查看案例'], try: ['Try it', '试一试'], play: ['Watch', '观看'], find: ['Click to find who', '点一下，找到谁能做'], scissors: ['Snip', '剪一下'], polish: ['New colour', '换个颜色'], comb: ['Comb it', '梳一梳'], dryer: ['Blow-dry', '吹一下'], lipstick: ['Draw a line', '画一笔'], snip: ['Poke me', '戳我一下'] };
    addEventListener('pointermove', e => {
      if (e.pointerType !== 'mouse') return;
      x = e.clientX; y = e.clientY;
      if (!shown) { cx = x; cy = y; shown = true; dot.classList.add('is-on'); }
      const hit = e.target.closest?.('[data-cursor]');
      const link = e.target.closest?.('a,button,[role="button"],summary,label,select');
      dot.classList.toggle('is-label', !!hit);
      dot.classList.toggle('is-link', !hit && !!link);
      if (hit) tag.textContent = (words[hit.dataset.cursor] || words.view)[zh() ? 1 : 0];
    }, { passive: true });
    // Content can move under a still pointer (scrolling the showcase), so re-check what it is over.
    let recheck = 0; addEventListener('scroll', () => { clearTimeout(recheck); recheck = setTimeout(() => { if (!shown) return; const el = document.elementFromPoint(x, y); const hit = el?.closest?.('[data-cursor]'); const link = el?.closest?.('a,button,[role="button"],summary,label,select');
      dot.classList.toggle('is-label', !!hit); dot.classList.toggle('is-link', !hit && !!link); if (hit) tag.textContent = (words[hit.dataset.cursor] || words.view)[zh() ? 1 : 0]; }, 90); }, { passive: true });
    document.addEventListener('pointerleave', () => { shown = false; dot.classList.remove('is-on'); });
    addEventListener('blur', () => { shown = false; dot.classList.remove('is-on'); });
    document.addEventListener('pointerdown', () => dot.classList.add('is-down'));
    document.addEventListener('pointerup', () => dot.classList.remove('is-down'));
    // Iframes swallow pointer events, so hide the dot while the pointer is over one.
    document.querySelectorAll('iframe').forEach(f => f.addEventListener('pointerenter', () => { shown = false; dot.classList.remove('is-on'); }));
    const tick = () => { cx += (x - cx) * 0.22; cy += (y - cy) * 0.22; dot.style.transform = `translate3d(${cx}px,${cy}px,0)`; requestAnimationFrame(tick); };
    requestAnimationFrame(tick);
  }

  // Homepage showcase: the section is tall; a sticky stage swaps projects as you scroll through it.
  const sc = document.querySelector('[data-showcase]');
  if (!sc) return;
  const track = sc.querySelector('.sc-track'), scenes = [...sc.querySelectorAll('[data-sc-scene]')], links = [...sc.querySelectorAll('[data-sc-go]')];
  const captions = [...sc.querySelectorAll('[data-sc-caption]')];
  const counter = sc.querySelector('[data-sc-current]'), bar = sc.querySelector('.sc-progress span');
  const wide = matchMedia('(min-width: 640px)');
  let active = -1;
  // Particle dissolve: the outgoing picture is wiped away left to right, and the wiped edge breaks into fine dust that drifts off.
  const dust = sc.querySelector('.sc-dust'), stageEl = sc.querySelector('.sc-stage');
  let dustRun = 0, dusting = null;
  const dissolve = scene => {
    if (!dust || calm.matches || !wide.matches || !scene) return;
    if (dusting) { dusting.classList.remove('is-dusting'); dusting.style.removeProperty('--wipe'); }
    const W = stageEl.clientWidth, H = stageEl.clientHeight, sr = stageEl.getBoundingClientRect();
    dust.width = W; dust.height = H;
    const off = document.createElement('canvas'); off.width = W; off.height = H; const o = off.getContext('2d');
    scene.querySelectorAll('img, video').forEach(m => {
      const r = m.getBoundingClientRect(); if (!r.width || !r.height) return;
      const iw = m.naturalWidth || m.videoWidth, ih = m.naturalHeight || m.videoHeight; if (!iw || !ih) return;
      const fit = getComputedStyle(m).objectFit; let sx = 0, sy = 0, sw = iw, sh = ih;
      if (fit === 'cover') { const k = Math.max(r.width / iw, r.height / ih); sw = r.width / k; sh = r.height / k; sx = (iw - sw) / 2; sy = (ih - sh) / 2; }
      try { o.drawImage(m, sx, sy, sw, sh, r.left - sr.left, r.top - sr.top, r.width, r.height); } catch {}
    });
    let data; try { data = o.getImageData(0, 0, W, H).data; } catch { return; }
    const step = 3, keep = Math.min(.6, 22000 / (W * H / (step * step))), parts = [], sweep = 1.05;
    for (let y = 0; y < H; y += step) for (let x = 0; x < W; x += step) {
      const k = (y * W + x) * 4; if (data[k + 3] < 40 || Math.random() > keep) continue;
      parts.push({ x, y, c: `rgb(${data[k]},${data[k + 1]},${data[k + 2]})`, d: x / W * sweep + (Math.random() - .5) * .06, vx: 60 + Math.random() * 160, vy: -(30 + Math.random() * 120), w: Math.random() * 6.28, s: 1.1 + Math.random() * 1.9 });
    }
    const ctx = dust.getContext("2d"), run = ++dustRun, t0 = performance.now(), life = 1.25;
    dusting = scene; scene.classList.add('is-dusting');
    const frame = now => {
      if (run !== dustRun) return;
      const t = (now - t0) / 1000; ctx.clearRect(0, 0, W, H); let alive = false;
      scene.style.setProperty('--wipe', Math.min(1.2, t / sweep).toFixed(3));
      for (const p of parts) {
        const k = (t - p.d) / life;
        if (k >= 1) continue; alive = true; if (k <= 0) continue;
        const e = k * k;
        const x = p.x + p.vx * e * 1.6 + Math.sin(p.w + k * 7) * 12 * k, y = p.y + p.vy * e * 1.6 + Math.cos(p.w + k * 6) * 9 * k;
        ctx.globalAlpha = (1 - k) * (1 - k) * .95; ctx.fillStyle = p.c; ctx.fillRect(x, y, p.s, p.s);
      }
      ctx.globalAlpha = 1;
      if (alive || t < sweep + .1) requestAnimationFrame(frame);
      else { ctx.clearRect(0, 0, W, H); scene.classList.remove('is-dusting'); scene.style.removeProperty('--wipe'); dusting = null; }
    };
    requestAnimationFrame(frame);
  };
  const setActive = i => {
    if (i === active) return;
    if (active >= 0) { const old = scenes[active]; sc.dataset.dir = i > active ? 'fwd' : 'back'; scenes.forEach(x => x.classList.remove('is-leaving')); old.classList.add('is-leaving'); clearTimeout(old._lv); old._lv = setTimeout(() => old.classList.remove('is-leaving'), 1100); sc.classList.add('is-ready'); }
    active = i;
    scenes.forEach((s, k) => { s.classList.toggle('is-active', k === i); s.classList.toggle('is-before', k < i); });
    captions.forEach((c, k) => c.classList.toggle('is-active', k === i));
    links.forEach((a, k) => { if (k === i) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current'); });
    counter.textContent = String(i + 1).padStart(2, '0');
    const cs = scenes[i].style; sc.style.setProperty('--tone', cs.getPropertyValue('--tone')); sc.style.setProperty('--ink', cs.getPropertyValue('--ink'));
    scenes.forEach((s, k) => { const v = s.querySelector('video[data-sc-video]'); if (!v) return;
      if (k === i && !calm.matches) { if (!v.src) v.src = v.dataset.src; v.play().catch(() => {}); } else v.pause(); });
  };
  const span = () => track.offsetHeight - innerHeight;
  const update = () => {
    const box = track.getBoundingClientRect();
    document.documentElement.classList.toggle('is-over-sc', wide.matches && box.bottom > 90);
    if (!wide.matches) return;
    const top = box.top, p = Math.min(1, Math.max(0, -top / Math.max(1, span())));
    const n = scenes.length, f = p * n, i = Math.min(n - 1, Math.floor(f));
    setActive(i);
    sc.style.setProperty('--local', (Math.min(1, f - i)).toFixed(3));
    if (bar) bar.style.transform = `scaleY(${p.toFixed(4)})`;
  };
  let queued = false;
  const onScroll = () => { if (queued) return; queued = true; requestAnimationFrame(() => { queued = false; update(); }); };
  addEventListener('scroll', onScroll, { passive: true }); addEventListener('resize', onScroll); wide.addEventListener?.('change', onScroll);
  links.forEach((a, k) => a.addEventListener('click', e => {
    if (!wide.matches) return;
    e.preventDefault();
    const y = scrollY + track.getBoundingClientRect().top + span() * (k + 0.5) / scenes.length;
    scrollTo({ top: y, behavior: calm.matches ? 'auto' : 'smooth' });
  }));
  // Gentle tilt and depth that follow the pointer over the stage.
  if (fine.matches && !calm.matches) {
    const stage = sc.querySelector('.sc-stage');
    stage.addEventListener('pointermove', e => { const r = stage.getBoundingClientRect(); sc.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 2 - 1).toFixed(3)); sc.style.setProperty('--my', ((e.clientY - r.top) / r.height * 2 - 1).toFixed(3)); });
    stage.addEventListener('pointerleave', () => { sc.style.setProperty('--mx', 0); sc.style.setProperty('--my', 0); });
  }
  setActive(0); update();
  // Phones in the showcase play their real flow while their project is on screen.
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  sc.querySelectorAll('[data-play]').forEach(pl => {
    const shots = [...pl.querySelectorAll('.ply-s')], ring = pl.querySelector('.ply-tap'), fade = pl.classList.contains('ply--fade'), host = pl.closest('.sc-scene');
    let k = 0;
    const live = () => host.classList.contains('is-active') && !document.hidden && !calm.matches;
    const tap = async (x, y) => { ring.style.setProperty('--tx', x + '%'); ring.style.setProperty('--ty', y + '%'); ring.classList.remove('is-tap'); void ring.offsetWidth; ring.classList.add('is-tap'); await sleep(650); };
    (async function loop() {
      for (;;) {
        await sleep(fade ? 3400 : 1300);
        if (!live()) { await sleep(400); continue; }
        const taps = (shots[k].dataset.taps || '').split(';').filter(Boolean);
        for (const t of taps) { const [x, y] = t.split(',').map(Number); await tap(x, y); if (!live()) break; }
        if (!live()) continue;
        if (!taps.length && !fade) await sleep(1300);
        const next = (k + 1) % shots.length, back = next === 0;
        shots.forEach(s => s.classList.remove('is-out'));
        if (!fade && !back) shots[k].classList.add('is-out');
        if (!fade && back) { shots.forEach(s => { s.style.transition = 'none'; }); }
        shots[k].classList.remove('is-on'); shots[next].classList.add('is-on');
        if (!fade && back) { void pl.offsetWidth; shots.forEach(s => { s.style.transition = ''; }); }
        k = next;
      }
    })();
  });
})();

// Exploded UI view: opens once when it comes into view. Hover (or focus) a line or a layer to light it; the phone follows the pointer.
(() => {
  const xp = document.querySelector('[data-explode]'); if (!xp) return;
  const items = [...xp.querySelectorAll('[data-xp-item]')], layers = [...xp.querySelectorAll('[data-xp-layer]')], scene = xp.querySelector('.xp-scene');
  // camera poses: each layer gets its own angle and framing, like a product film cutting between shots
  const phoneEl = xp.querySelector('.xp-phone');
  const poses = [
    { cx: '-6%', cy: '14%', crx: '48deg', crz: '-22deg', cry: '0deg', cs: 1.18 },
    { cx: '-14%', cy: '10%', crx: '58deg', crz: '-40deg', cry: '-6deg', cs: 1.14 },
    { cx: '10%', cy: '4%', crx: '42deg', crz: '-16deg', cry: '8deg', cs: 1.1 },
    { cx: '-4%', cy: '-6%', crx: '56deg', crz: '-48deg', cry: '0deg', cs: 1.08 },
    { cx: '6%', cy: '-14%', crx: '38deg', crz: '-28deg', cry: '-8deg', cs: 1.16 }
  ];
  const rest = { cx: '0%', cy: '2%', crx: '54deg', crz: '-34deg', cry: '0deg', cs: 1.06 };
  const pose = p => Object.entries(p).forEach(([k, v]) => phoneEl.style.setProperty('--' + k, v));
  const focus = i => { xp.classList.toggle('has-focus', i >= 0); items.forEach((li, k) => li.classList.toggle('is-on', k === i)); layers.forEach((l, k) => l.classList.toggle('is-on', k === i)); pose(i >= 0 && matchMedia('(min-width: 761px)').matches ? poses[i % poses.length] : rest); };
  items.forEach((li, k) => { li.addEventListener('pointerenter', () => focus(k)); li.addEventListener('focus', () => focus(k)); li.addEventListener('click', () => focus(k)); });
  layers.forEach((l, k) => l.addEventListener('pointerenter', () => focus(k)));
  xp.querySelector('.xp-list').addEventListener('pointerleave', () => focus(-1));
  scene.addEventListener('pointerleave', () => { focus(-1); xp.style.setProperty('--rx', 0); xp.style.setProperty('--ry', 0); });
  if (matchMedia('(hover:hover) and (pointer:fine)').matches) scene.addEventListener('pointermove', e => { const r = scene.getBoundingClientRect(); xp.style.setProperty('--rx', ((e.clientX - r.left) / r.width * 2 - 1).toFixed(3)); xp.style.setProperty('--ry', ((e.clientY - r.top) / r.height * 2 - 1).toFixed(3)); });
  if (!('IntersectionObserver' in window)) { xp.classList.add('is-open'); return; }
  const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { xp.classList.add('is-open'); io.disconnect(); } }), { threshold: .35 });
  io.observe(xp); addEventListener('beforeprint', () => xp.classList.add('is-open'));
})();

// Case opening: the wall of screens follows the pointer slightly.
(() => {
  const op = document.querySelector('[data-opening]'); if (!op || matchMedia('(prefers-reduced-motion: reduce)').matches || !matchMedia('(hover:hover) and (pointer:fine)').matches) return;
  const sy = () => op.style.setProperty('--sy', Math.max(0, -op.getBoundingClientRect().top).toFixed(1)); addEventListener('scroll', sy, { passive: true }); sy();
  op.addEventListener('pointermove', e => { const r = op.getBoundingClientRect(); op.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 2 - 1).toFixed(3)); op.style.setProperty('--my', ((e.clientY - r.top) / r.height * 2 - 1).toFixed(3)); });
})();

// Story: the step in the middle of the screen (or under the pointer) shows its screen on the phone,
// spotlights and zooms into the exact part the text talks about, and taps where the user would tap. Switching side flips the phone.
(() => {
  const st = document.querySelector('[data-story]'); if (!st) return;
  const steps = [...st.querySelectorAll('[data-st-step]')], roles = [...st.querySelectorAll('[data-st-role]')];
  const wrap = st.querySelector('.st-phone2'); if (!wrap) return;
  const shots = [...wrap.querySelectorAll('[data-st-shot]')], zoom = wrap.querySelector('.st-zoom'), ring = wrap.querySelector('.st-tap'), label = wrap.querySelector('[data-st-label]'), callout = wrap.querySelector('.st-callout'), dev = wrap.querySelector('.dev');
  let cur = -1, side = null, tm = [];
  const later = (f, ms) => tm.push(setTimeout(f, ms));
  const show = i => {
    if (i === cur) return; cur = i; tm.forEach(clearTimeout); tm = [];
    const step = steps[i], flip = side && side !== step.dataset.side; side = step.dataset.side;
    steps.forEach((s, k) => s.classList.toggle('is-on', k === i));
    roles.forEach(r => r.classList.toggle('is-on', r.dataset.stRole === side));
    const apply = () => {
      shots.forEach((s, k) => s.classList.toggle('is-on', k === i));
      const sp = (step.dataset.spot || '').split(',').map(Number);
      if (sp.length === 4) {
        const [x, y, w, h] = sp, cx = x + w / 2, cy = y + h / 2, z = Math.min(1.35, Math.max(1, 70 / h));
        zoom.style.setProperty('--sx', x + '%'); zoom.style.setProperty('--sy', y + '%'); zoom.style.setProperty('--sw', w + '%'); zoom.style.setProperty('--sh', h + '%');
        zoom.style.setProperty('--ox', cx + '%'); zoom.style.setProperty('--oy', cy + '%'); zoom.style.setProperty('--z', '1');
        wrap.classList.add('has-spot');
        later(() => zoom.style.setProperty('--z', z.toFixed(2)), 500);
        const vr = wrap.querySelector('.dev-view').getBoundingClientRect(), wr = wrap.getBoundingClientRect();
        callout.style.setProperty('--cy', (vr.top - wr.top + vr.height * cy / 100) + 'px');
        callout.style.left = (vr.right - wr.left + 18) + 'px';
        label.textContent = step.querySelector('.st-label')?.textContent || '';
      } else { wrap.classList.remove('has-spot'); zoom.style.setProperty('--z', '1'); }
      if (step.dataset.tap) later(() => { const [tx, ty] = step.dataset.tap.split(',').map(Number); ring.style.setProperty('--tx', tx + '%'); ring.style.setProperty('--ty', ty + '%'); ring.classList.remove('is-tap'); void ring.offsetWidth; ring.classList.add('is-tap'); }, 1300);
    };
    if (flip) { wrap.classList.remove('is-flip'); void wrap.offsetWidth; wrap.classList.add('is-flip'); wrap.classList.remove('has-spot'); zoom.style.setProperty('--z', '1'); later(apply, 450); later(() => wrap.classList.remove('is-flip'), 950); }
    else apply();
  };
  steps.forEach((s, k) => { s.addEventListener('pointerenter', () => show(k)); s.addEventListener('focus', () => show(k)); });
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) show(+en.target.dataset.stStep); }), { rootMargin: '-45% 0px -45% 0px' });
    steps.forEach(s => io.observe(s));
  }
  addEventListener('resize', () => { const k = cur; cur = -1; if (k >= 0) show(k); });
  document.addEventListener('portfolio:language', () => { const k = cur; cur = -1; if (k >= 0) show(k); });
  show(0);
})();

// Motion engine: inertial smooth scrolling (desktop), scroll-scrubbed elements, headings that rise from a mask, and the 3D phone.
(() => {
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches, fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
  // 1) Smooth, weighted scrolling for wheel/trackpad. Keyboard, scrollbar and links keep working; scrollable boxes and iframes scroll natively.
  if (fine && !calm) {
    const root = document.documentElement; root.classList.add('has-smooth');
    let target = scrollY, current = scrollY, running = false, ours = false;
    const max = () => root.scrollHeight - innerHeight;
    const scrollable = el => { for (; el && el !== document.body; el = el.parentElement) { if (el.closest?.('[data-lenis-prevent]')) return true; const cs = getComputedStyle(el); if (/(auto|scroll)/.test(cs.overflowY) && el.scrollHeight > el.clientHeight + 2) return true; } return false; };
    const loop = () => {
      const d = target - current;
      if (Math.abs(d) < .4) { current = target; running = false; ours = true; scrollTo(0, current); return; }
      current += d * .11; ours = true; scrollTo(0, current); requestAnimationFrame(loop);
    };
    addEventListener('wheel', e => {
      if (e.ctrlKey || e.defaultPrevented || scrollable(e.target)) return;
      const dy = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaMode === 2 ? e.deltaY * innerHeight : e.deltaY;
      if (!running) { target = current = scrollY; }
      target = Math.max(0, Math.min(max(), target + dy));
      e.preventDefault();
      if (!running) { running = true; requestAnimationFrame(loop); }
    }, { passive: false });
    addEventListener('scroll', () => { if (ours) { ours = false; return; } if (!running) { target = current = scrollY; } else if (Math.abs(scrollY - current) > 3) { target = current = scrollY; running = false; } }, { passive: true });
  }
  // 2) Scroll scrub: [data-scrub] gets --p from 0 (just entering at the bottom) to 1 (just leaving at the top).
  const scrubs = [...document.querySelectorAll('[data-scrub]')];
  if (scrubs.length && !calm) {
    let q = false;
    const run = () => { q = false; const vh = innerHeight; scrubs.forEach(el => { const r = el.getBoundingClientRect(); if (r.bottom < -vh || r.top > vh * 2) return; el.style.setProperty('--p', Math.min(1, Math.max(0, (vh - r.top) / (vh + r.height))).toFixed(4)); }); };
    addEventListener('scroll', () => { if (!q) { q = true; requestAnimationFrame(run); } }, { passive: true }); addEventListener('resize', run); run();
  }
  // 3) Section headings on case pages rise from a mask the first time they appear.
  if (!calm && 'IntersectionObserver' in window) {
    const heads = [...document.querySelectorAll('main :is(.ux-section > h2, .case-section h2, .xp-copy h2, .st-head h2, .v3-product-section > h2)')].filter(h => !h.querySelector('.v3-mask') && h.getBoundingClientRect().top > innerHeight * .8);
    heads.forEach(h => { const m = document.createElement('span'), i = document.createElement('span'); m.className = 'v3-mask'; i.className = 'v3-mask-in'; while (h.firstChild) i.append(h.firstChild); m.append(i); h.append(m); });
    const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.querySelector('.v3-mask')?.classList.add('is-in'); io.unobserve(en.target); } }), { rootMargin: '0px 0px -12% 0px' });
    heads.forEach(h => io.observe(h));
    addEventListener('beforeprint', () => heads.forEach(h => h.querySelector('.v3-mask')?.classList.add('is-in')));
  }
  // 4) The 3D phone loads only on pages that have one, and only where WebGL works.
  if (document.querySelector('[data-phone3d]')) {
    const ok = (() => { try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; } })();
    if (ok) import('./phone3d.mjs').then(m => m.mountAll()).catch(() => {});
  }
})();

// Doughnut: a small companion (after the Boy with doughnut handle) that trails the cursor and comments on what you point at.
(() => {
  // Lives only where a page gives it a home (see About); never as a site-wide sticker.
  if (!document.querySelector('[data-buddy-home]')) return;
  if (!matchMedia('(hover:hover) and (pointer:fine)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const zh = () => document.documentElement.lang.startsWith('zh');
  const b = document.createElement('div'); b.className = 'v3-buddy'; b.setAttribute('aria-hidden', 'true');
  b.innerHTML = `<svg viewBox="0 0 60 60"><defs><radialGradient id="dn" cx="40%" cy="35%"><stop offset="0" stop-color="#f3c58a"/><stop offset="1" stop-color="#c98a4b"/></radialGradient></defs>
    <circle cx="30" cy="31" r="25" fill="url(#dn)"/><path d="M8 27c3-12 15-19 27-17 9 2 16 8 18 17 1 5-3 6-5 3-2-3-5 1-8-1-3-2-6 3-9 0-3-3-6 2-9-1-3-2-5 3-8 1-3-1-7 3-6-2z" fill="#f59ab8"/>
    <circle cx="30" cy="30" r="7" fill="#141518" opacity=".9"/><g fill="#fff"><rect x="16" y="17" width="5" height="1.8" rx=".9" transform="rotate(-30 18 18)"/><rect x="40" y="16" width="5" height="1.8" rx=".9" transform="rotate(25 42 17)"/><rect x="25" y="13" width="5" height="1.8" rx=".9"/></g>
    <g class="eyes"><circle cx="22" cy="42" r="4.2" fill="#fff"/><circle cx="38" cy="42" r="4.2" fill="#fff"/><circle class="pupil" cx="22" cy="42" r="2" fill="#141518"/><circle class="pupil" cx="38" cy="42" r="2" fill="#141518"/></g>
    <path d="M26 49q4 3 8 0" stroke="#7a4a22" stroke-width="1.6" fill="none" stroke-linecap="round"/></svg><span class="v3-buddy-say"></span>`;
  document.body.append(b);
  const say = b.querySelector('.v3-buddy-say'), pupils = [...b.querySelectorAll('.pupil')];
  const lines = [
    ['[data-phone3d]', 'Grab it, it turns!', '抓住它，可以转！'],
    ['.ux-live a', 'This one is live. Real customers!', '这个真的上线了，有真实顾客！'],
    ['[data-st-step]', 'Watch the phone on the right', '看右边那部手机'],
    ['[data-xp-item], .xp-layer', 'Each layer answers one question', '每一层回答一个问题'],
    ['.sc-visual, .v3-card .v3-media', 'Click to step inside', '点进去看看'],
    ['a[href^="mailto:"]', 'Say hi to Yifan!', '跟异凡打个招呼！'],
    ['iframe', '', '']
  ];
  const idle = [['Hi, I am Doughnut. I will tag along.', '嗨，我是甜甜圈，我陪你逛。'], ['Psst, the phones are real screens.', '悄悄说：手机里都是真实界面。'], ['Scroll slowly, things move.', '慢慢滚，东西会动。']];
  let x = innerWidth / 2, y = innerHeight / 2, cx = x, cy = y, last = '', quiet = 0, shown = false, talkT = 0, idleK = 0;
  const talk = text => { if (!text) { b.classList.remove('is-talking'); last = ''; return; } if (text !== last) { say.textContent = text; last = text; } b.classList.add('is-talking'); clearTimeout(talkT); talkT = setTimeout(() => { b.classList.remove('is-talking'); last = ''; }, 2600); };
  addEventListener('pointermove', e => {
    if (e.pointerType !== 'mouse') return; x = e.clientX; y = e.clientY; quiet = 0;
    if (!shown) { shown = true; cx = x; cy = y; b.classList.add('is-on'); }
    const hit = lines.find(([sel]) => e.target.closest?.(sel));
    if (hit && hit[0] === 'iframe') { b.classList.remove('is-on'); shown = false; return; }
    if (hit) talk(zh() ? hit[2] : hit[1]);
  }, { passive: true });
  document.addEventListener('pointerleave', () => { b.classList.remove('is-on'); shown = false; });
  document.addEventListener('pointerdown', () => { b.classList.remove('is-happy'); void b.offsetWidth; b.classList.add('is-happy'); });
  setInterval(() => { if (!shown) return; quiet++; if (quiet === 5) { const l = idle[idleK++ % idle.length]; talk(zh() ? l[1] : l[0]); } }, 1000);
  const tick = () => {
    const tx = x + 26, ty = y + 22; cx += (tx - cx) * .08; cy += (ty - cy) * .08;
    const left = cx > innerWidth - 260; b.classList.toggle('is-left', left);
    b.style.transform = `translate3d(${(left ? cx - 90 : cx).toFixed(1)}px,${cy.toFixed(1)}px,0)`;
    const dx = Math.max(-1.6, Math.min(1.6, (x - cx) / 40)), dy = Math.max(-1.4, Math.min(1.4, (y - cy) / 40));
    pupils.forEach(p => p.setAttribute('transform', `translate(${dx.toFixed(2)} ${dy.toFixed(2)})`));
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
})();

// LOOK film: one pinned stage made of discrete moments. One wheel tick (or swipe, or key) moves to the next moment, and that
// moment plays as a complete animation; nothing stops half-way. Scrolling by other means lands on the nearest moment.
(() => {
  const fm = document.querySelector('[data-film]'); if (!fm) return;
  const calm = matchMedia('(prefers-reduced-motion: reduce)'), wide = matchMedia('(min-width: 761px)');
  const n = +fm.dataset.steps, n1 = +fm.dataset.split || n, OPEN = 1.6, DUO = 1.6, END = 1, U = OPEN + n + DUO + END;
  const track = fm.querySelector('.fm-track'), stage = fm.querySelector('.fm-stage'), phone = fm.querySelector('.fm-phone');
  const shots = [...fm.querySelectorAll('[data-fm-shot]')], steps = [...fm.querySelectorAll('[data-fm-step]')], dots = [...fm.querySelectorAll('[data-fm-dot]')];
  const data = [...fm.querySelectorAll('.fm-data')], label = fm.querySelector('[data-fm-label]'), callout = fm.querySelector('.fm-callout'), view = fm.querySelector('.dev-view');
  const set = (el, k, v) => el.style.setProperty(k, v);
  track.style.setProperty('--units', U);
  // moments: opening, then every layer of every user screen, the switch, then every layer of every Creator screen
  const parts = data.map(d => (d.dataset.parts || '0,100').split(';').map(q => q.split(',').map(Number)));
  const labels = data.map(d => [...d.querySelectorAll('.fm-label')].map(x => x.textContent));
  const moms = [{ t: 'open' }];
  for (let i = 0; i < n1; i++) parts[i].forEach((_, j) => moms.push({ t: 'step', i, j }));
  moms.push({ t: 'duo' });
  for (let i = n1; i < n; i++) parts[i].forEach((_, j) => moms.push({ t: 'step', i, j }));
  const M = moms.length, U2 = M + .6; track.style.setProperty('--units', U2);
  const unitOf = m => m + .3;
  const yOf = m => { const r = track.getBoundingClientRect(); return scrollY + r.top + unitOf(m) / U2 * (track.offsetHeight - innerHeight); };
  const lys = [...fm.querySelectorAll('[data-ly]')];
  const wheel = [...fm.querySelectorAll('[data-wh]')];
  const slots = [...fm.querySelectorAll('[data-slot]')];
  let cur = -1, curStep = -2, liftT = 0;
  const layout = (i, j, wait) => {
    clearTimeout(liftT);
    const go = () => {
      const src = `url("${shots[i].currentSrc || shots[i].src}")`, ps = parts[i];
      lys.forEach((ly, k) => {
        const q = ps[k]; if (!q) { slots[k]?.classList.remove('is-on'); ly.classList.remove('is-on'); ly.style.setProperty('--z', 0); return; }
        const [y, h] = q, d = Math.abs(k - j), z = d === 0 ? 90 : d === 1 ? 34 : 8;
        for (const [kk, v] of [['--sl', '2%'], ['--st', y + '%'], ['--sw', '96%'], ['--sh', h + '%'], ['--lbs', `${(1e4 / 96).toFixed(3)}% ${(1e4 / h).toFixed(3)}%`], ['--lbp', `50% ${h >= 100 ? 0 : (y / (100 - h) * 100).toFixed(3)}%`], ['--limg', src], ['--z', z], ['--lit', d === 0 ? 1 : d === 1 ? .72 : .5]]) set(ly, kk, v);
        ly.classList.add('is-on'); ly.classList.toggle('is-focus', d === 0);
        const sl = slots[k]; if (sl) { set(sl, '--y', y + '%'); set(sl, '--h', h + '%'); sl.classList.add('is-on'); }
      });
      const [y, h] = ps[j]; label.textContent = labels[i][j] || '';
      set(callout, '--cy', (view.offsetTop + view.offsetHeight * (y + h / 2) / 100).toFixed(1) + 'px');
      fm.classList.add('is-lifted');
    };
    if (wait) liftT = setTimeout(go, wait); else go();
  };
  const show = m => {
    if (m === cur) return; const prevM = cur; cur = m; const mo = moms[m], i = mo.t === 'step' ? mo.i : -1;
    const di = moms.findIndex(x => x.t === 'duo');
    fm.classList.toggle('is-story', m >= 1);
    fm.classList.toggle('is-duo', mo.t === 'duo');
    fm.classList.toggle('is-after-duo', m > di);
    fm.classList.toggle('is-cfirst', i === n1);
    wheel.forEach((w, k) => { const o = i < 0 ? 99 : k - i; w.style.setProperty('--o', Math.max(-2, Math.min(2, o))); w.classList.toggle('is-near', Math.abs(o) === 1); w.classList.toggle('is-cur', o === 0); });
    if (i !== curStep) {
      curStep = i;
      steps.forEach((st, k) => { st.classList.toggle('is-on', k === i); st.classList.toggle('is-past', i >= 0 ? k < i : (m > di ? true : mo.t === 'duo' ? k < n1 : false)); });
      const showIdx = mo.t === 'open' || mo.t === 'duo' ? 0 : i;
      shots.forEach((im, k) => { im.classList.toggle('is-on', k === showIdx); im.classList.toggle('is-past', false); });
      dots.forEach((d, k) => d.classList.toggle('is-done', i >= 0 ? k <= i : mo.t === 'duo' ? k < n1 : false));
      fm.classList.remove('is-lifted'); lys.forEach(l => l.classList.remove('is-on', 'is-focus')); slots.forEach(l => l.classList.remove('is-on'));
      if (i >= 0) layout(i, mo.j, prevM <= 0 ? 1300 : 600);
      else clearTimeout(liftT);
    } else if (i >= 0) layout(i, mo.j, 0);
  };
  const nearest = () => { const r = track.getBoundingClientRect(), u = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - innerHeight))) * U2; let best = 0, bd = 1e9; for (let m = 0; m < M; m++) { const d = Math.abs(unitOf(m) - u); if (d < bd) { bd = d; best = m; } } return best; };
  // smooth jump between moments
  let jumping = 0, lockUntil = 0;
  const glideTo = (y, ms = 900) => { const y0 = scrollY, t0 = performance.now(), e = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; cancelAnimationFrame(jumping); const go = now => { const t = Math.min(1, (now - t0) / ms); scrollTo(0, y0 + (y - y0) * e(t)); if (t < 1) jumping = requestAnimationFrame(go); else jumping = 0; }; jumping = requestAnimationFrame(go); };
  const inside = () => { const r = track.getBoundingClientRect(); return r.top <= 2 && r.bottom >= innerHeight - 2; };
  const move = dir => {
    const now = performance.now(); if (now < lockUntil) return true;
    const m = cur < 0 ? nearest() : cur, to = m + dir;
    if (to < 0 || to >= M) return false; // leave the film normally at either end
    const same = moms[to].t === 'step' && moms[cur]?.t === 'step' && moms[to].i === moms[cur].i; lockUntil = now + (same ? 520 : 950); show(to); glideTo(yOf(to), same ? 520 : 900); return true;
  };
  let acc = 0, accT = 0;
  addEventListener('wheel', e => {
    if (!wide.matches || calm.matches || !inside()) return;
    const now = performance.now(); if (now - accT > 220) acc = 0; accT = now; acc += e.deltaY;
    if (Math.abs(acc) < 18 && now >= lockUntil) { e.preventDefault(); e.stopImmediatePropagation(); return; }
    const dir = acc > 0 ? 1 : -1;
    if (now < lockUntil || move(dir)) { e.preventDefault(); e.stopImmediatePropagation(); acc = 0; }
  }, { passive: false, capture: true });
  // the wheel: click the previous or next title to go there
  wheel.forEach((w, k) => w.addEventListener('click', () => { const to = moms.findIndex(x => x.t === 'step' && x.i === k); if (to < 0) return; lockUntil = performance.now() + 950; show(to); glideTo(yOf(to)); }));
  addEventListener('keydown', e => {
    if (!wide.matches || !inside() || e.target.closest?.('input,textarea,select')) return;
    const dir = ['ArrowDown', 'PageDown', ' '].includes(e.key) ? 1 : ['ArrowUp', 'PageUp'].includes(e.key) ? -1 : 0;
    if (dir && move(dir)) e.preventDefault();
  });
  // any other way of scrolling (scrollbar, touchpad momentum after leaving, links) lands on the nearest moment
  let st = 0; addEventListener('scroll', () => { if (!wide.matches || jumping) return; clearTimeout(st); st = setTimeout(() => { if (inside()) show(nearest()); else { const r = track.getBoundingClientRect(); show(r.top > 0 ? 0 : M - 1); } }, 60); }, { passive: true });
  document.addEventListener('portfolio:language', () => { const m = cur; cur = -1; curStep = -2; show(m < 0 ? 0 : m); });
  show(nearest());
  // the phone leans toward the pointer anywhere on the stage
  if (matchMedia('(hover:hover) and (pointer:fine)').matches && !calm.matches) {
    const card0 = fm.querySelector('.fm-lift-img');
    stage.addEventListener('pointermove', e => { const r = stage.getBoundingClientRect(); set(phone, '--mrx', ((e.clientX - r.left) / r.width * 2 - 1).toFixed(3)); set(phone, '--mry', ((e.clientY - r.top) / r.height * 2 - 1).toFixed(3));
      if (fm.classList.contains('is-lifted')) { const card = fm.querySelector('.fm-ly.is-focus') || card0; const c = card.getBoundingClientRect(); set(card, '--gx', ((e.clientX - c.left) / c.width * 100).toFixed(1) + '%'); set(card, '--gy', ((e.clientY - c.top) / c.height * 100).toFixed(1) + '%'); } });
    stage.addEventListener('pointerleave', () => { set(phone, '--mrx', 0); set(phone, '--mry', 0); });
  }
  // pointer depth for the floating work
  if (matchMedia('(hover:hover) and (pointer:fine)').matches && !calm.matches) {
    stage.addEventListener('pointermove', e => { const r = stage.getBoundingClientRect(); const mx = (e.clientX - r.left) / r.width * 2 - 1, my = (e.clientY - r.top) / r.height * 2 - 1; set(fm, '--mx', mx.toFixed(3)); set(fm, '--my', my.toFixed(3)); set(stage, '--px', mx.toFixed(3)); });
    fm.querySelectorAll('.fm-photo').forEach(ph => { ph.addEventListener('pointermove', e => { const r = ph.getBoundingClientRect(); set(ph, '--ptilt', (((e.clientX - r.left) / r.width - .5) * 14).toFixed(1) + 'deg'); }); ph.addEventListener('pointerleave', () => set(ph, '--ptilt', '0deg')); });
  }
  // "Which look?": click the picture, it flies away and the headline rolls to who can make it.
  const find = fm.querySelector('[data-find]');
  if (find) {
    const stack = find.querySelector('.fm-stack'), imgs = [...stack.querySelectorAll('img')], ans = [...find.querySelectorAll('[data-ans]')];
    const split = el => { const txt = el.textContent; el.textContent = ''; [...txt].forEach((ch, k) => { const i = document.createElement('i'); i.textContent = ch === ' ' ? ' ' : ch; i.style.setProperty('--c', k); el.append(i); }); };
    const prep = () => ans.forEach(a => a.querySelectorAll('.fm-roll').forEach(split));
    prep(); document.addEventListener('portfolio:language', () => setTimeout(prep, 0));
    // Rapid clicks: every click flies a copy of the top card away and rotates the stack at once; nothing waits for the last click.
    let order = imgs.map((_, k) => k), cur = 0;
    const lay = () => order.forEach((k, d) => { imgs[k].style.setProperty('--d', d); imgs[k].toggleAttribute('data-top', d === 0); });
    lay();
    stack.addEventListener('click', () => {
      const top = imgs[order[0]], ghost = top.cloneNode(); ghost.removeAttribute('data-top'); ghost.style.setProperty('--d', 0); ghost.style.zIndex = 20; ghost.style.pointerEvents = 'none';
      stack.append(ghost); void ghost.offsetWidth; ghost.classList.add('is-gone'); setTimeout(() => ghost.remove(), 900);
      const was = cur; cur = (cur + 1) % ans.length;
      ans.forEach(a => a.classList.remove('is-on', 'is-out'));
      ans[was].classList.add('is-out'); setTimeout(() => ans[was].classList.remove('is-out'), 380);
      ans[cur].classList.add('is-on');
      order.push(order.shift()); lay();
    });
  }
})();



// Opening toys: each beauty tool does something to the headline.
(() => {
  const fm = document.querySelector('[data-film]'); if (!fm) return;
  const lines = [...fm.querySelectorAll('.fm-line>span')];
  const split = () => lines.forEach(sp => { const t = sp.childNodes[0]; if (!t || t.nodeType !== 3) return; const txt = t.textContent; const frag = document.createDocumentFragment(); [...txt].forEach((ch, k) => { const i = document.createElement('span'); i.className = 'fm-ch'; i.textContent = ch; i.style.setProperty('--c', k); frag.append(i); }); sp.replaceChild(frag, t); });
  split(); document.addEventListener('portfolio:language', () => setTimeout(split, 30));
  const chars = () => [...fm.querySelectorAll('.fm-ch')].filter(c => c.textContent.trim());
  const colours = ['#f59ab8', '#c7a6ff', '#ff7a59', '#7fd8aa', '#ffd166'];
  let ci = 0, timers = {};
  const once = (cls, ms) => { fm.classList.remove(cls); void fm.offsetWidth; fm.classList.add(cls); clearTimeout(timers[cls]); timers[cls] = setTimeout(() => fm.classList.remove(cls), ms); };
  const act = {
    scissors() { const cs = chars(); for (let n = 0; n < 2; n++) { const c = cs[Math.floor(Math.random() * cs.length)]; c.classList.remove('is-snip'); void c.offsetWidth; c.classList.add('is-snip'); setTimeout(() => c.classList.remove('is-snip'), 1500); } },
    polish() { ci = (ci + 1) % colours.length; fm.style.setProperty('--polish', colours[ci]); },
    comb() { once('is-comb', 1600); },
    dryer() { chars().forEach(c => { c.style.setProperty('--wx', (20 + Math.random() * 60).toFixed(0)); c.style.setProperty('--wy', ((Math.random() - .5) * 30).toFixed(0)); c.style.setProperty('--wr', ((Math.random() - .3) * 24).toFixed(0)); }); fm.classList.add('is-blow'); clearTimeout(timers.b); timers.b = setTimeout(() => fm.classList.remove('is-blow'), 380); },
    lipstick() { fm.classList.toggle('is-lip'); }
  };
  fm.querySelectorAll('[data-prop]').forEach(b => b.addEventListener('click', () => { act[b.dataset.prop]?.(); b.classList.remove('is-hit'); void b.offsetWidth; b.classList.add('is-hit'); setTimeout(() => b.classList.remove('is-hit'), 300); }));
})();

// Phones get a body: stacked edge slices behind the frame (thickness) and a metal rim highlight that moves with the pointer.
(() => {
  const devs = [...document.querySelectorAll('.fm-phone .dev, .xp-phone')];
  devs.forEach(d => {
    if (d.querySelector('.dev-side')) return;
    for (let k = 1; k <= 7; k++) { const e = document.createElement('i'); e.className = 'dev-side'; e.style.setProperty('--k', k); d.prepend(e); }
    const sh = document.createElement('i'); sh.className = 'dev-shine'; d.append(sh);
    d.style.transformStyle = 'preserve-3d';
  });
  if (!matchMedia('(hover:hover) and (pointer:fine)').matches) return;
  addEventListener('pointermove', e => { const x = (e.clientX / innerWidth * 2 - 1).toFixed(3); devs.forEach(d => d.style.setProperty('--mrx2', x)); }, { passive: true });
})();

// Snip: a small pair of scissors that travels down the case with you. It flies from section to section along a curve,
// leaning and growing mid-flight, lands beside each section with one line about it, and reacts when clicked.
(() => {
  if (!document.querySelector('[data-film]') || matchMedia('(max-width: 760px)').matches || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const zh = () => document.documentElement.lang.startsWith('zh');
  const lines = {
    overview: ['It all starts with a picture.', '一切从一张图片开始。'],
    system: ['One feed, two kinds of people.', '一个信息流，两种人。'],
    strategy: ['Supply first. No Creators, no feed.', '先有供给。没有 Creator 就没有信息流。'],
    flow: ['Picture → person → booking.', '图片 → 人 → 预约。'],
    interfaces: ['Look closer, the details matter.', '凑近看看，细节很重要。'],
    logic: ['Location before ranking!', '先看距离，再排顺序！'],
    build: ['Built with AI, inside the rules.', '用 AI 做的，但守着规则。'],
    challenges: ['Honest bit: what is still hard.', '说实话：还有哪些难点。'],
    research: ['Next: real people, real salons.', '下一步：真实的人，真实的店。'],
    release: ['Where it goes from here.', '接下来往哪走。']
  };
  const pokes = [['Snip snip!', '咔嚓咔嚓！'], ['Fresh cut ✂', '刚剪好 ✂'], ['Book me?', '约我吗？'], ['Hey, that tickles.', '哎，好痒。'], ['I only cut real work.', '我只剪真实作品。']];
  const secs = [...document.querySelectorAll('.ux-case .v3-product-section.ux-section')].filter(s => lines[s.id]);
  if (!secs.length) return;
  const b = document.createElement('button'); b.type = 'button'; b.className = 'snip'; b.setAttribute('aria-label', 'Scissors'); b.dataset.cursor = 'snip';
  b.innerHTML = `<span class="snip-body"><svg viewBox="0 0 80 80" aria-hidden="true"><g class="snip-blade snip-blade--a"><path d="M40 40 76 8" stroke="#e9e4ee" stroke-width="6" stroke-linecap="round"/><circle cx="24" cy="56" r="11" fill="none" stroke="#f59ab8" stroke-width="6"/><path d="M40 40 31 49" stroke="#f59ab8" stroke-width="6" stroke-linecap="round"/></g><g class="snip-blade snip-blade--b"><path d="M40 40 8 8" stroke="#e9e4ee" stroke-width="6" stroke-linecap="round"/><circle cx="56" cy="56" r="11" fill="none" stroke="#f59ab8" stroke-width="6"/><path d="M40 40 49 49" stroke="#f59ab8" stroke-width="6" stroke-linecap="round"/></g><circle cx="40" cy="40" r="4" fill="#120f16" stroke="#e9e4ee" stroke-width="2"/><g class="snip-eyes"><circle cx="33" cy="28" r="2.6" fill="#120f16"/><circle cx="47" cy="28" r="2.6" fill="#120f16"/></g></svg></span><span class="snip-say"></span>`;
  document.body.append(b);
  const say = b.querySelector('.snip-say');
  let pts = [], cx = 0, cy = 0, x = 0, y = 0, rot = 0, sc = 1, landed = -1, talkT = 0, pk = 0;
  const measure = () => { pts = secs.map((s, k) => { const r = s.getBoundingClientRect(); const right = k % 2 === 1; return { x: right ? innerWidth - 120 : 70, y: r.top + scrollY + 40, right }; }); };
  const talk = (t, ms = 2600) => { say.textContent = t; b.classList.add('is-talking'); clearTimeout(talkT); talkT = setTimeout(() => b.classList.remove('is-talking'), ms); };
  const target = () => {
    const mid = scrollY + innerHeight * .42;
    if (!pts.length) return null;
    if (mid <= pts[0].y) return { x: pts[0].x, y: Math.max(mid, pts[0].y - innerHeight), k: 0, t: 0, a: pts[0], b: pts[0] };
    for (let k = 0; k < pts.length - 1; k++) { const a = pts[k], c = pts[k + 1]; if (mid < c.y) { const t = (mid - a.y) / (c.y - a.y); return { k, t, a, b: c }; } }
    const L = pts[pts.length - 1]; return { k: pts.length - 1, t: 0, a: L, b: L };
  };
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const tick = () => {
    const g = target();
    if (g) {
      // stay at a section for the first part of the gap, then fly in an arc to the next one
      const hold = .55, tt = g.t < hold ? 0 : ease((g.t - hold) / (1 - hold));
      const tx = g.a.x + (g.b.x - g.a.x) * tt, arc = Math.sin(tt * Math.PI) * -120;
      const ty = scrollY + innerHeight * .36 + arc; // stays in view; only its side and pose change
      cx += (tx - cx) * .12; cy = scrollY + innerHeight * .36 + ((cy - scrollY) - innerHeight * .36) * .88 + arc * .12;
      const flying = tt > .02 && tt < .98;
      const dir = Math.sign(g.b.x - g.a.x) || 1;
      rot += ((flying ? dir * (20 + Math.sin(tt * Math.PI) * 25) : Math.sin(performance.now() / 700) * 6) - rot) * .1;
      sc += ((flying ? 1 + Math.sin(tt * Math.PI) * .6 : 1) - sc) * .1;
      b.classList.toggle('is-flying', flying); b.classList.toggle('is-right', (flying ? g.b : g.a).right);
      b.style.transform = `translate3d(${cx.toFixed(1)}px,${(cy - scrollY).toFixed(1)}px,0)`;
      b.querySelector('.snip-body').style.transform = `rotate(${rot.toFixed(1)}deg) scale(${sc.toFixed(3)})`;
      const at = !flying && g.t < hold ? g.k : -1;
      if (at >= 0 && at !== landed) { landed = at; const l = lines[secs[at].id]; talk(zh() ? l[1] : l[0]); }
      if (at < 0) landed = -1;
      const vis = scrollY + innerHeight > pts[0].y && scrollY < pts[pts.length - 1].y + 600;
      b.classList.toggle('is-on', vis);
    }
    requestAnimationFrame(tick);
  };
  b.addEventListener('click', () => { b.classList.remove('is-snap'); void b.offsetWidth; b.classList.add('is-snap'); const l = pokes[pk++ % pokes.length]; talk(zh() ? l[1] : l[0], 1800); });
  addEventListener('resize', measure); document.addEventListener('portfolio:language', () => setTimeout(measure, 100));
  addEventListener('load', measure); setTimeout(measure, 600); measure();
  const g0 = target(); if (g0) { cx = g0.a.x; cy = g0.a.y; }
  requestAnimationFrame(tick);
  // keep measurements fresh as images load and layouts settle
  new ResizeObserver(() => measure()).observe(document.body);
  setInterval(measure, 600);
})();

// Parallax rhythm for the case content below the film: cards in a row drift at different speeds.
(() => {
  if (!document.querySelector('[data-film]') || matchMedia('(prefers-reduced-motion: reduce)').matches || matchMedia('(max-width: 760px)').matches) return;
  const els = [...document.querySelectorAll('.ux-decisions article, .ux-details figure, .ux-principles>div, .ux-pains>div, .ux-build>li, .ux-journey>li, .ux-phases>li, .ux-challenge-grid>*')];
  els.forEach((e, k) => { e.classList.add('v3-par'); e.style.setProperty('--sp', [0.6, -0.35, 1, -0.6, 0.3][k % 5]); });
  let q = false;
  const run = () => { q = false; const vh = innerHeight; els.forEach(e => { const r = e.getBoundingClientRect(); if (r.bottom < -200 || r.top > vh + 200) return; const p = (r.top + r.height / 2 - vh / 2) / vh; e.style.setProperty('--py', (p * -60 * +e.style.getPropertyValue('--sp')).toFixed(1) + 'px'); }); };
  addEventListener('scroll', () => { if (!q) { q = true; requestAnimationFrame(run); } }, { passive: true }); run();
})();
