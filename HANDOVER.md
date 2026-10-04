# Quantum BioTesting — handover

Repositories: **NEW** (this one, implementation) · **OLD** `AbuFitz/Quantum-BioTesting` (source of copy, assets, history) · **SKILL** `AbuFitz/onesimplesite-web-designer` (workflow; Essential gear, professional/service archetype).

## What was found in the old repository

- Live site `quantum-bio-testing.vercel.app` is byte-identical to the old repo's HEAD, a rebuild made on 30 Sept 2026 by an AI session on top of the owner's April–May history. No source business document (price list, laboratory menu, accreditation certificate, contact sheet) exists in any commit.
- **Enquiry delivery: none.** `site.js` POSTs only if `data-endpoint` is set on the form, and it was never set; otherwise it showed "Enquiry received" client-side. Earlier versions did the same (`setTimeout`-style success). No form service, mailbox, CRM or scheduler was ever wired. Previous "success" screens were not evidence of delivery.
- Contact details conflict across history and are placeholders: `hello@`/`bookings@quantumbt.co.uk`, `info@`/`legal@`/`dpo@quantumbiotesting.co.uk`, phones `0800 123 4567`, `0123 456 7890`, `01494 000 000`. None is published.

## Fact ledger

**Verified (client brief)**
- £995 per test; RRP £2,112 per test (`src/data/site.ts` is the only place written; build check confirms no other figure appears on priced pages).
- Product names: Men's Health Check, Women's Health Check.
- Supplied logo; blue `#013275` and red sampled from it.
- Only confirmed deployment: `https://quantum-bio-testing.vercel.app`.

**Provisional — client-published, shipped, but no source evidence found (confirm before launch)**
- Men's "300+ biomarkers, 11 groups"; Women's "up to 350, 27 health areas". The logo itself carries "300+ Markers". The men's list is exactly 300 line items but only 277 unique, and earlier men's category counts summed to 204.
- Marker names, carried verbatim from the live `testing.html` (per-group counts, "advanced" flags and an NHS-comparison note were not carried over). Quality issues to resolve with the laboratory: items that are not blood markers ("Blood Pressure Assessment", "Resting Heart Rate", "Thyroid Function (full panel)"); female-specific markers in the men's list (CA-125, HE4, ROMA, AMH, oestrogens, Beta-HCG); duplicated items across groups.
- Turnaround 2–5 working days (men), 4 (women); express "from 2 hours, ask the team". Earlier versions said 48–72 h / 48 h.
- Clinician review of results; Women's private remote GP consultation and 6-month repeat test; Men's optional follow-up telephone consultation (conflicts with Terms §9, which scope consultations to Women's only, so it is worded as "ask the team").
- "About 15 minutes" appointment, "no GP referral required", preparation guidance.
- Five clinic addresses (Fulham, Canary Wharf, Chiswick, Westfield Stratford, Birmingham): from the owner's April commit "real clinic addresses"; not independently verified. The old booking form's 15-city list is not used.
- Legal text (Privacy, Terms): carried from the old pages with edits listed below. Needs legal review.

**Withheld from public copy (unsupported or conflicting)**
UKAS / ISO 15189 / RIQAS / GCP / CQC / ICO-registration claims; "40+ clinics", "145+ countries", "7-day availability"; "most comprehensive in the UK"; NHS comparison table (15–20 markers, 1–3 weeks); "was £2,000 / save £1,005" (superseded by the supplied RRP); "cancel up to 48 hours before" (conflicts with the Terms tiers); express-results as a headline claim; Men's APOE/autoimmune notes that refer to a physician consultation men are not stated to receive; card-payment and VAT-exemption statements in Terms.

**Inferred (reversible decisions)**
Astro static site + one Vercel function; Bricolage Grotesque + DM Sans; dedicated enquiry page instead of a modal; Resend as the email provider (see below); "Enquire" as the single CTA label; canonical defaults to the Vercel URL.

**Blocking for launch**
1. **Enquiry destination and provider.** Set `RESEND_API_KEY`, `ENQUIRY_TO`, `ENQUIRY_FROM` (verified sender domain) in Vercel. Until then `/api/enquiry` returns 503 and the form says the enquiry has not been sent. Swap `api/enquiry.js` if the client prefers another provider.
2. **Confirmed contact route.** No phone or email is published. Privacy/Terms direct rights requests, cancellations and complaints to the enquiry form as an interim; replace with real addresses.
3. **Legal review** of Privacy and Terms (refund tiers leave 48 h–3 days undefined; £50/£75 fees, retention periods, GMC wording, eligibility, jurisdiction) and the "Last updated" date.
4. **Photography licence.** `sample-collection.webp` and `report-review.webp` are carried over from the old repo as temporary stock-style images with no source or licence record, captioned "Illustrative photograph". Replace or document rights. Swap by replacing the files in `src/assets/photos/` (same names).
5. **Marker lists, counts and turnaround** confirmed against laboratory documentation (see provisional list).
6. **Production domain.** Set `PUBLIC_SITE_URL` when the final domain is confirmed (drives canonical, sitemap, robots, social tags).
7. Company number / registered address, if wanted in the footer and legal pages.

## Delivery: what is and is not verified

- Verified: validation, loading, failure (503 unconfigured, network abort, 422 field errors), duplicate-submit guard, product preselection, no DOB field or payload, success state wording. `tests/enquiry.test.mjs` covers the function against a mocked provider (success only when the provider accepts, idempotency key, 502 on rejection).
- **Not verified:** real delivery. No credentials or destination were available, so no email has been sent from this build. The success screen is only shown after the API returns 200, which only happens after the provider accepts the message. Test with a real key before launch.
- Spam control is a honeypot field only; add rate limiting or a CAPTCHA if abuse appears. Preferred date is a request; no scheduling integration exists.

## Route map

| Route | Purpose |
|---|---|
| `/` | Home |
| `/tests/`, `/tests/mens-health-check/`, `/tests/womens-health-check/` | Overview and per-product detail |
| `/how-it-works/` | Process, preparation, clinic, results, FAQs |
| `/contact/` | Appointment enquiry (`?test=mens\|womens` preselects) |
| `/privacy/`, `/terms/` | Legal, linked from the footer |
| `/api/enquiry` | Delivery function |
| `/sitemap.xml`, `/robots.txt` | Generated from the configured domain |

Old public routes redirect (301) via `vercel.json`: `/testing.html` → `/tests/`, `/privacy.html`, `/terms.html`, `/index.html`, `/book.html`.

## Privacy and cookie behaviour as implemented

No cookies, no `localStorage`, no analytics, no third-party requests (font self-hosted). Hence no cookie banner, and the Privacy Policy says so. Adding analytics later requires updating the policy and adding consent.

## Edits to legal text (for the reviewer)

Privacy: removed ICO-registration, UKAS/CQC wording and unverifiable security claims; removed cookie/analytics/marketing-consent sections that described behaviour the site does not have; date of birth is no longer listed as collected by the website form; contact route changed to the form. Terms: removed UKAS/ISO warranty, card-payment and VAT-exemption statements, email/telephone cancellation and complaint routes; wording on enquiry vs booking made explicit.

## Brand assets

Source retained untouched at `brand/source/quantum-logo-source.png` (2000×2000 RGBA; artwork occupies 1398×384 px). `npm run assets` crops, without altering artwork, to: `logo-wordmark.png` (header/footer, tagline excluded so it does not set header height), `logo-lockup.png` (wordmark plus benefits line, kept for reuse, not used on the site because the line carries claims), `logo-q.png`, favicons (16/32/48 `.ico`, 32 and 192/512 PNG), Apple touch icon (180, white background). `npm run` + `node scripts/make-social-image.mjs` renders the 1200×630 social image. All raster: no vector artwork was supplied. The logo's baked-in "Quick results / 300+ Markers" line is the client's artwork; it is flagged as a claim to confirm.

## Typography

Bricolage Grotesque (headlines, prices, offer names, menu) and DM Sans (text and controls), both SIL OFL, axis-limited and subset to Latin by `scripts/subset-fonts.py` (about 82 KB for both), preloaded, with metric-matched fallbacks. Chosen after rendering the real headline, prices and mobile menu in six display faces and three text faces; see `docs/design-research.md`. Newsreader and Figtree (an earlier pass) and Public Sans (the first pass) are no longer used.

**Accepted risk:** the Greek letter ε in "APOE ε2/ε3/ε4" (men's marker list) is in neither typeface and falls back to the system sans-serif. It is a single glyph on one page.

# Delivered design: "a good local" (all pages)

A welcoming, people-first identity: warm cream paper, the logo's blue for headlines, buttons and one full colour chapter, pale blue and blush tints (from the logo's blue and red) for the two tests, the Q's red as the accent and the closing chapter, arches and circles drawn from the Q, and warm graded photography. It replaced earlier proposals (first-pass clinical theme, "clear sample", and a "menu-style" recomposition that was reverted at the client's request; all recoverable from git).

**Structure.** One stylesheet (`src/styles/site.css`), one layout (`src/layouts/Base.astro`), shared components in `src/components/` (Header, Footer, Intro, OfferPanels, VisitChapter, Tips, FaqSection, CloseEnquiry, MarkerGroups, LegalLayout, EnquiryForm). Content lives in `src/data/`. Every page is built from the same components, so the offers, the visit steps, the FAQ and the closing enquiry are identical wherever they appear. The homepage keeps a compact hero with a full-width test choice straight after it.

**Photography.** Hero: the client's clinician-and-patient photograph. People photography for the two tests, the visit chapter and the closing section: CC0 StockSnap images, graded into the palette (`scripts/make-photo-assets.mjs`; greens and teals pulled toward the logo blue and red). How it works: the client's "clinician explaining results" photograph. Sources, licences and the gaps are in `brand/photo-sources/PROVENANCE.md`. The two client photographs have no licence record; the StockSnap files are 960 px, the largest obtainable without an account. All are captioned or described as illustrative.

## Release evidence (production build)

| Area | Evidence | Status |
|---|---|---|
| Build, types, unit tests | `astro build`, `astro check` (0 errors, 0 warnings), 9 enquiry-function tests | pass |
| Layout | all 8 pages plus 404 at 320, 360, 390, 768 and 1440 px: no horizontal overflow, one h1, no skipped heading level, images load with alt text, controls at least 44 px | pass |
| Accessibility | axe (WCAG 2.0/2.1/2.2 A and AA plus best-practice) on all 8 pages at 390 and 1440 px: no violations after a duplicate region name on `/tests/` was fixed; skip link first on every page; visible focus; mobile menu opens, closes on Escape and returns focus | pass (fixed one) |
| Reflow and zoom | every page at a 720×450 viewport (a 200% zoom of 1440×900): no horizontal scroll | pass |
| Contrast | every text and background pairing of the palette checked against WCAG AA (`verify-home.mjs`) | pass |
| Performance (Lighthouse, mobile profile) | all pages 99–100 for performance, accessibility, best practices and SEO; CLS 0; TBT 0 ms; LCP 1.7–2.2 s (limit 2.5 s). Stylesheet inlined to remove a render-blocking request | pass |
| Links | every internal link and anchor resolves (no empty or `#` links); the only external link is the ICO | pass |
| Metadata | unique titles and descriptions, absolute canonicals, sitemap lists all 8 pages, robots, favicon set, Apple touch icon, social image all load; structured data is Organization (home) and Service with the agreed price (test pages) only | pass |
| Legacy routes | `vercel.json` 301s `/testing.html`, `/privacy.html`, `/terms.html`, `/index.html`, `/book.html` to existing pages (config checked; redirects run on Vercel, not in the local preview) | pass (config), untested on Vercel |
| Enquiry journeys | every Enquire button (home, tests, product pages, closing section) preselects the right test; product pages show only their own details; validation, loading, failure, duplicate-submit guard and success wording; no date of birth in the form or payload | pass |
| Privacy | no cookies, no storage, no third-party requests; works without JavaScript | pass |
| Fonts | glyph coverage of both subsets checked against every character on the site; `©` was missing and is fixed; ε is accepted (above) | pass (fixed one), one accepted risk |
| Real enquiry delivery | needs `RESEND_API_KEY`, `ENQUIRY_TO`, `ENQUIRY_FROM`; no email has been sent from this build | **blocked** (client input) |
| Content truth | provisional facts listed in the ledger above (marker counts and lists, turnaround, GP consultation and repeat test, clinic addresses, photo rights) | **blocked** (client confirmation) |

Run them with `npm run verify` (all pages, about 6 minutes because of the axe scans), `npm run verify:home` (homepage detail, 92 checks) and `npm test`. Lighthouse was run separately against `scripts/preview-server.mjs`.
