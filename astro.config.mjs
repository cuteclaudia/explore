// @ts-check
import { defineConfig } from 'astro/config';
import markdoc from '@astrojs/markdoc';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';
import netlify from '@astrojs/netlify';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.claudiagilbert.com',
  // Pages are pre-built as static HTML; only the /keystatic editor runs on the server.
  adapter: netlify(),
  // Netlify disables Node's require(ESM) support. Bundle this CommonJS → ESM
  // dependency boundary instead of leaving it for the function runtime to load.
  vite: { ssr: { noExternal: [
    'sanitize-html', 'htmlparser2', 'escape-string-regexp', 'is-plain-object',
    'domhandler', 'domutils', 'domelementtype', 'dom-serializer', 'entities',
    'launder', 'dayjs', 'parse-srcset', 'postcss', 'nanoid', 'picocolors', 'source-map-js',
  ] } },
  integrations: [react(), markdoc(), keystatic(), sitemap({ filter: (page) => !page.includes('/keystatic') && !page.includes('/studio') && !page.includes('/hobbynest') })],
  trailingSlash: 'ignore',
});
