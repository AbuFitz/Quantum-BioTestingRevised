// Browser verification against the production build (run `npm run build` first).
// Starts scripts/preview-server.mjs, drives Chromium, writes screenshots to verification/.
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';

const PORT = 4399, BASE = `http://localhost:${PORT}`;
const EXE = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const ROUTES = ['/', '/tests/', '/tests/mens-health-check/', '/tests/womens-health-check/', '/how-it-works/', '/contact/', '/privacy/', '/terms/', '/does-not-exist/'];
const VIEWPORTS = [[360, 740], [390, 844], [768, 1024], [1440, 900]];
mkdirSync('verification', { recursive: true });

const server = spawn('node', ['scripts/preview-server.mjs'], { env: { ...process.env, PORT }, stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 800));
const results = []; const fail = [];
const check = (name, ok, detail = '') => { results.push({ name, ok, detail }); if (!ok) fail.push(`${name} ${detail}`); };

const browser = await chromium.launch({ executablePath: EXE });
try {
  // 1. Every route at every width
  for (const [w, h] of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    for (const route of ROUTES) {
      const page = await ctx.newPage();
      const errors = []; const bad = [];
      page.on('console', (m) => m.type() === 'error' && !/404/.test(m.text() + route) && errors.push(m.text()));
      page.on('pageerror', (e) => errors.push(String(e)));
      page.on('response', (r) => { if (r.status() >= 400 && !route.includes('does-not-exist')) bad.push(`${r.status()} ${r.url()}`); });
      const resp = await page.goto(BASE + route, { waitUntil: 'networkidle' });
      const is404 = route.includes('does-not-exist');
      check(`${route} @${w} status`, is404 ? resp.status() === 404 : resp.status() === 200, String(resp.status()));
      const m = await page.evaluate(() => {
        const vw = innerWidth;
        const wide = [...document.querySelectorAll('body *')].filter((e) => { const r = e.getBoundingClientRect(); return r.width && r.right > vw + 1 && !e.closest('.table-wrap') && !e.closest('.close__rings') && !e.closest('.hero__photo'); }).map((e) => e.tagName + '.' + e.className).slice(0, 3);
        const small = [...document.querySelectorAll('a.btn, button, input:not([type=hidden]):not([type=radio]):not([type=checkbox]), select, textarea')].filter((e) => { const r = e.getBoundingClientRect(); return r.width && (r.height < 43.5) && !e.closest('.hp'); }).map((e) => e.tagName + ':' + (e.textContent || e.name).trim().slice(0, 20));
        return {
          overflow: document.documentElement.scrollWidth - vw, wide, small,
          h1: document.querySelectorAll('h1').length,
          noAlt: [...document.images].filter((i) => !i.hasAttribute('alt')).length,
          brokenImg: [...document.images].filter((i) => i.complete && i.naturalWidth === 0).length,
          fontOk: document.fonts.check('16px "Public Sans"'),
          title: document.title, desc: document.querySelector('meta[name=description]')?.content,
          canon: document.querySelector('link[rel=canonical]')?.href,
        };
      });
      check(`${route} @${w} no horizontal overflow`, m.overflow <= 0 && !m.wide.length, `${m.overflow} ${m.wide}`);
      check(`${route} @${w} touch targets >=44px`, !m.small.length, m.small.join(','));
      check(`${route} @${w} one h1`, m.h1 === 1, String(m.h1));
      check(`${route} @${w} images ok`, m.noAlt === 0 && m.brokenImg === 0);
      check(`${route} @${w} no console errors / failed requests`, !errors.length && !bad.length, [...errors, ...bad].join(' | '));
      if (w === 360) { check(`${route} title/description/canonical`, !!m.title && !!m.desc && m.canon?.startsWith('http'), `${m.title}`); check(`${route} font loaded`, m.fontOk); }
      const slug = route === '/' ? 'home' : route.replace(/\//g, '_').replace(/^_|_$/g, '');
      if (w !== 360) await page.screenshot({ path: `verification/${slug}-${w}.png`, fullPage: true });
      await page.close();
    }
    await ctx.close();
  }

  // 2. Brand assets actually load in the browser
  {
    const ctx = await browser.newContext(); const page = await ctx.newPage();
    const seen = {};
    page.on('response', (r) => { seen[new URL(r.url()).pathname] = [r.status(), r.headers()['content-type']]; });
    await page.goto(BASE + '/');
    const links = await page.evaluate(() => [...document.querySelectorAll('link[rel~=icon],link[rel=apple-touch-icon],link[rel=manifest],meta[property="og:image"]')].map((e) => e.href || e.content));
    for (const l of links) { const r = await ctx.request.get(l.replace(/^https?:\/\/[^/]+/, BASE)); check(`asset ${new URL(l).pathname}`, r.ok() && /image|manifest/.test(r.headers()['content-type'] || ''), `${r.status()}`); }
    check('favicon links declared', links.some((l) => l.endsWith('favicon.ico')) && links.some((l) => l.endsWith('apple-touch-icon.png')) && links.some((l) => l.endsWith('og-image.png')));
    for (const p of ['/robots.txt', '/sitemap.xml']) { const r = await ctx.request.get(BASE + p); check(p, r.ok(), `${r.status()}`); }
    const sm = await (await ctx.request.get(BASE + '/sitemap.xml')).text();
    check('sitemap lists 8 pages', (sm.match(/<loc>/g) || []).length === 8);
    await page.goto(BASE + '/tests/');
    const logo = await page.evaluate(() => { const i = document.querySelector('.brand img'); return [i.getBoundingClientRect().width, i.getBoundingClientRect().height, i.naturalWidth]; });
    check('header logo readable (>=150px wide, loaded)', logo[0] >= 150 && logo[2] > 0, logo.join('x'));
    await ctx.close();
  }

  // 3. Navigation and product journeys (desktop)
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } }); const page = await ctx.newPage();
    await page.goto(BASE + '/tests/');
    for (const [label, path] of [['How it works', '/how-it-works/'], ['Contact', '/contact/'], ['Tests', '/tests/']]) {
      await page.locator('.site-nav').getByRole('link', { name: label, exact: true }).click(); await page.waitForURL('**' + path);
      check(`nav → ${label}`, await page.locator(`.site-nav [aria-current=page]`).innerText() === label);
    }
    for (const [key, slug] of [['mens', 'mens-health-check'], ['womens', 'womens-health-check']]) {
      await page.goto(BASE + `/tests/${slug}/`);      await page.getByRole('link', { name: 'Enquire about this test' }).click(); await page.waitForURL(`**/contact/?test=${key}`);
      check(`${slug} enquire preselects product`, await page.locator(`input[name=test][value=${key}]`).isChecked());
    }
    // product pages separate: men's list not on women's page and vice versa
    await page.goto(BASE + '/tests/mens-health-check/'); const mensTxt = await page.locator('main').innerText();
    await page.goto(BASE + '/tests/womens-health-check/'); const womTxt = await page.locator('main').innerText();
    check('men’s page has Lipoprotein(a) not Allergy Evaluation', /Lipoprotein\(a\)/.test(await (await ctx.request.get(BASE + '/tests/mens-health-check/')).text()) && !/Allergy Evaluation/.test(mensTxt));
    check('women’s page has 27 areas and no men’s marker list', (await page.locator('.area-list li').count()) === 27 && !/Lipoprotein/.test(womTxt));
    // Marker groups: jump link opens group; expand all
    await page.goto(BASE + '/tests/mens-health-check/');
    check('11 marker groups', (await page.locator('details.group').count()) === 11);
    await page.getByRole('link', { name: 'Hormones', exact: true }).click();
    check('jump link opens its group', await page.locator('#hormones').evaluate((e) => e.open));
    await page.getByRole('button', { name: 'Expand all groups' }).click();
    check('expand all', (await page.locator('details.group[open]').count()) === 11);
    // FAQ
    await page.goto(BASE + '/how-it-works/'); const f = page.locator('.faq details').first(); await f.locator('summary').click();
    check('FAQ opens', await f.evaluate((e) => e.open));
    // prices consistent
    for (const r of ['/', '/tests/', '/tests/mens-health-check/', '/tests/womens-health-check/', '/terms/']) {
      const t = await (await ctx.request.get(BASE + r)).text(); const prices = [...new Set(t.match(/£\d[\d,]*\d|£\d/g) || [])].filter((p) => !['£50', '£75'].includes(p));
      check(`prices consistent ${r}`, prices.every((p) => ['£995', '£2,112'].includes(p)), prices.join(' '));
    }
    await ctx.close();
  }

  // 4. Mobile menu keyboard behaviour
  {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } }); const page = await ctx.newPage();
    await page.goto(BASE + '/tests/');
    const btn = page.getByRole('button', { name: 'Menu' });
    check('legacy mobile nav closed initially', !(await page.locator('#site-nav').isVisible()));
    await btn.click(); check('legacy menu opens', await page.locator('#site-nav').isVisible() && (await btn.getAttribute('aria-expanded')) === 'true');
    await page.keyboard.press('Escape');
    check('legacy Escape closes menu and returns focus', !(await page.locator('#site-nav').isVisible()) && await btn.evaluate((e) => e === document.activeElement));
    await btn.click(); await page.locator('#site-nav').getByRole('link', { name: 'How it works' }).click(); await page.waitForURL('**/how-it-works/');
    check('mobile menu link navigates', true);
    await ctx.close();
  }

  // 5. Enquiry form: validation, failure, duplicate guard, success, payload
  {
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } }); const page = await ctx.newPage();
    await page.goto(BASE + '/contact/');
    const html = await page.content();
    check('no date of birth field on form', !/birth|dob/i.test(html.replace(/<script[\s\S]*?<\/script>/g, '')) || false, 'form markup');
    await page.getByRole('button', { name: 'Send enquiry' }).click();
    const errs = await page.locator('.field__error:visible').allInnerTexts();
    check('empty submit shows 5 field errors', errs.length === 5, errs.join(' | '));
    check('focus moves to first invalid field', await page.evaluate(() => document.activeElement?.name === 'test'));
    await page.locator('input[name=test][value=mens]').check();
    await page.getByLabel('Full name').fill('Test Person'); await page.getByLabel('Phone number').fill('07700 900123');
    await page.getByLabel('Email address').fill('bad'); await page.getByRole('button', { name: 'Send enquiry' }).click();
    check('invalid email message', (await page.locator('#err-email').innerText()).includes('valid email'));
    await page.getByLabel('Email address').fill('test@example.com');
    await page.getByLabel(/I have read the/).check(); await page.getByLabel('Clinic or area').fill('Fulham');
    // (a) real local API, no delivery config → 503 failure state, nothing reported as sent
    await page.getByRole('button', { name: 'Send enquiry' }).click();
    await page.locator('#form-error:not([hidden])').waitFor();
    check('unconfigured delivery shows failure, not success', (await page.locator('#form-error').innerText()).includes('not been sent') && await page.locator('#form-success').isHidden());
    check('button re-enabled after failure', await page.getByRole('button', { name: 'Send enquiry' }).isEnabled());
    // (b) network failure
    await page.route('**/api/enquiry', (r) => r.abort());
    await page.getByRole('button', { name: 'Send enquiry' }).click();
    await page.waitForFunction(() => document.querySelector('[data-error-text]').textContent.includes('reach the server'));
    check('network failure state', true);
    await page.unroute('**/api/enquiry');
    // (c) mocked 200 — UI verification only; asserts duplicate guard + payload
    let calls = 0; let body;
    await page.route('**/api/enquiry', async (r) => { calls++; body = JSON.parse(r.request().postData()); await new Promise((x) => setTimeout(x, 400)); r.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }); });
    await page.getByRole('button', { name: 'Send enquiry' }).click();
    await page.getByRole('button', { name: /Sending/ }).click({ force: true, timeout: 500 }).catch(() => {});
    check('loading state disables button', await page.locator('[data-submit]').isDisabled());
    await page.locator('#form-success:not([hidden])').waitFor();
    check('duplicate submit prevented (one request)', calls === 1, String(calls));
    check('success wording says request, not booking', /not a confirmed booking/.test(await page.locator('#form-success').innerText()));
    check('payload has product, no DOB', body.test === 'mens' && !Object.keys(body).some((k) => /birth|dob/i.test(k)), Object.keys(body).join(','));
    await ctx.close();
  }

  // 6. Reduced motion and no storage / cookies
  {
    const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } }); const page = await ctx.newPage();
    await page.goto(BASE + '/how-it-works/'); await page.locator('.faq summary').first().click();
    const dur = await page.locator('.faq summary .icon').first().evaluate((e) => getComputedStyle(e).transitionDuration);
    check('reduced motion: transitions neutralised', parseFloat(dur) < 0.001, dur);
    check('no cookies set', (await ctx.cookies()).length === 0);
    check('no localStorage use', (await page.evaluate(() => localStorage.length)) === 0);
    // layout stability
    const cls = await page.evaluate(() => new Promise((res) => { let v = 0; new PerformanceObserver((l) => l.getEntries().forEach((e) => !e.hadRecentInput && (v += e.value))).observe({ type: 'layout-shift', buffered: true }); setTimeout(() => res(v), 500); }));
    check('layout shift < 0.05', cls < 0.05, String(cls));
    await ctx.close();
  }
} finally { await browser.close(); server.kill(); }

const pass = results.filter((r) => r.ok).length;
console.log(`${pass}/${results.length} checks passed`);
if (fail.length) { console.log('FAILURES:\n' + fail.join('\n')); process.exit(1); }
