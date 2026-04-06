import { DEFAULT_LOCALE, normalizeLocale, type Locale } from '../i18n/config';

export type LocaleMessages = Record<string, string>;

const localeCache = new Map<Locale, LocaleMessages>();
let activeLocale: Locale = DEFAULT_LOCALE;

async function fetchLocaleMessages(locale: Locale): Promise<LocaleMessages> {
  const cached = localeCache.get(locale);
  if (cached) return cached;

  const response = await fetch(`/i18n/${encodeURIComponent(locale)}.json`, {
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Failed to load locale "${locale}" (${response.status})`);
  }

  const parsed = (await response.json()) as LocaleMessages;
  localeCache.set(locale, parsed);
  return parsed;
}

export async function ensureLocaleMessages(localeInput: string | Locale): Promise<Locale> {
  const locale = normalizeLocale(localeInput) || DEFAULT_LOCALE;
  try {
    await fetchLocaleMessages(locale);
    activeLocale = locale;
    return locale;
  } catch {
    if (locale !== DEFAULT_LOCALE) {
      await fetchLocaleMessages(DEFAULT_LOCALE);
      activeLocale = DEFAULT_LOCALE;
      return DEFAULT_LOCALE;
    }
    return DEFAULT_LOCALE;
  }
}

export function getMessage(key: string, localeInput?: string | Locale): string {
  const locale = normalizeLocale(localeInput || activeLocale) || DEFAULT_LOCALE;
  const localeMap = localeCache.get(locale);
  const fallbackMap = localeCache.get(DEFAULT_LOCALE);
  return localeMap?.[key] ?? fallbackMap?.[key] ?? key;
}
