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
Astro static site + one Vercel function; Fraunces + Plus Jakarta Sans; dedicated enquiry page instead of a modal; Resend as the email provider (see below); "Enquire" as the single CTA label; canonical defaults to the Vercel URL.

**Provisional (new in this pass)**
Clinic addresses (carried over from the old site, unconfirmed); the saving figure £1,117 is derived from the client-supplied price and RRP (the client has confirmed the RRP is genuine); the map pin positions are approximate; the legal pages' retention periods, controller details and clinical statements are carried over from the old site and need legal review; acknowledgement email wording; the "Illustrative photograph" captions were removed at the client's request, so the stock photographs (gloved hand with a blood tube, beach walk) now appear without that label; the reception-wall image was supplied by the client and looks like a rendered mock-up, so confirm its origin and that it may represent the business; the blood-tube photograph is only 1024 px wide (rawpixel, CC0) and should be replaced with commissioned photography.

**Blocking for launch**
1. **Enquiry destination and provider.** Set `RESEND_API_KEY`, `ENQUIRY_TO`, `ENQUIRY_FROM` (verified sender domain) in Vercel. Until then `/api/enquiry` returns 503 and the form says the enquiry has not been sent. Swap `api/enquiry.js` if the client prefers another provider.
2. **Confirmed contact route.** No phone or email is published. Privacy/Terms direct rights requests, cancellations and complaints to the enquiry form as an interim; replace with real addresses.
3. **Legal review** of Privacy and Terms (refund tiers leave 48 h–3 days undefined; £50/£75 fees, retention periods, GMC wording, eligibility, jurisdiction) and the "Last updated" date.
4. **Photography licence.** The hero photograph (`visit.jpg`) is carried over from the old repo with no source or licence record. Replace it or document the rights. The other photographs are CC0 (see `brand/photo-sources/PROVENANCE.md`). Swap by replacing the files in `src/assets/photos/` (same names).
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
| `/clinics/`, `/clinics/{fulham,canary-wharf,chiswick,westfield-stratford,birmingham}/` | Clinic finder and one local page per clinic, each with address, a self-drawn city map, both tests, FAQ and schema |
| `/how-it-works/` | Process, preparation, clinics, results, FAQs |
| `/contact/` | Full-page enquiry form: the no-JavaScript fallback and deep link (`?test=mens\|womens&clinic=Name` preselects). Not in the navigation by request; linked from the footer |
| `/privacy/`, `/terms/`, `/cookies/` | Legal, linked from the footer |
| `/api/enquiry` | Delivery function |
| `/sitemap.xml`, `/robots.txt` | Generated from the configured domain (sitemap lists every page above) |

Old public routes redirect (301) via `vercel.json`: `/testing.html` to `/tests/`, `/privacy.html`, `/terms.html`, `/index.html`, `/book.html`.

## Design decisions at the client's direction

- The warm blush paper background (`#fbf3ef`) is kept, as the client confirmed it was what they asked for (a white version was tried and reverted).
- All buttons are outlines: red primary, blue secondary, white on photographs, soft blue and soft pink for the two checks.
- The "Two health checks" section keeps its original layout (a tag strip on each card, then the three highlight boxes) but is coloured soft blue for the Men's check and soft pink for the Women's check, outlined rather than filled.
- No top banner.
- The reception-wall image supplied by the client sits in the preparation section; the example-evening timeline moved to How it works.
- The client briefly asked to return to the version with the clock (`301fcc0`, via `002bc4b`), then asked for the card, map and timeline improvements back; this branch now contains both sets of changes (the card and map work from `0a25fa2` plus the outline, white and pink/blue changes).

## Enquiry popup

On desktop it is a split card: a blue panel on the left reassures (no GP referral, reply by email, not a booking until confirmed) and the stepped form sits on the right with a three-segment progress indicator; the card keeps one height across steps so nothing jumps. On phones it is a bottom sheet without the side panel. Every Enquire button and any link to `/contact/` opens a native `<dialog>` with a three-step form (check, contact details, preferences and consent) when JavaScript is available; without it the link goes to `/contact/`. It is a bottom sheet on phones and a centred card on larger screens, validates per step, keeps what was typed when going back, closes with Escape, the close button, the backdrop or the browser Back button, and returns focus to the button that opened it. Choosing a check (from a button or a card) starts on step 2. The same form component and the same `/api/enquiry` function serve the popup and `/contact/`.

## Emails

Two plain emails per enquiry, no marketing content: a team notification (check, name, email, phone, clinic, date, notes; reply goes to the customer) and a short acknowledgement to the customer (first name, what they asked for, "this isn't a confirmed booking yet", reply goes to the team). The acknowledgement is best effort: if it fails the enquiry still succeeds because the team already has it. Both use distinct idempotency keys. Subject lines and bodies avoid dashes and filler. **Needs client approval of the wording and a verified sending domain.**

## SEO

One `<h1>` per page, unique titles and descriptions, absolute canonicals, sitemap and robots, Open Graph image. Structured data: Organization and FAQPage (home), BreadcrumbList on every inner page, FAQPage (home, how it works, each clinic page), Service with the agreed price (test pages), ItemList (clinic finder) and MedicalBusiness with the postal address (clinic pages). No ratings, reviews, phone numbers, opening hours or coordinates are published because none have been supplied. The Men's and Women's checks are presented as separate products, not compared against each other, so there is no comparison table. Clinic pages are written around the clinic's own address, area and FAQs; the content is deliberately plain so it stays true. Internal links: homepage clinic list, footer clinics column, clinic pages link to both tests and to each other, test pages link to clinics.

## Privacy and cookie behaviour as implemented

No cookies, no `localStorage`, no analytics and no third-party requests of any kind (fonts self-hosted). The city maps on the home page, the clinic finder and each clinic page are drawn as inline SVG by `CityMap.astro`, so they contact no one and need no consent. Pin positions come from approximate coordinates in `src/data/clinics.ts` and the map is labelled "schematic, not to scale"; the coordinates are never published as structured data. Each clinic page also links to Google Maps and directions as ordinary links that open in a new tab. Because nothing needs consent, there is no cookie banner, and `/cookies/` and the Privacy Policy say so. If analytics are ever added, add a consent banner and update both pages.

## Edits to legal text (for the reviewer)

Privacy: removed ICO-registration, UKAS/CQC wording and unverifiable security claims; removed cookie/analytics/marketing-consent sections that described behaviour the site does not have; date of birth is no longer listed as collected by the website form; contact route changed to the form. Terms: removed UKAS/ISO warranty, card-payment and VAT-exemption statements, email/telephone cancellation and complaint routes; wording on enquiry vs booking made explicit.

## Brand assets

Source retained untouched at `brand/source/quantum-logo-source.png` (2000×2000 RGBA; artwork occupies 1398×384 px). `npm run assets` crops, without altering artwork, to: `logo-wordmark.png` (header/footer, tagline excluded so it does not set header height), `logo-lockup.png` (wordmark plus benefits line, kept for reuse, not used on the site because the line carries claims), `logo-q.png`, favicons (16/32/48 `.ico`, 32 and 192/512 PNG), Apple touch icon (180, white background). `npm run` + `node scripts/make-social-image.mjs` renders the 1200×630 social image. All raster: no vector artwork was supplied. The logo's baked-in "Quick results / 300+ Markers" line is the client's artwork; it is flagged as a claim to confirm.

## Typography

Fraunces (display headlines, big figures, legal headings) and Plus Jakarta Sans (text, controls, prices, card headings), both SIL OFL, axis-limited and subset to Latin by `scripts/subset-fonts.py` (about 57 KB for both), preloaded, with metric-matched fallbacks. Chosen to match the client's references (BioClin pairs Fraunces with a clean sans; Medichecks uses Plus Jakarta Sans); see `docs/design-research.md`. Bricolage Grotesque, DM Sans, Newsreader, Figtree and Public Sans (earlier passes) are no longer used and their files are removed.

**Accepted risk:** the Greek letter ε in "APOE ε2/ε3/ε4" (men's marker list) is in neither typeface and falls back to the system sans-serif. It is a single glyph on one page.

# Delivered design: BioClin and Medichecks patterns (all pages)

Built at the client's request from two reference sites, replacing every earlier theme completely (earlier themes are recoverable from git). A floating pill navigation (BioClin) sits straight on the hero and expands inside itself on phones; there is no top banner. The homepage runs: full-bleed hero with both test buttons and a four-item feature strip; two equal product cards (Medichecks anatomy: tag strip, name, description, biomarkers, results time, price, buttons); a feature trio; a deep blue journey chapter with the four visit steps and a photograph; an icon grid of what every test includes; a preparation split; FAQ rows; a rounded photographic banner with both tests as buttons; a light footer. What was adopted and what was deliberately not copied is in `docs/design-research.md`.

**Structure.** One stylesheet (`src/styles/site.css`), one layout (`src/layouts/Base.astro`), shared components in `src/components/` (Header, Footer, Intro, TestCards, Journey, Tips, FaqSection, CloseEnquiry, MarkerGroups, LegalLayout, EnquiryForm). Content lives in `src/data/`. Every page is built from the same components, so the test cards, the visit steps, the FAQ and the closing banner are identical wherever they appear.

**Photography.** Hero: the client's clinician-and-patient photograph. Preparation split and closing banner: CC0 StockSnap images, graded into the palette (`scripts/make-photo-assets.mjs`; greens and teals pulled toward the logo blue and red). Journey chapter (home and How it works): the client's "clinician explaining results" photograph. Sources, licences and the gaps are in `brand/photo-sources/PROVENANCE.md`. The two client photographs have no licence record; the StockSnap files are 960 px, the largest obtainable without an account. All are captioned or described as illustrative.

## Release evidence (production build)

| Area | Evidence | Status |
|---|---|---|
| Build, types, unit tests | `astro build`, `astro check` (0 errors, 0 warnings), 9 enquiry-function tests | pass |
| Layout | all 8 pages plus 404 at 320, 360, 390, 768 and 1440 px: no horizontal overflow (a 2 px overflow at 320 px in the header was fixed), one h1, no skipped heading level, images load with alt text, controls at least 44 px | pass |
| Accessibility | axe (WCAG 2.0/2.1/2.2 A and AA plus best-practice) on all 8 pages at 390 and 1440 px: no violations; skip link first on every page; visible focus; mobile menu opens, closes on Escape and returns focus | pass (fixed one) |
| Reflow and zoom | every page at a 720×450 viewport (a 200% zoom of 1440×900): no horizontal scroll | pass |
| Contrast | every text and background pairing of the palette checked against WCAG AA (`verify-home.mjs`) | pass |
| Performance (Lighthouse, mobile profile) | 12 pages measured (home, tests, both test pages, clinics, two clinic pages, how it works, contact, privacy, terms, cookies): 99–100 for performance and 100 for accessibility, best practices and SEO; CLS 0; TBT 0 ms; LCP 1.7–2.1 s (limit 2.5 s). Stylesheet inlined to remove a render-blocking request | pass |
| Links | every internal link and anchor resolves (no empty or `#` links); the only external link is the ICO | pass |
| Metadata | unique titles and descriptions, absolute canonicals, sitemap lists all 8 pages, robots, favicon set, Apple touch icon, social image all load; structured data is Organization (home) and Service with the agreed price (test pages) only | pass |
| Legacy routes | `vercel.json` 301s `/testing.html`, `/privacy.html`, `/terms.html`, `/index.html`, `/book.html` to existing pages (config checked; redirects run on Vercel, not in the local preview) | pass (config), untested on Vercel |
| Enquiry journeys | every Enquire button (home, tests, product pages, closing section) preselects the right test; product pages show only their own details; validation, loading, failure, duplicate-submit guard and success wording; no date of birth in the form or payload | pass |
| Privacy | no cookies, no storage, no third-party requests; works without JavaScript | pass |
| Fonts | glyph coverage of both subsets checked against every character on the site; `©` was missing and is fixed; ε is accepted (above) | pass (fixed one), one accepted risk |
| Real enquiry delivery | needs `RESEND_API_KEY`, `ENQUIRY_TO`, `ENQUIRY_FROM`; no email has been sent from this build | **blocked** (client input) |
| Content truth | provisional facts listed in the ledger above (marker counts and lists, turnaround, GP consultation and repeat test, clinic addresses, photo rights) | **blocked** (client confirmation) |

Run them with `npm run verify` (all pages, about 10 minutes because of the axe scans), `npm run verify:home` (homepage detail, 88 checks; the full run is now 682 checks) and `npm test`. Lighthouse was run separately against `scripts/preview-server.mjs`.
