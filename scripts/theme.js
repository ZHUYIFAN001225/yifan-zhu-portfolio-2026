// Apply the saved colour choice before stylesheets paint. Dark is the default;
// a visitor's explicit choice persists across pages.
(() => {
  const root = document.documentElement;
  const key = 'portfolio-color-theme';
  const valid = value => value === 'dark' || value === 'light';
  let theme = 'dark';
  try { const saved = localStorage.getItem(key); if (valid(saved)) theme = saved; } catch {}
  root.dataset.theme = theme;

  function labels() {
    const zh = root.lang.startsWith('zh');
    const dark = root.dataset.theme === 'dark';
    document.querySelectorAll('[data-theme-toggle]').forEach(button => {
      const label = button.querySelector('.v3-theme-label');
      if (label) label.textContent = zh ? (dark ? '浅色' : '深色') : (dark ? 'Light' : 'Dark');
      const action = zh ? (dark ? '切换到浅色模式' : '切换到深色模式') : (dark ? 'Switch to light mode' : 'Switch to dark mode');
      button.setAttribute('aria-label', action);
      button.title = action;
    });
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = dark ? '#141517' : '#f6f5f1';
  }
  function apply(value, persist = false) {
    if (!valid(value)) return;
    root.dataset.theme = value;
    if (persist) try { localStorage.setItem(key, value); } catch {}
    labels();
    document.dispatchEvent(new CustomEvent('portfolio:theme', { detail: { theme: value } }));
  }
  document.addEventListener('DOMContentLoaded', () => {
    labels();
    document.querySelectorAll('[data-theme-toggle]').forEach(button => {
      button.addEventListener('click', () => apply(root.dataset.theme === 'dark' ? 'light' : 'dark', true));
    });
  });
  document.addEventListener('portfolio:language', labels);
  window.addEventListener('storage', event => {
    if (event.key === key || event.key === null) apply(valid(event.newValue) ? event.newValue : 'dark');
  });
  window.addEventListener('pageshow', () => {
    try { const saved = localStorage.getItem(key); apply(valid(saved) ? saved : 'dark'); } catch { labels(); }
  });
})();
