import { defineConfig } from 'astro/config';

// Production canonical origin. The only confirmed deployment is the Vercel URL of the
// existing site; override with PUBLIC_SITE_URL once the final domain is confirmed.
const site = process.env.PUBLIC_SITE_URL || 'https://quantum-bio-testing.vercel.app';

export default defineConfig({
  site,
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'auto' },
  devToolbar: { enabled: false },
});
