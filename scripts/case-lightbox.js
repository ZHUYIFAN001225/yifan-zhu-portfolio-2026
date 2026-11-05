// Click a picture to see it big. Any <img data-zoom> (or one inside a [data-zoom] figure) opens full-screen;
// data-zoom="path" shows a larger file than the one on the page. Esc, click or the close button shuts it.
(() => {
  const zh = () => document.documentElement.lang.startsWith('zh');
  let box;
  const build = () => {
    box = document.createElement('div'); box.className = 'lb'; box.setAttribute('role', 'dialog'); box.setAttribute('aria-modal', 'true');
    box.innerHTML = '<button type="button" class="lb-x"></button><div class="lb-scroll"><img alt="" /></div><p class="lb-cap"></p>';
    box.addEventListener('click', e => { if (e.target === box || e.target.closest('.lb-x') || e.target.classList.contains('lb-scroll')) close(); });
    document.body.append(box);
  };
  const open = (src, cap) => {
    if (!box) build();
    const img = box.querySelector('img'); img.src = src; box.querySelector('.lb-cap').textContent = cap || '';
    box.querySelector('.lb-x').setAttribute('aria-label', zh() ? '关闭' : 'Close');
    box.classList.add('is-open'); document.documentElement.classList.add('lb-lock'); box.querySelector('.lb-x').focus();
  };
  const close = () => { if (!box) return; box.classList.remove('is-open'); document.documentElement.classList.remove('lb-lock'); };
  document.addEventListener('click', e => {
    const img = e.target.closest('img'); if (!img) return;
    const host = img.closest('[data-zoom]') || (img.hasAttribute('data-zoom') ? img : null); if (!host) return;
    const a = img.closest('a'); if (a && !a.classList.contains('v3-image-link')) return;
    e.preventDefault();
    let big = host.getAttribute('data-zoom') || img.currentSrc || img.src;
    // zh twins live in a sibling zh/ folder, same as the page images
    if (host.getAttribute('data-zoom') && zh() && img.getAttribute('src').includes('/zh/')) big = big.replace(/\/([^/]+)$/, '/zh/$1');
    const fig = img.closest('figure'), cap = fig?.querySelector('figcaption>p, figcaption')?.textContent?.trim();
    open(big, cap);
  });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') close(); });
})();
