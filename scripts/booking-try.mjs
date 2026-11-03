// Glasgow Salon Booking — "try it" block.
// The prototype is the subject, not a box beside a list: it stands in the middle of the page, a switch above it flips
// between the customer's side and the shop's side (the whole point of the product), and a few pencil notes beside the
// screen point at what to try on each side. Repeated facts (status, stack, links) live in the opening and the receipt.
const zh = () => document.documentElement.lang.startsWith('zh');
const L = a => a[zh() ? 1 : 0];

const T = {
  k: ['Try it here', '在这里试一试'],
  t: ['Book as a customer. Then look at her side.', '先当一次顾客预约，再切到店主那边看看。'],
  sub: ['The same rules as the live site, on sample data — nothing you do here is real.', '和真实网站同一套规则，用的是示例数据——你在这里的操作不会产生真实预约。'],
  cust: ['Customer', '顾客'], shop: ['Shop', '店主'],
  full: ['Open full screen ↗', '全屏打开 ↗'], pdf: ['Download case PDF ↓', '下载案例 PDF ↓']
};
const NOTES = {
  cust: [
    { side: 'l', y: .3, t: ['pick a service — its length decides the times', '先选服务——时长决定能约的时间'] },
    { side: 'l', y: .66, t: ['only days and times that fit are offered', '只给真正放得下的日子和时间'] },
    { side: 'r', y: .1, t: ['booked? switch to Shop — it is already in her diary', '约好了？切到店主——已经在她的日程里'], toToggle: true }
  ],
  shop: [
    { side: 'l', y: .3, t: ['her whole day in one list', '她这一天，一张列表看完'] },
    { side: 'l', y: .66, t: ['close a few hours: bookings move, nobody is deleted', '临时关几个小时：预约被移出来，没有人被删掉'] },
    { side: 'r', y: .1, t: ['back to Customer to see what they see', '切回顾客，看看他们看到什么'], toToggle: true }
  ]
};
export const CHARS = () => [...Object.values(T).flat(), ...Object.values(NOTES).flat().flatMap(n => n.t)].join('');

export function mountTry(root) {
  const head = root.querySelector('.v3-product-head.has-opening'), stage = head?.querySelector('[data-demo-stage]');
  if (!head || !stage || head.querySelector('.bk-try')) return;
  const frame = stage.querySelector('[data-demo-frame]'), device = stage.querySelector('.ux-demo-device');
  const pdf = head.querySelector('[data-case-pdf]');
  head.classList.add('bk-try-head');

  const wrap = document.createElement('div'); wrap.className = 'bk-try';
  wrap.innerHTML = `<div class="bk-try-top"><p class="bk-try-k2"></p><h2 class="bk-try-h"></h2><p class="bk-try-sub"></p>
      <div class="bk-try-switch" role="tablist"><button type="button" role="tab" data-v="cust" aria-selected="true"></button><button type="button" role="tab" data-v="shop" aria-selected="false"></button><i aria-hidden="true"></i></div></div>
    <div class="bk-try-bench"><div class="bk-try-notes" aria-hidden="true"></div></div>
    <p class="bk-try-links"><a class="bk-try-full" target="_blank" rel="noopener" hidden></a></p>`;
  head.prepend(wrap);
  // a reviewer reads the one-minute summary and the case map first, then tries it
  const quick = root.querySelector('.bk-quick'); if (quick) head.before(quick);
  const bench = wrap.querySelector('.bk-try-bench');
  bench.prepend(device);
  if (pdf) { pdf.classList.add('bk-try-pdf'); wrap.querySelector('.bk-try-links').append(pdf); }

  let view = 'cust';
  const url = v => { const base = v === 'shop' ? stage.dataset.publicAdmin : stage.dataset.publicDemo; if (!base) return ''; try { const x = new URL(base, location.href); x.searchParams.set('lang', zh() ? 'zh' : 'en'); x.searchParams.set('embed', '1'); return x.href; } catch { return base; } };
  const fullUrl = v => url(v).replace(/[?&]embed=1/, '').replace(/\?$/, '');
  const notes = () => wrap.querySelector('.bk-try-notes').innerHTML = NOTES[view].map(n => `<p class="bk-try-note is-${n.side}${n.toToggle ? ' is-top' : ''}" style="--y:${n.y}"><span class="bk-try-w">${L(n.t)}</span><svg viewBox="0 0 90 30"><path d="${n.side === 'l' ? 'M2 20 C 30 4, 60 6, 86 14' : 'M88 20 C 60 4, 30 6, 4 14'}"/><path d="${n.side === 'l' ? 'M78 8 L86 14 L77 19' : 'M12 8 L4 14 L13 19'}"/></svg></p>`).join('');
  const text = () => {
    wrap.querySelector('.bk-try-k2').textContent = L(T.k); wrap.querySelector('.bk-try-h').textContent = L(T.t); wrap.querySelector('.bk-try-sub').textContent = L(T.sub);
    const [c, s] = wrap.querySelectorAll('.bk-try-switch button'); c.textContent = L(T.cust); s.textContent = L(T.shop);
    const full = wrap.querySelector('.bk-try-full'); const fu = fullUrl(view); full.textContent = L(T.full); if (fu) { full.href = fu; full.hidden = false; }
    notes();
  };
  const set = v => {
    if (v === view) return; view = v;
    wrap.querySelectorAll('.bk-try-switch button').forEach(b => b.setAttribute('aria-selected', b.dataset.v === v));
    wrap.querySelector('.bk-try-switch').dataset.v = v;
    const u = url(v); if (u && frame) { device.classList.add('is-swap'); setTimeout(() => { frame.src = u; }, 180); frame.addEventListener('load', () => device.classList.remove('is-swap'), { once: true }); setTimeout(() => device.classList.remove('is-swap'), 1500); }
    text();
  };
  wrap.querySelectorAll('.bk-try-switch button').forEach(b => b.addEventListener('click', () => set(b.dataset.v)));
  wrap.querySelector('.bk-try-switch').dataset.v = 'cust';
  // the site resets the frame to the customer side when the language changes: follow it
  document.addEventListener('portfolio:language', () => setTimeout(() => { view = 'cust'; wrap.querySelectorAll('.bk-try-switch button').forEach(b => b.setAttribute('aria-selected', b.dataset.v === 'cust')); wrap.querySelector('.bk-try-switch').dataset.v = 'cust'; text(); }, 60));
  text();
}
