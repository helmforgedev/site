const tabs = document.querySelectorAll<HTMLButtonElement>('.install-tab');
const panels = document.querySelectorAll<HTMLElement>('.install-panel');

tabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    const target = tab.getAttribute('data-tab');

    tabs.forEach((t) => {
      t.classList.remove('border-primary', 'text-primary');
      t.classList.add('border-transparent', 'text-muted');
      t.setAttribute('aria-selected', 'false');
    });

    tab.classList.remove('border-transparent', 'text-muted');
    tab.classList.add('border-primary', 'text-primary');
    tab.setAttribute('aria-selected', 'true');

    panels.forEach((panel) => {
      panel.classList.toggle('hidden', panel.id !== `panel-${target}`);
    });
  });
});
