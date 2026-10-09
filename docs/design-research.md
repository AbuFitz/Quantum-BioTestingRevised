# Design research: direction v5 (BioClin and Medichecks patterns)

**Brief.** The client dropped the earlier theme completely and asked for a site built with heavy influence from two references they rate: BioClin (bioclin.co.uk) for the navigation, type and overall feel, and Medichecks (medichecks.com) for the way products, trust and information are laid out. Quantum keeps its own logo, blue-and-red identity and truthful content.

**Method (skill: research-discovery).** For each reference, record what is being adopted and what must not be copied. Patterns, proportions, type roles and component behaviour are adopted. Code, brand, wording, illustration and photography are not. Observations come from the client's screenshots and the pages' public HTML and CSS (fetched as text; the live sites could not be rendered in the sandbox).

## What was taken from each

| Reference | Observed | Adopted for Quantum | Deliberately not copied |
|---|---|---|---|
| **BioClin** | Floating pill navigation over the hero (paper at 95%, blur, soft shadow, logo left, centred text links, rounded action right); on mobile the menu expands inside the rounded container into a cream list; Fraunces display type with Inter text; full-bleed hero with a feature strip; trio of colour feature cards; deep colour "journey" chapter with numbered steps and a photograph; icon grid; FAQ rows; rounded photographic CTA banner; light footer; teal/mint/blush palette | The pill navigation and its mobile expansion, Fraunces display type, hero-with-feature-strip, feature trio, deep journey chapter, icon grid, FAQ rows, rounded photo banner, light footer | Its teal palette, logo, wording, illustrations and photographs; exact composition |
| **Medichecks** | Announcement bar (not adopted in the end); Plus Jakarta Sans; navy `#01183A`; bold pink action button; product cards with a tag strip, name, description, results time, biomarker count, price and a Select button; trust strip; split text/photo sections; dark footer | The announcement bar, Plus Jakarta Sans for text and headings in cards, product-card anatomy for the two tests, a single bold action colour, navy for the bar | Its pink and teal, its categories, its basket/account/search furniture (Quantum has no accounts or basket), its wording |

## Typefaces
**Fraunces** (variable, optical size and soft axes, SIL OFL) for display headlines, big figures and legal headings. **Plus Jakarta Sans** (variable, SIL OFL) for text, controls, prices and card headings. Both axis-limited and subset to Latin (about 57 KB together), self-hosted with metric-matched fallbacks. Inter (BioClin's text face) was replaced by Plus Jakarta Sans so one text face serves both reference patterns.

## Palette (roles)
Warm blush paper (`#fbf3ef`) canvas with white on alternating sections · **logo blue `#013275`** for the deep chapter and secondary actions · **the Q's red `#b02018`** for the primary outline button and accents · soft blue (`#e6eefa`, outline `#5b86c9`) for the Men's check and soft pink (`#fbe9f0`, outline `#d58aa9`) for the Women's check, outlined and tinted rather than filled. Every button is an outline.

## Photography
Hero: the client's clinician-and-patient photograph under a navy gradient. Journey chapter: the client's "clinician explaining results" photograph. Preparation split: a CC0 image of cutting an orange. Closing banner: a CC0 beach walk, graded into the palette. All are captioned or described as illustrative. Provenance: `brand/photo-sources/PROVENANCE.md`.

## Shapes and motion
Pill buttons and pill navigation, 20–28px rounded cards, bottom-rounded hero. Motion is limited to a slow hero settle, a quiet reveal on scroll, button and card hover, and the menu expanding; all disabled for reduced motion.
