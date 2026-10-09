// Browser verification of the homepage (design v5) against the production build.
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const PORT = 4398, BASE = `http://localhost:${PORT}`;
const EXE = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
mkdirSync('verification', { recursive: true });
const server = spawn('node', ['scripts/preview-server.mjs'], { env: { ...process.env, PORT }, stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 800));
const results = []; const fail = [];
const check = (n, ok, d = '') => { results.push(ok); if (!ok) fail.push(`${n} ${d}`); };

// WCAG contrast for the colour pairs the design actually uses
const lum = (h) => { const c = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const PAPER = '#fbf3ef', BLUSH = '#f6e5e0', SKY = '#e3edf9', WHITE = '#ffffff';
for (const [name, fg, bg, min] of [
  ['ink on paper', '#0f1d36', PAPER, 7], ['muted on paper', '#4b5870', PAPER, 4.5], ['muted on white', '#4b5870', WHITE, 4.5], ['muted on blush', '#4b5870', BLUSH, 4.5],
  ['blue on paper', '#013275', PAPER, 7], ['blue on white', '#013275', WHITE, 7], ['blue on sky', '#013275', SKY, 7],
  ['white on red (button)', '#ffffff', '#b02018', 4.5], ['white on red-dark (hover)', '#ffffff', '#8f1a13', 4.5],
  ['white on blue', '#ffffff', '#013275', 7], ['pale on blue', '#d6e3f6', '#013275', 4.5],
  ['men ink on men tint', '#17407f', '#e6eefa', 7], ['women ink on women tint', '#8f2f55', '#fbe9f0', 6.5], ['men blue on white (outline button)', '#1f4f9c', '#ffffff', 7], ['women rose on white (outline button)', '#a63a65', '#ffffff', 5], ['red on white (primary outline)', '#b02018', '#ffffff', 4.5], ['muted on tint', '#4b5870', '#f5f8fc', 4.5], ['white on blue-dark (hover)', '#ffffff', '#00225a', 7],
  ['blue on white (light button)', '#013275', WHITE, 7], ['red on white (price strike)', '#b02018', WHITE, 4.5],
  ['white on red (feature card)', '#ffffff', '#b02018', 4.5],
]) check(`contrast ${name}`, ratio(fg, bg) >= min, ratio(fg, bg).toFixed(2));

const browser = await chromium.launch({ executablePath: EXE });
try {
  for (const [w, h] of [[360, 740], [390, 844], [768, 1024], [1440, 900], [1920, 1080]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } }); const page = await ctx.newPage();
    const errors = []; page.on('console', (m) => m.type() === 'error' && errors.push(m.text())); page.on('pageerror', (e) => errors.push(String(e)));
    await page.goto(BASE + '/', { waitUntil: 'networkidle' });
    const tag = `@${w}`;
    check(`no horizontal overflow ${tag}`, (await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 0);
    check(`no console errors ${tag}`, errors.length === 0, errors.join(' | '));
    check(`one h1 ${tag}`, (await page.locator('h1').count()) === 1);
    check(`no top banner and the floating pill is present ${tag}`, (await page.locator('.announce').count()) === 0 && (await page.locator('.hdr__pill').isVisible()));
    const filled = await page.evaluate(() => [...document.querySelectorAll('.btn')].filter((b) => b.offsetParent && b.getBoundingClientRect().width).filter((b) => { const m = getComputedStyle(b).backgroundColor.match(/[\d.]+/g) || []; return m.length < 4 ? (m[0] !== undefined && !(+m[0] > 250 && +m[1] > 250 && +m[2] > 250)) : +m[3] > 0.1; }).map((b) => b.textContent.trim().slice(0, 30)));
    check(`every button is an outline (no filled buttons) ${tag}`, filled.length === 0, filled.join(' | '));
    const bc = await page.evaluate(() => [...document.querySelectorAll('.card')].map((c) => getComputedStyle(c).borderTopColor));
    check(`men's card outline is blue and women's is pink ${tag}`, bc.length === 2 && bc[0] === 'rgb(91, 134, 201)' && bc[1] === 'rgb(213, 138, 169)', bc.join(' / '));
    check(`page background is the warm paper colour ${tag}`, (await page.evaluate(() => getComputedStyle(document.body).backgroundColor)) === 'rgb(251, 243, 239)');
    // Both tests reachable in the first viewport, with equal prominence
    const men = page.locator('.hero__actions a[href$="test=mens"]'), wom = page.locator('.hero__actions a[href$="test=womens"]');
    const inView = async (l) => { const b = await l.boundingBox(); return !!b && b.y + b.height <= h && b.y >= 0; };
    check(`both test buttons visible in first viewport ${tag}`, (await inView(men)) && (await inView(wom)));
    const [mb, wb] = [await men.boundingBox(), await wom.boundingBox()];
    check(`hero buttons have equal size ${tag}`, Math.abs(mb.height - wb.height) < 1 && Math.abs(mb.width - wb.width) < 40, `${mb.width}x${mb.height} vs ${wb.width}x${wb.height}`);
    // Product cards are equal
    const cards = await page.locator('.card').evaluateAll((els) => els.map((e) => { const r = e.getBoundingClientRect(); return [r.width, r.height]; }));
    check(`two product cards ${tag}`, cards.length === 2);
    if (w >= 768) check(`product cards equal size ${tag}`, Math.abs(cards[0][0] - cards[1][0]) < 1 && Math.abs(cards[0][1] - cards[1][1]) < 2, JSON.stringify(cards));
    const text = await page.locator('main').innerText();
    const prices = [...new Set(text.match(/£\d(?:[\d,]*\d)?/g) || [])];
    check(`prices consistent ${tag}`, prices.every((p) => ['£995', '£2,112', '£1,117'].includes(p)) && prices.includes('£995') && prices.includes('£2,112'), prices.join(' '));
    check(`no date-of-birth or invented contact claims ${tag}`, !/date of birth|\bdob\b|customer reviews|star rating|trustpilot|\d{5} ?\d{5,6}|accredit/i.test(text));
    // Fonts actually loaded
    const fonts = await page.evaluate(async () => { await document.fonts.ready; return [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family.replace(/"/g, '')); });
    check(`display and text fonts loaded ${tag}`, fonts.includes('Fraunces') && fonts.includes('Jakarta'), fonts.join(','));
    const h1font = await page.evaluate(() => getComputedStyle(document.querySelector('h1')).fontFamily);
    check(`h1 uses Fraunces ${tag}`, /Fraunces/.test(h1font), h1font);
    // Tap targets and images
    const small = await page.evaluate(() => [...document.querySelectorAll('main a.btn, header a.btn, header button, .faq summary')].filter((e) => { const r = e.getBoundingClientRect(); return r.width && (r.height < 40 || r.width < 40); }).length);
    check(`controls at least 40px ${tag}`, small === 0, String(small));
    const broken = await page.evaluate(() => [...document.images].filter((i) => i.complete && i.naturalWidth === 0).length);
    check(`no broken images ${tag}`, broken === 0);
    await page.screenshot({ path: `verification/home-${w}.png`, fullPage: true });
    await ctx.close();
  }

  // Mobile menu expands inside the pill
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } }); const page = await ctx.newPage();
    await page.goto(BASE + '/', { waitUntil: 'networkidle' });
    const pill = page.locator('.hdr__pill'); const before = (await pill.boundingBox()).height;
    const btn = page.getByRole('button', { name: /menu/i });
    check('menu panel collapsed and inert until opened', (await page.locator('#menu').boundingBox()).height < 1 && (await page.locator('#menu').getAttribute('inert')) !== null);
    await btn.click(); await page.waitForTimeout(450);
    const after = (await pill.boundingBox()).height;
    check('menu grows the pill and lists four links', after > before + 100 && (await page.locator('.hdr__list a').count()) === 4, `${before} → ${after}`);
    await page.keyboard.press('Escape'); await page.waitForTimeout(450);
    check('escape closes the menu', (await pill.boundingBox()).height <= before + 1);
    await ctx.close();
  }

  // Sticky pill stays in view after scrolling
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } }); const page = await ctx.newPage();
    await page.goto(BASE + '/', { waitUntil: 'networkidle' });
    await page.evaluate(() => scrollTo(0, 1800)); await page.waitForTimeout(300);
    const b = await page.locator('.hdr__pill').boundingBox();
    check('floating navigation stays visible on scroll', b && b.y >= 0 && b.y < 80, JSON.stringify(b));
    await ctx.close();
  }
} finally {
  await browser.close(); server.kill();
}
console.log(`${results.filter(Boolean).length}/${results.length} checks passed`);
if (fail.length) { console.log('FAILED:\n' + fail.join('\n')); process.exit(1); }
