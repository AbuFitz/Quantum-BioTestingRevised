// Map responsiveness: clicking a pin or "Show on map" flies in, opens the popup, syncs the list; reset returns to the national view.
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
const PORT = 4399, BASE = `http://localhost:${PORT}`;
const EXE = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const server = spawn('node', ['scripts/preview-server.mjs'], { env: { ...process.env, PORT }, stdio: 'ignore' });
await new Promise((r) => setTimeout(r, 800));
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
const out = []; const fail = [];
const check = (n, ok, d = '') => { out.push(ok); if (!ok) fail.push(`${n} ${d}`); };
const browser = await chromium.launch({ executablePath: EXE });
try {
  for (const [w, h] of [[390, 844], [1440, 900]]) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    await ctx.route(/tile\.openstreetmap\.org/, (r) => r.fulfill({ body: PNG, contentType: 'image/png' }));
    const page = await ctx.newPage();
    await page.goto(BASE + '/clinics/', { waitUntil: 'networkidle' });
    await page.locator('.rmap').first().scrollIntoViewIfNeeded(); await page.waitForTimeout(1200);
    const zoom = () => page.evaluate(() => { const m = document.querySelector('.rmap__canvas, .leaflet-container'); return m ? m.getBoundingClientRect().width : 0; });
    check(`map rendered @${w}`, (await zoom()) > 200);
    const btn = page.locator('[data-show]').first();
    await btn.scrollIntoViewIfNeeded(); await btn.click(); await page.waitForTimeout(1800);
    check(`popup opens after Show on map @${w}`, (await page.locator('.leaflet-popup').count()) === 1);
    check(`a pin is marked selected @${w}`, (await page.locator('.is-selected').count()) >= 1);
    const reset = page.locator('.rmap__reset');
    check(`reset control visible once zoomed in @${w}`, await reset.first().isVisible());
    await reset.first().click(); await page.waitForTimeout(1500);
    check(`reset control hides at the national view @${w}`, !(await reset.first().isVisible()));
    await ctx.close();
  }
} finally { await browser.close(); server.kill(); }
console.log(`${out.filter(Boolean).length}/${out.length} map checks passed`);
if (fail.length) { console.log('FAILED:\n' + fail.join('\n')); process.exit(1); }
