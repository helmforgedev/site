import process from 'node:process';
import { messages } from '../src/i18n/messages.ts';

const requiredLocales = ['en', 'es', 'pt-BR'];
const baseLocale = 'en';
const strictTranslatedPrefixes = ['docsCharts.auto.'];
const errors = [];

function normalize(value) {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim();
}

function hasHumanText(value) {
  return /[A-Za-zÀ-ÿ]/.test(value);
}

for (const locale of requiredLocales) {
  if (!messages[locale]) {
    errors.push(`Missing locale block: ${locale}`);
  }
}

if (errors.length) {
  console.error('i18n consistency check failed:\n');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

const baseKeys = Object.keys(messages[baseLocale]);

for (const locale of requiredLocales) {
  const localeKeys = new Set(Object.keys(messages[locale]));

  for (const key of baseKeys) {
    if (!localeKeys.has(key)) {
      errors.push(`[${locale}] missing key: ${key}`);
      continue;
    }

    const localeValue = messages[locale][key];
    if (typeof localeValue !== 'string' || !localeValue.trim()) {
      errors.push(`[${locale}] empty value for key: ${key}`);
    }
  }

  for (const key of localeKeys) {
    if (!(key in messages[baseLocale])) {
      errors.push(`[${locale}] extra key not in ${baseLocale}: ${key}`);
    }
  }
}

for (const locale of requiredLocales.filter((item) => item !== baseLocale)) {
  for (const key of baseKeys) {
    if (!strictTranslatedPrefixes.some((prefix) => key.startsWith(prefix))) {
      continue;
    }

    const baseValue = normalize(messages[baseLocale][key]);
    const localeValue = normalize(messages[locale][key]);

    if (!hasHumanText(baseValue)) {
      continue;
    }

    if (localeValue === baseValue) {
      errors.push(
        `[${locale}] untranslated key in strict scope (${strictTranslatedPrefixes.join(', ')}): ${key}`,
      );
    }
  }
}

if (errors.length) {
  console.error('i18n consistency check failed:\n');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log(
  `i18n consistency check passed (${baseKeys.length} keys across ${requiredLocales.length} locales).`,
);
