const searchInput = document.getElementById('chart-search') as HTMLInputElement | null;
const chartCards = document.querySelectorAll<HTMLElement>('.chart-card');
const emptyState = document.getElementById('chart-empty-state');
const searchStatus = document.getElementById('chart-search-status');

if (searchInput) {
  searchInput.addEventListener('input', () => {
    const term = searchInput.value.toLowerCase().trim();
    let visibleCount = 0;

    chartCards.forEach((card) => {
      const name = card.getAttribute('data-name') ?? '';
      const desc = card.getAttribute('data-desc') ?? '';

      if (name.includes(term) || desc.includes(term)) {
        card.style.display = '';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });

    if (emptyState) {
      emptyState.classList.toggle('hidden', visibleCount > 0);
    }

    if (searchStatus && term) {
      searchStatus.textContent =
        visibleCount === 0 ? 'No charts found' : `${visibleCount} chart${visibleCount !== 1 ? 's' : ''} found`;
    } else if (searchStatus) {
      searchStatus.textContent = '';
    }
  });
}
