import type { Lang, TranslationKeys } from './types';
import { SUPPORTED_LANGS, DEFAULT_LANG } from './types';

const dictionaries: Record<Lang, () => Promise<TranslationKeys>> = {
  en: () => import('./locales/en.json').then((m) => m.default as TranslationKeys),
  nl: () => import('./locales/nl.json').then((m) => m.default as TranslationKeys),
  de: () => import('./locales/de.json').then((m) => m.default as TranslationKeys),
  es: () => import('./locales/es.json').then((m) => m.default as TranslationKeys),
};

export async function getDictionary(lang: Lang): Promise<TranslationKeys> {
  return dictionaries[lang]();
}

export function getLangFromUrl(url: URL): Lang {
  const [, lang] = url.pathname.split('/');
  if ((SUPPORTED_LANGS as string[]).includes(lang)) return lang as Lang;
  return DEFAULT_LANG;
}

export function buildLangHref(targetLang: Lang, currentPath: string): string {
  const withoutLang = currentPath.replace(/^\/[a-z]{2}(\/|$)/, '/');
  return `/${targetLang}${withoutLang === '/' ? '/' : withoutLang}`;
}

export function getLocalizedPath(lang: Lang, slug: string): string {
  return `/${lang}/${slug}/`;
}

export { SUPPORTED_LANGS, DEFAULT_LANG };
