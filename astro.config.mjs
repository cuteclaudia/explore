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
  integrations: [react(), markdoc(), keystatic(), sitemap({ filter: (page) => !page.includes('/keystatic') })],
  trailingSlash: 'ignore',
});
