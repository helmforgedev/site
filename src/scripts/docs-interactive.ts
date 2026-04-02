// Docs search trigger
const docsSearchBtn = document.getElementById('docs-search-trigger');
const docsSearchMod = document.getElementById('docs-search-mod');
if (docsSearchMod && navigator.platform?.includes('Mac')) {
  docsSearchMod.textContent = '\u2318';
}
docsSearchBtn?.addEventListener('click', () => {
  if (typeof (window as any).__openSearch === 'function') {
    (window as any).__openSearch();
  }
});

// Sidebar toggle
const toggle = document.getElementById('docs-sidebar-toggle');
const sidebar = document.getElementById('docs-sidebar');

if (toggle && sidebar) {
  function closeSidebar() {
    sidebar!.classList.add('hidden');
    sidebar!.classList.remove('block');
    toggle!.setAttribute('aria-expanded', 'false');
  }

  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    if (expanded) {
      closeSidebar();
    } else {
      sidebar.classList.remove('hidden');
      sidebar.classList.add('block');
      toggle.setAttribute('aria-expanded', 'true');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      closeSidebar();
      toggle.focus();
    }
  });
}

// Inject copy buttons into all prose code blocks
document.querySelectorAll('.prose-docs pre').forEach((pre) => {
  pre.classList.add('group', 'relative');
  if (pre.querySelector('.prose-copy-btn')) return;

  const btn = document.createElement('button');
  btn.className =
    'prose-copy-btn absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-zinc-400 bg-zinc-800/80 backdrop-blur-sm border border-white/10 rounded-md cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all hover:text-white hover:bg-primary hover:border-primary-light z-10';
  btn.setAttribute('aria-label', 'Copy code');
  btn.innerHTML =
    '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg><span>Copy</span>';

  btn.addEventListener('click', async () => {
    const code = pre.querySelector('code');
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code.textContent || '');
      const span = btn.querySelector('span');
      const svg = btn.querySelector('svg');
      if (span) span.textContent = 'Copied!';
      if (svg)
        svg.innerHTML =
          '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>';
      btn.classList.add('text-emerald-400', 'border-emerald-500/50');
      setTimeout(() => {
        if (span) span.textContent = 'Copy';
        if (svg)
          svg.innerHTML =
            '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>';
        btn.classList.remove('text-emerald-400', 'border-emerald-500/50');
      }, 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  });

  pre.appendChild(btn);
});

// Table of Contents generation + scroll spy
const toc = document.getElementById('docs-toc');
if (toc) {
  const article = document.querySelector('.prose-docs');
  if (article) {
    const headings = article.querySelectorAll('h2, h3');
    if (headings.length < 2) {
      const parent = toc.parentElement;
      if (parent) parent.style.display = 'none';
    } else {
      const links: { el: Element; a: HTMLAnchorElement }[] = [];

      headings.forEach((h) => {
        if (!h.id) {
          h.id = (h.textContent ?? '')
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
        }
        const a = document.createElement('a');
        a.href = '#' + h.id;
        a.textContent = h.textContent;
        a.setAttribute('data-depth', h.tagName === 'H3' ? '3' : '2');
        toc.appendChild(a);
        links.push({ el: h, a });
      });

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              links.forEach((l) => l.a.classList.remove('toc-active'));
              const match = links.find((l) => l.el === entry.target);
              if (match) match.a.classList.add('toc-active');
            }
          });
        },
        { rootMargin: '-80px 0px -70% 0px', threshold: 0 },
      );

      links.forEach((l) => observer.observe(l.el));
    }
  }
}
