// Quick answers helper: appearance, behaviour, keyboard and accessibility on phone and desktop.
import { chromium } from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
const PORT = 4397, BASE = `http://localhost:${PORT}`;
const EXE = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
mkdirSync('verification', { recursive: true });
const server = spawn('node', ['scripts/preview-server.mjs'], { env: { ...process.env, PORT }, stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 800));
const out = []; const fail = [];
const check = (n, ok, d = '') => { out.push(ok); if (!ok) fail.push(`${n} ${d}`); };
const browser = await chromium.launch({ executablePath: EXE });
try {
  for (const [w, h, touch] of [[320, 640, true], [390, 844, true], [768, 1024, false], [1440, 900, false]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: touch, isMobile: touch });
    const page = await ctx.newPage(); const t = `@${w}`;
    const errors = []; page.on('pageerror', (e) => errors.push(String(e)));
    await page.goto(BASE + '/', { waitUntil: 'networkidle' });
    const fab = page.locator('.assist__fab');
    check(`launcher visible bottom right ${t}`, await fab.isVisible());
    const fb = await fab.boundingBox();
    check(`launcher is at least 44px tall and inside the viewport ${t}`, fb.height >= 44 && fb.x + fb.width <= w + 0.5 && fb.y + fb.height <= h + 0.5, JSON.stringify(fb));
    check(`launcher sits to the right ${t}`, fb.x + fb.width > w - 40);
    await fab.click(); await page.waitForTimeout(500);
    const panel = page.locator('.assist__panel');
    check(`panel opens and launcher tucks away ${t}`, (await panel.isVisible()) && !(await fab.isVisible()) && (await fab.getAttribute('aria-expanded')) === 'true');
    const pb = await panel.boundingBox();
    check(`panel fits the screen ${t}`, pb.x >= -0.5 && pb.x + pb.width <= w + 0.5 && pb.y >= 0 && pb.y + pb.height <= h + 0.5, JSON.stringify(pb));
    check(`no horizontal overflow with panel open ${t}`, (await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 0);
    check(`greeting and six topic chips ${t}`, (await page.locator('.assist__msg--bot').count()) === 1 && (await page.locator('.assist__chip').count()) === 6);
    const small = await page.evaluate(() => [...document.querySelectorAll('.assist button, .assist__input')].filter((e) => { const r = e.getBoundingClientRect(); return r.width && (r.height < 44 || r.width < 44); }).map((e) => e.className));
    check(`every control is at least 44px ${t}`, small.length === 0, small.join(','));
    const fs = await page.locator('.assist__input').evaluate((e) => parseFloat(getComputedStyle(e).fontSize));
    check(`input is 16px so phones do not zoom ${t}`, fs >= 16);
    await page.screenshot({ path: `verification/assist-open-${w}.png` });
    // chip -> answer with the consistent price
    await page.locator('.assist__chip', { hasText: 'Price' }).click(); await page.waitForTimeout(500);
    const last = await page.locator('.assist__msg--bot').last().innerText();
    check(`price answer is consistent ${t}`, /£995/.test(last) && /£2,112/.test(last) && /£1,117/.test(last) && !/£\d/.test(last.replace(/£995|£2,112|£1,117/g, '')), last.slice(0, 80));
    check(`follow-up chips update ${t}`, (await page.locator('.assist__chip').count()) === 3);
    // typed question
    await page.locator('.assist__input').fill('Do I need to fast?'); await page.keyboard.press('Enter'); await page.waitForTimeout(500);
    check(`typed question finds the preparation answer ${t}`, /fast for 8 to 12 hours/.test(await page.locator('.assist__msg--bot').last().innerText()));
    await page.locator('.assist__input').fill('xyzzy gibberish'); await page.keyboard.press('Enter'); await page.waitForTimeout(500);
    check(`unknown question falls back to an enquiry, not an invented answer ${t}`, /send us an enquiry/.test(await page.locator('.assist__msg--bot').last().innerText()));
    await page.locator('.assist__input').fill('I have chest pain'); await page.keyboard.press('Enter'); await page.waitForTimeout(500);
    check(`unwell question points to 999 / 111 ${t}`, /999/.test(await page.locator('.assist__msg--bot').last().innerText()));
    await page.screenshot({ path: `verification/assist-chat-${w}.png` });
    const r = await new AxeBuilder({ page }).include('.assist').analyze();
    check(`axe clean ${t}`, r.violations.length === 0, r.violations.map((v) => `${v.id}:${v.nodes[0].target}`).join(' | '));
    // enquiry link opens the popup and tucks the helper away
    await page.locator('.assist__msg--bot a[data-assist-enquire]').last().click(); await page.waitForTimeout(600);
    check(`enquiry link opens the popup ${t}`, await page.locator('#enquiry-dialog').evaluate((d) => d.open));
    check(`helper hidden while popup is open ${t}`, !(await page.locator('.assist').isVisible()));
    await page.keyboard.press('Escape'); await page.waitForTimeout(500);
    check(`helper returns after popup closes ${t}`, await page.locator('.assist').isVisible());
    // Escape closes the helper and returns focus
    await page.locator('.assist__fab').click(); await page.waitForTimeout(300);
    await page.keyboard.press('Escape'); await page.waitForTimeout(300);
    check(`Escape closes the helper and focus returns to the launcher ${t}`, !(await panel.isVisible()) && (await page.evaluate(() => document.activeElement?.className)).includes('assist__fab'));
    check(`no script errors ${t}`, errors.length === 0, errors.join('|'));
    await ctx.close();
  }
  // Not on the contact page; no-JS leaves nothing broken
  const ctx = await browser.newContext(); const page = await ctx.newPage();
  await page.goto(BASE + '/contact/', { waitUntil: 'networkidle' });
  check('no helper on the contact page', (await page.locator('.assist').count()) === 0);
  await ctx.close();
  const nj = await browser.newContext({ javaScriptEnabled: false }); const p2 = await nj.newPage();
  await p2.goto(BASE + '/', { waitUntil: 'load' });
  check('helper is hidden without JavaScript', !(await p2.locator('.assist').isVisible()));
  await nj.close();
} finally { await browser.close(); server.kill(); }
console.log(`${out.filter(Boolean).length}/${out.length} assist checks passed`);
if (fail.length) { console.log('FAILED:\n' + fail.join('\n')); process.exit(1); }
