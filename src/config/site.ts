import type { Lang } from '@/i18n/types';

export const SITE_URL = 'https://nextgenfinca.com';
export const SITE_NAME = 'NextGen Finca';

export const REGIONS = ['Almansa', 'Ontinyent', 'Yecla', 'Villena'];

export const NAV_LINKS = (lang: Lang) => [
  { key: 'home', href: `/${lang}/` },
  { key: 'services', href: `/${lang}/services/` },
  { key: 'fincaCare', href: `/${lang}/finca-care/` },
  { key: 'contact', href: `/${lang}/contact/` },
];

export { SUPPORTED_LANGS, DEFAULT_LANG } from '@/i18n/types';
