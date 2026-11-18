// SPDX-License-Identifier: Apache-2.0
// Blog interactive enhancements: reading progress bar, TOC scrollspy, code block copy, and link sharing

function setupReadingProgress() {
  const progressBar = document.getElementById('reading-progress');
  const article = document.querySelector('article[data-pagefind-body]');
  if (!progressBar || !article) return;

  function update() {
    const rect = article!.getBoundingClientRect();
    const windowHeight = window.innerHeight;
    const articleTop = rect.top;
    const articleHeight = rect.height;

    if (articleTop > 0) {
      progressBar!.style.width = '0%';
    } else {
      const scrolled = -articleTop;
      const scrollable = articleHeight - windowHeight;
      if (scrollable <= 0) {
        progressBar!.style.width = '100%';
      } else {
        const pct = Math.min(100, Math.max(0, (scrolled / scrollable) * 100));
        progressBar!.style.width = `${pct}%`;
      }
    }
  }

  window.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update, { passive: true });
  update();
}

function setupTocScrollspy() {
  const tocLinks = document.querySelectorAll<HTMLAnchorElement>('.blog-toc-link');
  if (tocLinks.length === 0) return;

  const article = document.querySelector('article[data-pagefind-body]');
  if (!article) return;

  const headings = article.querySelectorAll<HTMLHeadingElement>('h2, h3');
  if (headings.length === 0) return;

  const linkMap = new Map<string, HTMLAnchorElement>();
  tocLinks.forEach((link) => {
    const slug = link.dataset.slug;
    if (slug) linkMap.set(slug, link);
  });

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = entry.target.id;
          if (!id) return;
          tocLinks.forEach((l) => {
            l.classList.remove('text-primary-light', 'border-primary', 'font-semibold', 'bg-primary/5');
            l.classList.add('border-border', 'text-text-muted');
          });
          const activeLink = linkMap.get(id);
          if (activeLink) {
            activeLink.classList.remove('border-border', 'text-text-muted');
            activeLink.classList.add('text-primary-light', 'border-primary', 'font-semibold', 'bg-primary/5');
          }
        }
      });
    },
    { rootMargin: '-90px 0px -70% 0px', threshold: 0.1 },
  );

  headings.forEach((h) => observer.observe(h));
}

function setupCodeCopyButtons() {
  const codeBlocks = document.querySelectorAll<HTMLPreElement>('article[data-pagefind-body] pre');
  codeBlocks.forEach((pre) => {
    pre.classList.add('group', 'relative');
    if (pre.querySelector('.blog-code-copy-btn')) return;

    const btn = document.createElement('button');
    btn.className =
      'blog-code-copy-btn absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-zinc-400 bg-zinc-800/80 backdrop-blur-sm border border-white/10 rounded-md cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100 transition-all hover:text-white hover:bg-primary hover:border-primary-light z-10';
    btn.setAttribute('aria-label', 'Copy code');
    btn.innerHTML =
      '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg><span>Copy</span>';

    btn.addEventListener('click', async () => {
      const code = pre.querySelector('code');
      if (!code) return;
      try {
        await navigator.clipboard.writeText(code.textContent || '');
        const span = btn.querySelector('span');
        if (span) {
          span.textContent = 'Copied!';
          btn.classList.add('text-emerald-400', 'border-emerald-500/50');
          setTimeout(() => {
            span.textContent = 'Copy';
            btn.classList.remove('text-emerald-400', 'border-emerald-500/50');
          }, 2000);
        }
      } catch {
        // Fallback
      }
    });

    pre.appendChild(btn);
  });
}

function setupShareCopyLink() {
  const copyBtn = document.getElementById('blog-copy-link-btn') as HTMLButtonElement | null;
  if (!copyBtn) return;

  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      const span = copyBtn.querySelector('.copy-link-text');
      if (span) {
        const original = span.textContent;
        span.textContent = 'Copied!';
        copyBtn.classList.add('text-emerald-500');
        setTimeout(() => {
          span.textContent = original;
          copyBtn.classList.remove('text-emerald-500');
        }, 2000);
      }
    } catch {
      // Fallback
    }
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setupReadingProgress();
    setupTocScrollspy();
    setupCodeCopyButtons();
    setupShareCopyLink();
  });
} else {
  setupReadingProgress();
  setupTocScrollspy();
  setupCodeCopyButtons();
  setupShareCopyLink();
}
