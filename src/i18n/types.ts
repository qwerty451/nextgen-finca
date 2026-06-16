export type Lang = 'en' | 'nl' | 'de' | 'es';

export const SUPPORTED_LANGS: Lang[] = ['en', 'nl', 'de', 'es'];
export const DEFAULT_LANG: Lang = 'en';

export type TranslationKeys = typeof import('./locales/en.json');
