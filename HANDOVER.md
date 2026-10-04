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
Astro static site + one Vercel function; Public Sans; dedicated enquiry page instead of a modal; Resend as the email provider (see below); "Enquire" as the single CTA label; canonical defaults to the Vercel URL.

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

Public Sans (variable, SIL OFL), Latin subset, one preloaded WOFF2, metric-matched fallback. Chosen after rendering real headline, price, paragraph, nav and button specimens of Figtree, Public Sans, Hanken Grotesk, Albert Sans and Onest: Public Sans had the clearest numerals (`£995`, `HbA1c`) and the calmest institutional proportions. H1 maximum 40px, body 17px.


---

# Design pass 3: identity v3, "a good local" (homepage only, awaiting approval)

Supersedes the pass-2 "clear sample" direction (recoverable from git: commit `7d608e5`). Only `/` uses the new theme (`src/layouts/BaseV3.astro`, `src/styles/v3.css`, `src/components/v3/`); every other page still uses the pass-1 system until the direction is approved. Business, evidence and integration dependencies above are unchanged. Research and reasoning: `docs/design-research.md`.

**Thesis.** Quantum should feel like a good independent neighbourhood business: somewhere you would be comfortable walking into, with taste, and obvious about what to do next. Warmth comes from people-first photography, plain language and composition; the logo's blue anchors it (headlines, buttons, one full colour chapter), with tints of the logo's own two inks as the supporting palette: pale blue (`#dce6f6`) and blush (`#f8ddd6`) for the two test panels, and the logo red (`#b02018`) as the closing chapter and the small accents. The blue/blush pairing is a colour choice, not a message; both panels carry identical content and can be unified if preferred. Photographs are graded (`scripts/make-photo-assets.mjs`) so greens and teals sit inside the blue/red palette.

**Typography.** Bricolage Grotesque (headlines, prices, menu) and DM Sans (text, controls), SIL OFL, pinned and subset by `scripts/subset-fonts.py` (80 KB total). Hero up to 90 px, h2 up to 58 px.

**Photography.** Hero: the client's own clinician-and-patient photograph (restored, arch crop, warm grade). Everyday life: CC0 StockSnap images for the two tests, the visit chapter, the breather and the preparation section. See `brand/photo-sources/PROVENANCE.md`. The client's photograph has no licence record in the old repository; the StockSnap files are 960 px, the largest obtainable without an account. All are described as illustrative.

**Homepage flow (mobile first).** A deliberately compact hero (about 450 px on a phone, 400 px on desktop: headline, one sentence, one button, three short facts and a short photograph), then both tests as equal colour-coded choices (price and enquiry on each, markers behind "See what is tested"), the visit explained in four steps, a short preparation section (full guide on How it works), five FAQs, and a closing enquiry for either test.

**Verification:** `npm run verify:home` (92 checks, including hero height limits: WCAG contrast of every text/background pairing, five widths, tap targets, one-row header, equal test columns, product preselection from both choice buttons and the closing buttons, keyboard and focus, mobile menu with Escape, reduced motion, no-JS, assets, layout shift). `npm run verify` covers the other pages.
