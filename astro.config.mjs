import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import partytown from '@astrojs/partytown';

export default defineConfig({
  site: 'https://nextgenfinca.com',
  output: 'hybrid',
  adapter: vercel(),
  trailingSlash: 'always',
  integrations: [
    tailwind({ applyBaseStyles: false }),
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: { en: 'en-GB', nl: 'nl-NL', de: 'de-DE', es: 'es-ES' },
      },
    }),
    partytown({ config: { forward: ['dataLayer.push'] } }),
  ],
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'nl', 'de', 'es'],
    routing: { prefixDefaultLocale: true },
  },
});
