export const SUPPORTED_LOCALES = ['en', 'es', 'pt-BR'] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = 'en';

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  es: 'Español',
  'pt-BR': 'Português',
};

export const LOCALE_FLAGS: Record<Locale, string> = {
  en: '🇺🇸',
  es: '🇪🇸',
  'pt-BR': '🇧🇷',
};

export function isLocale(value: string | null | undefined): value is Locale {
  return !!value && (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

export function normalizeLocale(input: string | null | undefined): Locale {
  if (!input) return DEFAULT_LOCALE;

  const value = input.toLowerCase();

  if (value.startsWith('pt')) return 'pt-BR';
  if (value.startsWith('es')) return 'es';
  if (value.startsWith('en')) return 'en';

  return DEFAULT_LOCALE;
}
