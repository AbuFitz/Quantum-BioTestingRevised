// Site-wide verification against the production build (run `npm run build` first).
// Covers every route: layout at six widths, heading order, accessibility (axe), links and anchors,
// metadata, enquiry journeys and form states, keyboard, zoom, reduced motion, privacy behaviour.
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { spawn } from 'node:child_process';
import { readFileSync, mkdirSync } from 'node:fs';

const PORT = 4397, BASE = `http://localhost:${PORT}`;
const EXE = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const ROUTES = ['/', '/tests/', '/tests/mens-health-check/', '/tests/womens-health-check/', '/how-it-works/', '/contact/', '/privacy/', '/terms/'];
const WIDTHS = [[320, 640], [360, 740], [390, 844], [768, 1024], [1440, 900]];
mkdirSync('verification', { recursive: true });
const server = spawn('node', ['scripts/preview-server.mjs'], { env: { ...process.env, PORT }, stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 800));
const results = []; const fail = [];
const check = (n, ok, d = '') => { results.push(ok); if (!ok) fail.push(`${n} ${d}`); };
const browser = await chromium.launch({ executablePath: EXE });
const meta = {};
try {
  // 1. Layout, errors, headings, images, tap targets at every width
  for (const [w, h] of WIDTHS) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    for (const route of [...ROUTES, '/does-not-exist/']) {
      const page = await ctx.newPage(); const errs = []; const bad = [];
      page.on('console', (m) => m.type() === 'error' && !/404/.test(m.text()) && errs.push(m.text())); page.on('pageerror', (e) => errs.push(String(e)));
      page.on('response', (r) => { if (r.status() >= 400 && !route.includes('does-not-exist')) bad.push(`${r.status()} ${r.url()}`); });
      const resp = await page.goto(BASE + route, { waitUntil: 'networkidle' }); await page.waitForTimeout(400);
      const nf = route.includes('does-not-exist');
      check(`${route} @${w} status`, nf ? resp.status() === 404 : resp.status() === 200, String(resp.status()));
      const m = await page.evaluate(() => {
        const levels = [...document.querySelectorAll('h1,h2,h3,h4')].map((e) => +e.tagName[1]);
        let jump = false; for (let i = 1; i < levels.length; i++) if (levels[i] - levels[i - 1] > 1) jump = true;
        return {
          overflow: document.documentElement.scrollWidth - innerWidth, h1: document.querySelectorAll('h1').length, jump,
          noAlt: [...document.images].filter((i) => !i.hasAttribute('alt')).length, broken: [...document.images].filter((i) => i.complete && i.naturalWidth === 0).length,
          small: [...document.querySelectorAll('a.btn, button, input:not([type=hidden]):not([type=radio]):not([type=checkbox]), textarea')].filter((e) => { const r = e.getBoundingClientRect(); return r.width && r.height < 43.5 && !e.closest('.hp'); }).map((e) => (e.textContent || e.name || '').trim().slice(0, 24)),
          fonts: ['Bricolage', 'DM Sans'].every((f) => document.fonts.check(`16px "${f}"`)),
          title: document.title, desc: document.querySelector('meta[name=description]')?.content || '', canon: document.querySelector('link[rel=canonical]')?.href || '',
        };
      });
      check(`${route} @${w} no horizontal overflow`, m.overflow <= 0, String(m.overflow));
      check(`${route} @${w} one h1 and no skipped heading level`, m.h1 === 1 && !m.jump, `h1=${m.h1} jump=${m.jump}`);
      check(`${route} @${w} images have alt and load`, m.noAlt === 0 && m.broken === 0);
      check(`${route} @${w} tap targets >= 44px`, !m.small.length, m.small.join(','));
      check(`${route} @${w} no console errors or failed requests`, !errs.length && !bad.length, [...errs, ...bad].join(' | '));
      if (w === 390 && !nf) { check(`${route} fonts load`, m.fonts); meta[route] = m; }
      if (w === 1440 && !nf) await page.screenshot({ path: `verification/site-${route === '/' ? 'home' : route.replace(/\//g, '_').replace(/^_|_$/g, '')}-1440.png`, fullPage: true });
      await page.close();
    }
    await ctx.close();
  }
  // 2. Metadata uniqueness
  const titles = Object.values(meta).map((m) => m.title), descs = Object.values(meta).map((m) => m.desc);
  check('every page has a unique title', new Set(titles).size === titles.length && titles.every((t) => t.length > 10 && t.length < 75), titles.join(' | '));
  check('every page has a unique description (50–180 chars)', new Set(descs).size === descs.length && descs.every((d) => d.length >= 50 && d.length <= 180), descs.map((d) => d.length).join(','));
  check('every page has an absolute canonical matching its route', Object.entries(meta).every(([r, m]) => m.canon.startsWith('http') && m.canon.endsWith(r)));

  // 3. Accessibility with axe (WCAG 2.2 AA tags), phone and desktop
  for (const [w, h] of [[390, 844], [1440, 900]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    for (const route of ROUTES) {
      const page = await ctx.newPage(); await page.goto(BASE + route, { waitUntil: 'networkidle' }); await page.waitForTimeout(500);
      await page.evaluate(() => document.querySelectorAll('[data-reveal]').forEach((e) => e.classList.add('is-in'))); await page.waitForTimeout(1600);
      const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']).analyze();
      check(`axe ${route} @${w}`, r.violations.length === 0, r.violations.map((v) => `${v.id}(${v.nodes.length}): ${v.nodes[0].target}`).join(' | '));
      await page.close();
    }
    await ctx.close();
  }

  // 4. Links and anchors across the whole site
  {
    const ctx = await browser.newContext(); const page = await ctx.newPage(); const hrefs = new Set(); const ids = {};
    for (const r of ROUTES) {
      await page.goto(BASE + r);
      ids[r] = await page.evaluate(() => [...document.querySelectorAll('[id]')].map((e) => e.id));
      (await page.evaluate(() => [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')))).forEach((h) => hrefs.add(`${r}|${h}`));
    }
    let dead = [];
    for (const entry of hrefs) {
      const [from, href] = entry.split('|');
      if (/^(mailto:|tel:|https?:)/.test(href)) continue;
      if (href === '#' || href === '') { dead.push(`${from} -> empty ${href}`); continue; }
      const u = new URL(href, BASE + from); const path = u.pathname;
      const res = await ctx.request.get(BASE + path);
      if (!res.ok()) dead.push(`${from} -> ${href} (${res.status()})`);
      else if (u.hash && !(ids[path] || []).includes(decodeURIComponent(u.hash.slice(1)))) dead.push(`${from} -> ${href} (missing anchor)`);
    }
    check(`all ${hrefs.size} internal links and anchors resolve, none empty`, dead.length === 0, dead.slice(0, 6).join(' | '));
    const ext = [...hrefs].map((e) => e.split('|')[1]).filter((h) => /^https?:/.test(h));
    check('external links are limited to the ICO', ext.every((h) => /ico\.org\.uk/.test(h)), ext.join(','));
    await ctx.close();
  }

  // 5. Assets, sitemap, robots, redirects, structured data
  {
    const ctx = await browser.newContext(); const page = await ctx.newPage(); await page.goto(BASE + '/');
    for (const p of ['/favicon.ico', '/favicon-32.png', '/icon-192.png', '/apple-touch-icon.png', '/og-image.png', '/site.webmanifest', '/robots.txt', '/sitemap.xml']) { const r = await ctx.request.get(BASE + p); check(`asset ${p}`, r.ok(), String(r.status())); }
    const sm = await (await ctx.request.get(BASE + '/sitemap.xml')).text();
    check('sitemap lists every page', ROUTES.every((r) => sm.includes(`<loc>`) && sm.includes(r === '/' ? '.app/</loc>' : r + '</loc>') || sm.includes(r + '</loc>')) && (sm.match(/<loc>/g) || []).length === ROUTES.length);
    const vj = JSON.parse(readFileSync('vercel.json', 'utf8'));
    check('legacy routes redirect to existing pages', vj.redirects.every((x) => x.permanent && ROUTES.includes(x.destination)), JSON.stringify(vj.redirects.map((x) => x.source)));
    const ldOf = async (r) => { await page.goto(BASE + r); return page.locator('script[type="application/ld+json"]').allInnerTexts(); };
    const home = await ldOf('/'); check('home structured data is Organization only', home.length === 1 && /"Organization"/.test(home[0]) && !/review|rating|telephone|address/i.test(home[0]));
    for (const r of ['/tests/mens-health-check/', '/tests/womens-health-check/']) { const l = await ldOf(r); check(`${r} structured data is a Service with the agreed price`, l.length === 1 && /"Service"/.test(l[0]) && /"price":"995"/.test(l[0]) && /GBP/.test(l[0])); }
    for (const r of ROUTES) { const t = await (await ctx.request.get(BASE + r)).text(); const prices = [...new Set(t.replace(/<script[\s\S]*?<\/script>/g, '').match(/£\d(?:[\d,]*\d)?/g) || [])].filter((p) => !['£50', '£75'].includes(p)); check(`prices consistent ${r}`, prices.every((p) => ['£995', '£2,112'].includes(p)), prices.join(' ')); }
    await ctx.close();
  }

  // 6. Navigation, product journeys and marker pages
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } }); const page = await ctx.newPage();
    await page.goto(BASE + '/');
    for (const [label, path] of [['Tests', '/tests/'], ['How it works', '/how-it-works/'], ['Contact', '/contact/'], ['Home', '/']]) {
      await page.locator('.hdr__nav').getByRole('link', { name: label, exact: true }).click(); await page.waitForURL('**' + path);
      check(`nav → ${label} marks current page`, (await page.locator('.hdr__nav [aria-current=page]').innerText()) === label);
    }
    for (const [key, slug] of [['mens', 'mens-health-check'], ['womens', 'womens-health-check']]) {
      for (const [from, sel] of [['/', `#t-${key}`], ['/tests/', `#t-${key}`]]) {
        await page.goto(BASE + from); await page.locator(sel).locator('xpath=ancestor::article').getByRole('link', { name: /^Enquire/ }).click(); await page.waitForURL(`**/contact/?test=${key}`);
        check(`${from} ${key} enquire preselects the product`, await page.locator(`input[name=test][value=${key}]`).isChecked());
      }
      await page.goto(BASE + `/tests/${slug}/`); await page.getByRole('link', { name: 'Enquire about this test' }).click(); await page.waitForURL(`**/contact/?test=${key}`);
      check(`${slug} enquire preselects the product`, await page.locator(`input[name=test][value=${key}]`).isChecked());
      await page.goto(BASE + `/tests/${slug}/`); await page.locator('.banner__actions a').nth(key === 'mens' ? 0 : 1).click(); await page.waitForURL(`**/contact/?test=${key}`);
      check(`${slug} closing enquiry preselects the product`, await page.locator(`input[name=test][value=${key}]`).isChecked());
    }
    await page.goto(BASE + '/tests/mens-health-check/'); const mens = await page.locator('main').innerText();
    await page.goto(BASE + '/tests/womens-health-check/'); const wom = await page.locator('main').innerText();
    check('men’s page lists markers and not the women’s areas', /Cardiovascular/.test(mens) && !/Allergy Evaluation/.test(mens));
    check('women’s page has 27 areas and not the men’s marker list', (await page.locator('.area-list li').count()) === 27 && !/Cardiovascular/.test(wom));
    await page.goto(BASE + '/tests/mens-health-check/'); check('11 marker groups', (await page.locator('details.group').count()) === 11);
    await page.getByRole('link', { name: 'Hormones', exact: true }).click(); check('jump link opens its group', await page.locator('#hormones').evaluate((e) => e.open));
    await page.getByRole('button', { name: 'Expand all groups' }).click(); check('expand all opens every group', (await page.locator('details.group[open]').count()) === 11);
    await page.goto(BASE + '/how-it-works/'); const d = page.locator('.faq details').first(); await d.locator('summary').click(); check('FAQ opens', await d.evaluate((e) => e.open));
    await ctx.close();
  }

  // 7. Enquiry form: validation, states, duplicate guard, payload
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } }); const page = await ctx.newPage();
    await page.goto(BASE + '/contact/');
    const html = (await page.content()).replace(/<script[\s\S]*?<\/script>/g, '');
    check('no date of birth field on the form', !/birth|dob/i.test(html));
    await page.getByRole('button', { name: 'Send enquiry' }).click();
    check('empty submit shows five field errors', (await page.locator('.field__error:visible').count()) === 5);
    check('focus moves to the first invalid field', await page.evaluate(() => document.activeElement?.name === 'test'));
    await page.locator('input[name=test][value=mens]').check(); await page.getByLabel('Full name').fill('Test Person'); await page.getByLabel('Phone number').fill('07700 900123');
    await page.getByLabel('Email address').fill('bad'); await page.getByRole('button', { name: 'Send enquiry' }).click();
    check('invalid email message', (await page.locator('#err-email').innerText()).includes('valid email'));
    await page.getByLabel('Email address').fill('test@example.com'); await page.getByLabel(/I have read the/).check(); await page.getByLabel('Clinic or area').fill('Fulham');
    await page.getByRole('button', { name: 'Send enquiry' }).click(); await page.locator('#form-error:not([hidden])').waitFor();
    check('unconfigured delivery shows failure, never success', (await page.locator('#form-error').innerText()).includes('not been sent') && await page.locator('#form-success').isHidden());
    check('button usable again after failure', await page.getByRole('button', { name: 'Send enquiry' }).isEnabled());
    await page.route('**/api/enquiry', (r) => r.abort()); await page.getByRole('button', { name: 'Send enquiry' }).click();
    await page.waitForFunction(() => document.querySelector('[data-error-text]').textContent.includes('reach the server')); check('network failure state', true); await page.unroute('**/api/enquiry');
    let calls = 0; let body;
    await page.route('**/api/enquiry', async (r) => { calls++; body = JSON.parse(r.request().postData()); await new Promise((x) => setTimeout(x, 400)); r.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }); });
    await page.getByRole('button', { name: 'Send enquiry' }).click(); await page.getByRole('button', { name: /Sending/ }).click({ force: true, timeout: 500 }).catch(() => {});
    check('loading state disables the button', await page.locator('[data-submit]').isDisabled());
    await page.locator('#form-success:not([hidden])').waitFor();
    check('duplicate submission prevented (one request)', calls === 1, String(calls));
    check('success wording says request, not booking', /not a confirmed booking/.test(await page.locator('#form-success').innerText()));
    check('payload carries the product and no date of birth', body.test === 'mens' && !Object.keys(body).some((k) => /birth|dob/i.test(k)), Object.keys(body).join(','));
    await ctx.close();
  }

  // 8. Keyboard, focus, mobile menu
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } }); const page = await ctx.newPage();
    for (const r of ROUTES) {
      await page.goto(BASE + r); await page.keyboard.press('Tab');
      const first = await page.evaluate(() => document.activeElement.className); check(`${r} skip link is the first focus stop`, /skip/.test(first), first);
    }
    await page.goto(BASE + '/contact/'); for (let i = 0; i < 4; i++) await page.keyboard.press('Tab');
    check('visible focus ring (>= 2px)', await page.evaluate(() => { const s = getComputedStyle(document.activeElement); return s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) >= 2; }));
    await page.close(); const m = await ctx.newPage(); await m.setViewportSize({ width: 390, height: 844 }); await m.goto(BASE + '/tests/', { waitUntil: 'networkidle' });
    const btn = m.getByRole('button', { name: /menu/i }); check('mobile nav closed initially', !(await m.locator('#menu').isVisible()));
    await btn.click(); check('menu opens', (await btn.getAttribute('aria-expanded')) === 'true' && await m.locator('#menu').isVisible());
    await m.keyboard.press('Escape'); check('Escape closes the menu and returns focus', !(await m.locator('#menu').isVisible()) && await btn.evaluate((e) => e === document.activeElement));
    await btn.click(); await m.locator('#menu').getByRole('link', { name: 'How it works' }).click(); await m.waitForURL('**/how-it-works/'); check('menu link navigates', true);
    await ctx.close();
  }

  // 9. 200% zoom equivalent, reduced motion, privacy, layout stability
  {
    const ctx = await browser.newContext({ viewport: { width: 720, height: 450 } }); const page = await ctx.newPage();
    for (const r of ROUTES) { await page.goto(BASE + r, { waitUntil: 'networkidle' }); check(`${r} reflows at 200% zoom (no horizontal scroll)`, (await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 0); }
    await ctx.close();
    const rm = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } }); const p = await rm.newPage();
    await p.goto(BASE + '/', { waitUntil: 'networkidle' });
    const st = await p.evaluate(() => ({ anim: getComputedStyle(document.querySelector('.hero__bg img')).animationName, rev: [...document.querySelectorAll('[data-reveal]')].every((e) => getComputedStyle(e).opacity === '1') }));
    check('reduced motion: no hero animation, all content visible', st.anim === 'none' && st.rev, JSON.stringify(st));
    check('no cookies and no localStorage', (await rm.cookies()).length === 0 && (await p.evaluate(() => localStorage.length)) === 0);
    const cls = await p.evaluate(() => new Promise((res) => { let v = 0; new PerformanceObserver((l) => l.getEntries().forEach((e) => !e.hadRecentInput && (v += e.value))).observe({ type: 'layout-shift', buffered: true }); setTimeout(() => res(v), 700); })); check('layout shift < 0.05 on home', cls < 0.05, String(cls));
    await rm.close();
    const nj = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 } }); const q = await nj.newPage();
    for (const r of ['/', '/tests/']) { await q.goto(BASE + r); check(`${r} without JS: navigation and content visible`, await q.evaluate(() => getComputedStyle(document.querySelector('#menu')).display !== 'none' && [...document.querySelectorAll('[data-reveal]')].every((e) => getComputedStyle(e).transform === 'none'))); }
    await nj.close();
  }
} finally { await browser.close(); server.kill(); }
console.log(`${results.filter(Boolean).length}/${results.length} checks passed`);
if (fail.length) { console.log('FAILURES:\n' + fail.join('\n')); process.exit(1); }
