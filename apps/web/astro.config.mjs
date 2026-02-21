// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: process.env.SITE_URL || 'http://localhost:4321',
  output: 'static',
  integrations: [sitemap()],
  image: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.yourdomain.com' },
      { protocol: 'http', hostname: 'localhost' },
    ],
  },
});
