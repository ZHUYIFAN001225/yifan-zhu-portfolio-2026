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
    let seen = false; try { seen = sessionStorage.getItem('v3-intro') === '1'; sessionStorage.setItem('v3-intro', '1'); } catch {}
    if (!seen) {
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

  // Page transitions: fade the page out before following an internal link, and in on arrival.
  if (!calm.matches) {
    document.body.classList.add('v3-page-in');
    document.addEventListener('click', e => {
      const a = e.target.closest?.('a[href]');
      if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (a.target && a.target !== '_self' || a.hasAttribute('download')) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin || url.protocol.indexOf('http') !== 0) return;
      if (url.pathname === location.pathname && url.search === location.search) return; // same page / hash links
      if (!/\.html$|\/$/.test(url.pathname)) return; // files such as PDFs
      e.preventDefault();
      document.documentElement.classList.add('is-page-leaving');
      setTimeout(() => { location.href = url.href; }, 260);
    });
    addEventListener('pageshow', e => { if (e.persisted) document.documentElement.classList.remove('is-page-leaving'); });
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
    const words = { view: ['View case', '查看案例'], try: ['Try it', '试一试'], play: ['Watch', '观看'] };
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
  const wide = matchMedia('(min-width: 900px)');
  let active = -1;
  const setActive = i => {
    if (i === active) return; active = i;
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
})();

// Exploded UI view: tilt the phone, separate its layers, then walk through each layer as you scroll.
(() => {
  const xp = document.querySelector('[data-explode]'); if (!xp) return;
  const calm = matchMedia('(prefers-reduced-motion: reduce)'), wide = matchMedia('(min-width: 900px)');
  const track = xp.querySelector('.xp-track'), items = [...xp.querySelectorAll('[data-xp-item]')], layers = [...xp.querySelectorAll('[data-xp-layer]')];
  const ease = v => { v = Math.min(1, Math.max(0, v)); return v < .5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2; };
  let last = -2;
  const focus = i => { if (i === last) return; last = i; xp.classList.toggle('has-focus', i >= 0);
    items.forEach((li, k) => li.classList.toggle('is-on', k === i)); layers.forEach((l, k) => l.classList.toggle('is-on', k === i)); };
  const update = () => {
    if (calm.matches || !wide.matches) { xp.style.removeProperty('--tilt'); xp.style.removeProperty('--spread'); focus(-1); items.forEach(li => li.classList.add('is-on')); return; }
    const r = track.getBoundingClientRect(), span = Math.max(1, track.offsetHeight - innerHeight), p = Math.min(1, Math.max(0, -r.top / span));
    xp.style.setProperty('--tilt', ease(p / .18).toFixed(4));
    xp.style.setProperty('--spread', ease((p - .12) / .22).toFixed(4));
    const n = layers.length, q = (p - .36) / .6;
    focus(q < 0 ? -1 : Math.min(n - 1, Math.floor(q * n)));
  };
  let queued = false; const on = () => { if (queued) return; queued = true; requestAnimationFrame(() => { queued = false; update(); }); };
  addEventListener('scroll', on, { passive: true }); addEventListener('resize', on); update();
})();
