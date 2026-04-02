// Pagefind search modal — Cmd/Ctrl+K to open
let pagefind: any = null;
let activeIndex = -1;

const overlay = document.getElementById('search-overlay')!;
const backdrop = document.getElementById('search-backdrop')!;
const input = document.getElementById('search-input') as HTMLInputElement;
const resultList = document.getElementById('search-result-list')!;
const emptyState = document.getElementById('search-empty')!;
const noResults = document.getElementById('search-no-results')!;

async function loadPagefind() {
  if (pagefind) return pagefind;
  try {
    pagefind = await import(/* @vite-ignore */ '/pagefind/pagefind.js');
    await pagefind.init();
  } catch {
    // Pagefind not available (dev mode) — show message
    pagefind = null;
  }
  return pagefind;
}

function openSearch() {
  overlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  input.value = '';
  resultList.innerHTML = '';
  emptyState.classList.remove('hidden');
  noResults.classList.add('hidden');
  activeIndex = -1;
  requestAnimationFrame(() => input.focus());
  loadPagefind();
}

function closeSearch() {
  overlay.classList.add('hidden');
  document.body.style.overflow = '';
}

function setActiveResult(index: number) {
  const items = resultList.querySelectorAll('[data-search-result]');
  items.forEach((el, i) => {
    if (i === index) {
      el.classList.add('bg-primary/10', 'border-primary/30');
      el.classList.remove('border-transparent');
      el.scrollIntoView({ block: 'nearest' });
    } else {
      el.classList.remove('bg-primary/10', 'border-primary/30');
      el.classList.add('border-transparent');
    }
  });
  activeIndex = index;
}

function navigateToResult() {
  const items = resultList.querySelectorAll('[data-search-result]');
  if (activeIndex >= 0 && activeIndex < items.length) {
    const link = items[activeIndex].querySelector('a') as HTMLAnchorElement;
    if (link) {
      closeSearch();
      window.location.href = link.href;
    }
  }
}

let debounceTimer: ReturnType<typeof setTimeout>;

async function performSearch(query: string) {
  if (!pagefind || !query.trim()) {
    resultList.innerHTML = '';
    emptyState.classList.toggle('hidden', !!query.trim());
    noResults.classList.toggle('hidden', !query.trim() || !pagefind);
    return;
  }

  const search = await pagefind.search(query);
  const results = await Promise.all(search.results.slice(0, 12).map((r: any) => r.data()));

  emptyState.classList.add('hidden');
  resultList.innerHTML = '';
  activeIndex = -1;

  if (results.length === 0) {
    noResults.classList.remove('hidden');
    return;
  }

  noResults.classList.add('hidden');

  results.forEach((result: any) => {
    const li = document.createElement('li');
    li.setAttribute('data-search-result', '');
    li.className = 'rounded-xl border border-transparent px-4 py-3 transition-colors cursor-pointer';

    // Clean up the URL
    const url = result.url || result.raw_url || '#';

    // Determine section from URL
    let section = 'Page';
    if (url.includes('/docs/charts/')) section = 'Chart';
    else if (url.includes('/docs/')) section = 'Docs';
    else if (url.includes('/changelog')) section = 'Changelog';
    else if (url.includes('/stack')) section = 'Stack Builder';

    li.innerHTML = `
      <a href="${url}" class="block">
        <div class="flex items-center gap-2 mb-1">
          <span class="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 rounded px-1.5 py-0.5">${section}</span>
          <span class="text-sm font-bold text-text-base">${result.meta?.title || 'Untitled'}</span>
        </div>
        ${result.excerpt ? `<p class="text-xs text-text-muted leading-relaxed line-clamp-2">${result.excerpt}</p>` : ''}
      </a>
    `;

    li.addEventListener('click', () => {
      closeSearch();
      window.location.href = url;
    });

    li.addEventListener('mouseenter', () => {
      const items = resultList.querySelectorAll('[data-search-result]');
      const idx = Array.from(items).indexOf(li);
      setActiveResult(idx);
    });

    resultList.appendChild(li);
  });
}

// Event listeners
input.addEventListener('input', () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => performSearch(input.value), 150);
});

backdrop.addEventListener('click', closeSearch);

// Keyboard navigation
document.addEventListener('keydown', (e) => {
  // Open with Cmd/Ctrl+K
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    if (overlay.classList.contains('hidden')) {
      openSearch();
    } else {
      closeSearch();
    }
    return;
  }

  // Only handle these when modal is open
  if (overlay.classList.contains('hidden')) return;

  if (e.key === 'Escape') {
    e.preventDefault();
    closeSearch();
  } else if (e.key === 'ArrowDown') {
    e.preventDefault();
    const items = resultList.querySelectorAll('[data-search-result]');
    if (items.length > 0) {
      setActiveResult(Math.min(activeIndex + 1, items.length - 1));
    }
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (activeIndex > 0) {
      setActiveResult(activeIndex - 1);
    }
  } else if (e.key === 'Enter') {
    e.preventDefault();
    navigateToResult();
  }
});

// Expose openSearch globally for the header button
(window as any).__openSearch = openSearch;
