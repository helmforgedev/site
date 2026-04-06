import type { APIRoute } from 'astro';
import { DEFAULT_LOCALE, SUPPORTED_LOCALES, normalizeLocale, type Locale } from '../../i18n/config';
import { messages } from '../../i18n/messages';

export const prerender = true;

export function getStaticPaths() {
  return SUPPORTED_LOCALES.map((locale) => ({ params: { locale } }));
}

export const GET: APIRoute = ({ params }) => {
  const resolved = (normalizeLocale(params.locale || DEFAULT_LOCALE) || DEFAULT_LOCALE) as Locale;
  const body = JSON.stringify(messages[resolved] ?? messages[DEFAULT_LOCALE] ?? {});

  return new Response(body, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
};
