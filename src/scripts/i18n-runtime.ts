import { DEFAULT_LOCALE, LOCALE_LABELS, LOCALE_FLAGS, normalizeLocale, type Locale } from '../i18n/config';
import { messages } from '../i18n/messages';

declare global {
  interface Window {
    __HF_LOCALE__?: Locale;
    __HF_SET_LOCALE__?: (locale: Locale) => void;
  }
}

const COOKIE_NAME = 'hf_locale';

function getCookie(name: string): string | null {
  const entry = document.cookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));
  return entry ? decodeURIComponent(entry.split('=').slice(1).join('=')) : null;
}

function setCookie(name: string, value: string, days = 365): void {
  const expires = new Date(Date.now() + days * 86400000).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

function detectLocale(): Locale {
  const stored = localStorage.getItem(COOKIE_NAME) || getCookie(COOKIE_NAME);
  if (stored) return normalizeLocale(stored);

  const candidates = [navigator.language, ...(navigator.languages || [])].filter(Boolean);
  for (const lang of candidates) {
    const normalized = normalizeLocale(lang);
    if (normalized) return normalized;
  }

  return DEFAULT_LOCALE;
}

function t(locale: Locale, key: string): string {
  return messages[locale][key] ?? messages[DEFAULT_LOCALE][key] ?? key;
}

function applyTranslations(locale: Locale): void {
  document.documentElement.lang = locale === 'pt-BR' ? 'pt-BR' : locale;
  document.documentElement.setAttribute('data-locale', locale);

  const nodes = document.querySelectorAll<HTMLElement>('[data-i18n]');
  for (const node of nodes) {
    const key = node.dataset.i18n;
    if (!key) continue;
    node.textContent = t(locale, key);
  }

  const attrNodes = document.querySelectorAll<HTMLElement>('[data-i18n-attr][data-i18n-key]');
  for (const node of attrNodes) {
    const attr = node.dataset.i18nAttr;
    const key = node.dataset.i18nKey;
    if (!attr || !key) continue;
    node.setAttribute(attr, t(locale, key));
  }

  const flags = document.querySelectorAll<HTMLElement>('[data-locale-current-flag]');
  const labels = document.querySelectorAll<HTMLElement>('[data-locale-current-label]');
  const buttons = document.querySelectorAll<HTMLElement>('[data-locale-button]');

  flags.forEach((flag) => {
    flag.textContent = LOCALE_FLAGS[locale];
  });
  labels.forEach((label) => {
    label.textContent = LOCALE_LABELS[locale];
  });
  buttons.forEach((button) => {
    button.setAttribute('aria-label', t(locale, 'language.switcher.label'));
  });

  document.dispatchEvent(new CustomEvent('hf:localechange', { detail: { locale } }));
}

function setLocale(locale: Locale): void {
  window.__HF_LOCALE__ = locale;
  localStorage.setItem(COOKIE_NAME, locale);
  setCookie(COOKIE_NAME, locale);
  applyTranslations(locale);
}

function wireLocaleSwitcher(): void {
  const switchers = document.querySelectorAll<HTMLElement>('[data-locale-switcher]');

  switchers.forEach((switcher) => {
    const button = switcher.querySelector<HTMLButtonElement>('[data-locale-button]');
    const menu = switcher.querySelector<HTMLElement>('[data-locale-menu]');
    const options = switcher.querySelectorAll<HTMLButtonElement>('[data-locale-option]');

    if (!button || !menu) return;

    const close = (): void => {
      button.setAttribute('aria-expanded', 'false');
      menu.classList.add('hidden');
    };

    const open = (): void => {
      button.setAttribute('aria-expanded', 'true');
      menu.classList.remove('hidden');
    };

    button.addEventListener('click', () => {
      const expanded = button.getAttribute('aria-expanded') === 'true';
      if (expanded) close();
      else open();
    });

    options.forEach((option) => {
      option.addEventListener('click', () => {
        const next = normalizeLocale(option.dataset.locale);
        setLocale(next);
        close();
      });
    });

    document.addEventListener('click', (event) => {
      const target = event.target as Node;
      if (!menu.contains(target) && !button.contains(target)) close();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') close();
    });
  });
}

function bootstrapLocale(): void {
  const locale = detectLocale();
  setLocale(locale);
  wireLocaleSwitcher();
}

window.__HF_SET_LOCALE__ = setLocale;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrapLocale);
} else {
  bootstrapLocale();
}
