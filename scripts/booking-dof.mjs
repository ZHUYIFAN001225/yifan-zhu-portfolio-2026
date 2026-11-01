// Glasgow Salon Booking — depth of field.
// A few soft 3D objects (rendered once with three.js, saved as images) sit BEHIND the text in the empty parts of the
// page. Each has a depth: the one in focus is sharp, the ones nearer or further are blurred, and on scroll and pointer
// they move at different speeds, so the page reads as having space. They never sit over words.
const SRC = n => `assets/v3/dof/${n}.webp`;
// x/y: centre as a fraction of the host; w: width in vw; z: depth (0 = in focus, + = nearer/blurred, − = further/blurred)
// Every object belongs to the story it sits beside: the shop's tools, her paper diary, the customer's phone.
const SETS = {
  // the shop: scissors resting on the counter by the QR sign (in focus); a customer's phone far behind; a comb close up
  hero: [
    { n: 'phone-book', x: .6, y: .3, w: 11, z: -2.4, r: -10 },
    { n: 'scissors-m', x: .84, y: .17, w: 24, z: 0, r: 20, focus: true },
    { n: 'comb', x: .97, y: 1.02, w: 24, z: 2.6, r: -14 }
  ],
  // trying it: the customer's side is in your hands; her side (the diary on her phone) waits, out of focus
  try: [
    { n: 'phone-diary', x: .86, y: .5, w: 15, z: -2, r: 10 },
    { n: 'scissors-m', x: .1, y: .7, w: 18, z: -2.4, r: 30 }
  ],
  // 08:30 the old way: her paper diary, the pencil she corrects it with
  overview: [{ n: 'diary', x: .12, y: .5, w: 17, z: 0, r: -8, focus: true }, { n: 'pencil', x: .9, y: .7, w: 16, z: 2.4, r: 0 }],
  // 10:00 the shared diary: the phone with her real diary in focus, the paper one receding
  system: [{ n: 'phone-diary', x: .88, y: .5, w: 13, z: 0, r: 8, focus: true }, { n: 'diary', x: .1, y: .58, w: 13, z: -2.4, r: 10 }],
  // 18:05 behind the screens: rules written first (pencil), the customer's screen it drives
  build: [{ n: 'pencil', x: .12, y: .4, w: 15, z: 0, r: 0, focus: true }, { n: 'phone-book', x: .92, y: .62, w: 10, z: -2.2, r: -10 }],
  // 18:30 closed: the scissors put down, the comb close up
  end: [{ n: 'scissors', x: .9, y: .66, w: 17, z: 0, r: 14, focus: true }, { n: 'comb-l', x: .08, y: .8, w: 22, z: 2.6, r: 10 }]
};

export function mountDof(root) {
  const calm = matchMedia('(prefers-reduced-motion: reduce)').matches, narrow = matchMedia('(max-width: 899px)').matches;
  const layers = [];
  const add = (host, set, cls) => {
    if (!host || host.querySelector(':scope > .bk-dof')) return;
    const box = document.createElement('div'); box.className = 'bk-dof ' + (cls || ''); box.setAttribute('aria-hidden', 'true');
    set.forEach(o => {
      const img = new Image(); img.src = SRC(o.n); img.alt = ''; img.decoding = 'async';
      const blur = Math.abs(o.z) * (narrow ? 5 : 8);
      const w = narrow ? o.w * 1.6 : o.w;
      img.style.cssText = `left:${o.x * 100}%;top:${o.y * 100}%;width:${w}vw;--r:${o.r || 0}deg;filter:${blur ? `blur(${blur}px)` : 'none'};opacity:${o.z < -1.5 ? .7 : 1};z-index:${Math.round(10 + o.z * 2)}`;
      if (o.focus) img.classList.add('is-focus');
      box.append(img); layers.push({ img, z: o.z, host });
    });
    host.prepend(box);
  };
  add(document.querySelector('[data-opening]'), SETS.hero, 'is-dark');
  add(root.querySelector('.bk-try'), SETS.try, 'is-dark');
  root.querySelectorAll('.bk-moment').forEach(m => SETS[m.dataset.moment] && add(m, SETS[m.dataset.moment], 'is-paper'));
  if (calm) return;
  // depth in motion: nearer objects travel further with scroll and pointer
  let mx = 0, my = 0, tx = 0, ty = 0, q = false;
  addEventListener('pointermove', e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; kick(); }, { passive: true });
  addEventListener('scroll', kick, { passive: true });
  function kick() { if (!q) { q = true; requestAnimationFrame(run); } }
  function run() {
    q = false; tx += (mx - tx) * .12; ty += (my - ty) * .12; const vh = innerHeight;
    layers.forEach(l => {
      const r = l.host.getBoundingClientRect(); if (r.bottom < -200 || r.top > vh + 200) return;
      const k = (l.z + 3) / 3, c = (r.top + r.height / 2 - vh / 2) / vh;
      l.img.style.translate = `calc(-50% + ${(tx * 30 * k).toFixed(1)}px) calc(-50% + ${(c * -90 * k + ty * 22 * k).toFixed(1)}px)`;
    });
    if (Math.abs(mx - tx) > .002 || Math.abs(my - ty) > .002) kick();
  }
  run();
}
