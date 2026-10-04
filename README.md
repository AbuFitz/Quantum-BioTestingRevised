# Quantum BioTesting website

Astro static site (no client framework) plus one Vercel serverless function for enquiry delivery.

```
npm install
npm run dev          # local development
npm run build        # production build to dist/
npm run preview      # serves dist/ and mounts /api/enquiry (as Vercel does)
npm test             # enquiry function tests
npm run verify       # browser checks against the build (Chromium via Playwright)
npm run assets       # regenerate logo crops and favicons from brand/source
```

- Content: `src/data/site.ts` (price, nav), `src/data/tests.ts` (tests, steps, FAQs, clinics), `src/data/mens-markers.json` (men's marker groups).
- Design tokens and components: `src/styles/global.css`, `src/components/`. Icons are Lucide (`lucide-static`), inlined at build time.
- Photos: `src/assets/photos/` (provisional; replace files in place).
- Environment: see `.env.example`. Without the three delivery variables the form reports that the enquiry was not sent.
- Browser verification expects Chromium at `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`; override with `CHROMIUM_PATH`.
- Evidence ledger, launch dependencies and verification notes: `HANDOVER.md`. Screenshots: `docs/screenshots/`.
