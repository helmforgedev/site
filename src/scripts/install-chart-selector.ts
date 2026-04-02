const selector = document.getElementById('chart-selector') as HTMLSelectElement | null;
const nameSpan = document.getElementById('install-chart-name');
const nameSpanOci = document.getElementById('install-chart-name-oci');

if (selector) {
  selector.addEventListener('change', () => {
    const chart = selector.value;
    if (nameSpan) nameSpan.textContent = chart;
    if (nameSpanOci) nameSpanOci.textContent = chart;
  });
}
