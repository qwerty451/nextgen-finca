import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';
import partytown from '@astrojs/partytown';

export default defineConfig({
  site: 'https://nextgenfinca.com',
  output: 'static',
  adapter: vercel(),
  trailingSlash: 'always',
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
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
