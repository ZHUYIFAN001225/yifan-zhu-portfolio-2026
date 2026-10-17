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
        tools.querySelectorAll('[data-tool-label]').forEach(a=>a.textContent=a.dataset.toolLabel==='demo'?text('See prototype flow','查看原型流程'):a.dataset.toolLabel==='video'?(page==='practice.html'?text('Watch film','观看影像'):text('Watch walkthrough','观看演示')):a.dataset.toolLabel==='prototype'?text('See prototype evidence','查看原型证据'):a.dataset.toolLabel==='outcome'?text('View outcome','查看成果'):text(project.externalLabel?.en||'View live product',project.externalLabel?.zh||'查看在线产品'));
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
        const key=stage.dataset.demoStage,url=(local&&demos[key])||stage.dataset.publicDemo;
        const unavailable=stage.parentElement.querySelector('[data-demo-unavailable]');
        if(!url){if(unavailable)unavailable.hidden=false;return;}
        const frame=stage.querySelector('[data-demo-frame]');frame.src=url;
        // Some prototypes refresh when their window gains focus, which swallowed the first tap.
        // Give the frame focus as the pointer arrives, so the first real click goes through.
        frame.addEventListener('pointerenter',()=>{try{if(document.activeElement!==frame)frame.contentWindow.focus();}catch{}});stage.hidden=false;if(unavailable)unavailable.hidden=true;
        stage.querySelectorAll('[data-demo-launch]').forEach(a=>{const route=(local&&demos[a.dataset.demoLaunch])||(a.dataset.demoLaunch===key?stage.dataset.publicDemo:'');if(route){a.href=route;a.hidden=false;}});
        const note=stage.querySelector('[data-demo-local-note]');if(note)note.hidden=!(local&&demos[key]);
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
