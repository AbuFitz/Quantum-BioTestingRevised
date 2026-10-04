// Browser verification of the v2 homepage against the production build.
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

// WCAG contrast
const lum = (h) => { const c = [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
for (const [name, fg, bg, min] of [
  ['ink on cream', '#0e1b33', '#fbf8f2', 7], ['secondary on cream', '#48546b', '#fbf8f2', 4.5], ['blue on cream (prices, links)', '#013275', '#fbf8f2', 7], ['red on cream (small accents)', '#b02018', '#fbf8f2', 4.5],
  ['ink on sand', '#0e1b33', '#f3ede2', 7], ['secondary on sand', '#48546b', '#f3ede2', 4.5], ['blue on sand', '#013275', '#f3ede2', 7],
  ['white on blue', '#ffffff', '#013275', 7], ['pale on blue', '#d7e3f6', '#013275', 4.5], ['blue on cream (buttons in blue chapter)', '#013275', '#fbf8f2', 7],
  ['white on blue button', '#ffffff', '#013275', 7], ['white on ink (button hover)', '#ffffff', '#0e1b33', 7],
]) check(`contrast ${name}`, ratio(fg, bg) >= min, ratio(fg, bg).toFixed(2));

const browser = await chromium.launch({ executablePath: EXE });
try {
  for (const [w, h] of [[360, 740], [390, 844], [768, 1024], [1440, 900], [1920, 1080]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } }); const page = await ctx.newPage();
    const errs = []; const bad = [];
    page.on('console', (m) => m.type() === 'error' && errs.push(m.text())); page.on('pageerror', (e) => errs.push(String(e)));
    page.on('response', (r) => r.status() >= 400 && bad.push(`${r.status()} ${r.url()}`));
    await page.goto(BASE + '/', { waitUntil: 'networkidle' }); await page.waitForTimeout(2200);
    const m = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - innerWidth,
      h1: document.querySelectorAll('h1').length,
      fonts: ['Bricolage', 'DM Sans'].map((f) => document.fonts.check(`16px "${f}"`)),
      brokenImg: [...document.images].filter((i) => i.complete && i.naturalWidth === 0).length,
      small: [...document.querySelectorAll('a.btn, button')].filter((e) => e.getBoundingClientRect().width && e.getBoundingClientRect().height < 43.5).map((e) => e.textContent.trim()),
      h1Size: parseFloat(getComputedStyle(document.querySelector('h1')).fontSize),
      logoW: document.querySelector('.hdr__brand img').getBoundingClientRect().width,
      headerBottom: document.querySelector('.hdr').getBoundingClientRect().bottom,
      testsTop: document.querySelector('#choose').getBoundingClientRect().top,
      cardTops: [...document.querySelectorAll('.offer')].map((e) => Math.round(e.getBoundingClientRect().top)),
      cardW: [...document.querySelectorAll('.offer')].map((e) => Math.round(e.getBoundingClientRect().width)),
      jump: [...document.querySelectorAll('.hero__jump a')].map((e) => { const r = e.getBoundingClientRect(); return [Math.round(r.top), Math.round(r.bottom), r.width > 0]; }),
      offerNameTop: [...document.querySelectorAll('.offer__top')].map((e) => Math.round(e.getBoundingClientRect().top)),
      heroH: document.querySelector('.hero').getBoundingClientRect().height,
      hdrOneRow: document.querySelector('.hdr').getBoundingClientRect().height < 90,
    }));
    check(`@${w} no horizontal overflow`, m.overflow <= 0, String(m.overflow));
    check(`@${w} one h1, fonts loaded, images ok`, m.h1 === 1 && m.fonts.every(Boolean) && !m.brokenImg, JSON.stringify(m.fonts));
    check(`@${w} tap targets >=44px`, !m.small.length, m.small.join());
    check(`@${w} logo readable (>=140px)`, m.logoW >= 140, String(m.logoW));
    check(`@${w} header on one row`, m.hdrOneRow);
    check(`@${w} hero is compact (<= 480 desktop, <= 520 tablet, <= 640 phone incl. both test shortcuts)`, m.heroH <= (w >= 992 ? 480 : w >= 768 ? 520 : 640), String(Math.round(m.heroH)));
    check(`@${w} no console errors / failed requests`, !errs.length && !bad.length, [...errs, ...bad].join(' | '));
    if (w >= 768) check(`@${w} offers heading starts within the first viewport`, m.testsTop < h - 150, String(m.testsTop));
    if (w < 768) check(`@${w} both tests (name and price) are reachable in the first screen`, m.jump.length === 2 && m.jump.every(([t, b, vis]) => vis && b < h), JSON.stringify(m.jump));
    if (w >= 768) check(`@${w} first offer entry begins within the first viewport`, m.offerNameTop[0] < h, JSON.stringify(m.offerNameTop));
    if (w >= 768) check(`@${w} two tests sit side by side at equal width`, Math.abs(m.cardW[0] - m.cardW[1]) <= 2, JSON.stringify(m.cardW));
    if (w < 768) check(`@${w} two entries stack at the same width`, m.cardW[0] === m.cardW[1] && m.cardTops[1] > m.cardTops[0], JSON.stringify([m.cardW, m.cardTops]));
    await page.screenshot({ path: `verification/v4-home-${w}-fold.png` });
    await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 400) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 90)); } scrollTo(0, 0); });
    await page.waitForTimeout(900);
    if (w !== 360) await page.screenshot({ path: `verification/v4-home-${w}.png`, fullPage: true });
    await ctx.close();
  }

  // Journeys, desktop
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } }); const page = await ctx.newPage();
    await page.goto(BASE + '/', { waitUntil: 'networkidle' });
    await page.locator('.hero__actions .btn').click(); await page.waitForTimeout(400);
    check('hero button jumps to the offers', page.url().endsWith('#choose') && (await page.locator('#choose').boundingBox()).y < 200, page.url());
    for (const key of ['mens', 'womens']) {
      await page.goto(BASE + '/'); await page.locator(`#t-${key} a.btn`).click();
      await page.waitForURL(`**/contact/?test=${key}`); check(`${key} enquire carries product to the form`, await page.locator(`input[name=test][value=${key}]`).isChecked());
      await page.goto(BASE + '/'); await page.locator('.enquire__actions a').nth(key === 'mens' ? 0 : 1).click(); await page.waitForURL(`**/contact/?test=${key}`);
      check(`${key} closing enquiry carries product`, await page.locator(`input[name=test][value=${key}]`).isChecked());
    }
    await page.goto(BASE + '/'); await page.locator('#t-mens a.link').click(); await page.waitForURL('**/tests/mens-health-check/'); check('see-what-is-tested opens the men’s page', true);
    await page.goto(BASE + '/'); await page.getByRole('link', { name: 'Full preparation guide' }).click(); await page.waitForURL('**/how-it-works/#preparation'); check('preparation guide link works', true);
    await page.goto(BASE + '/'); const d = page.locator('.faq details').first(); await d.locator('summary').click(); check('FAQ opens', await d.evaluate((e) => e.open));
    await page.keyboard.press('Tab');
    const prices = [...new Set((await page.locator('main').innerText()).match(/£\d(?:[\d,]*\d)?/g))]; check('only agreed prices on the page', prices.every((p) => ['£995', '£2,112'].includes(p)), prices.join(' '));
    const ld = await page.locator('script[type="application/ld+json"]').allInnerTexts(); check('structured data limited to supported facts (Organization)', ld.length === 1 && /"Organization"/.test(ld[0]) && !/review|rating|telephone|address/i.test(ld[0]));
    await page.goto(BASE + '/'); await page.keyboard.press('Tab'); const skip = await page.evaluate(() => document.activeElement.className); check('skip link is first focus stop', /skip/.test(skip), skip);
    await page.keyboard.press('Tab'); await page.keyboard.press('Tab'); const fo = await page.evaluate(() => { const s = getComputedStyle(document.activeElement); return s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) >= 2; }); check('visible focus ring', fo);
    // assets
    for (const p of ['/favicon.ico', '/favicon-32.png', '/apple-touch-icon.png', '/og-image.png', '/site.webmanifest']) { const r = await ctx.request.get(BASE + p); check(`asset ${p}`, r.ok(), String(r.status())); }
    await ctx.close();
  }
  // Phone: hero shortcuts reach each offer and both offers can be enquired about
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } }); const page = await ctx.newPage();
    await page.goto(BASE + '/', { waitUntil: 'networkidle' });
    await page.locator('.hero__jump a').nth(1).click(); await page.waitForTimeout(500);
    check('phone shortcut jumps to the Women’s entry', page.url().endsWith('#t-womens') && (await page.locator('#t-womens').boundingBox()).y < 140, page.url());
    await ctx.close();
  }
  // Mobile menu
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } }); const page = await ctx.newPage();
    await page.goto(BASE + '/', { waitUntil: 'networkidle' });
    const btn = page.getByRole('button', { name: 'Menu' });
    check('mobile nav closed', !(await page.locator('#nav').isVisible()));
    await btn.click(); check('menu opens', (await btn.getAttribute('aria-expanded')) === 'true' && await page.locator('#nav').isVisible());
    await page.screenshot({ path: 'verification/v4-home-390-menu.png' });
    await page.keyboard.press('Escape'); check('Escape closes and returns focus', !(await page.locator('#nav').isVisible()) && await btn.evaluate((e) => e === document.activeElement));
    await btn.click(); await page.locator('#nav').getByRole('link', { name: 'Tests' }).click(); await page.waitForURL('**/tests/'); check('menu link navigates', true);
    await ctx.close();
  }
  // Reduced motion + stability
  {
    const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } }); const page = await ctx.newPage();
    await page.goto(BASE + '/', { waitUntil: 'networkidle' });
    const st = await page.evaluate(() => ({ photo: getComputedStyle(document.querySelector('.hero__photo img')).animationName, rev: [...document.querySelectorAll('[data-reveal]')].every((e) => getComputedStyle(e).opacity === '1') }));
    check('reduced motion: no hero animation, all content visible', st.photo === 'none' && st.rev, JSON.stringify(st));
    check('no cookies or storage', (await ctx.cookies()).length === 0 && (await page.evaluate(() => localStorage.length)) === 0);
    const cls = await page.evaluate(() => new Promise((res) => { let v = 0; new PerformanceObserver((l) => l.getEntries().forEach((e) => !e.hadRecentInput && (v += e.value))).observe({ type: 'layout-shift', buffered: true }); setTimeout(() => res(v), 600); })); check('layout shift < 0.05', cls < 0.05, String(cls));
    await ctx.close();
  }
  // No-JS: content and navigation remain
  {
    const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } }); const page = await ctx.newPage();
    await page.goto(BASE + '/'); const vis = await page.evaluate(() => [...document.querySelectorAll('[data-reveal]')].every((e) => getComputedStyle(e).opacity === '1') && getComputedStyle(document.querySelector('#nav')).display !== 'none');
    check('without JS: all content and navigation visible', vis);
    await ctx.close();
  }
} finally { await browser.close(); server.kill(); }
console.log(`${results.filter(Boolean).length}/${results.length} checks passed`);
if (fail.length) { console.log('FAILURES:\n' + fail.join('\n')); process.exit(1); }
