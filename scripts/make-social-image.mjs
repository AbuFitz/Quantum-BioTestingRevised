// Renders public/og-image.png (1200x630) from the cropped logo and the site font.
import { chromium } from 'playwright';
import { readFileSync } from 'node:fs';

const b64 = (p) => readFileSync(p).toString('base64');
const logo = b64('src/assets/brand/logo-wordmark.png');
const font = b64('src/assets/fonts/public-sans-latin-wght-normal.woff2');
const html = `<style>
@font-face{font-family:PS;src:url(data:font/woff2;base64,${font}) format('woff2');font-weight:100 900}
html,body{margin:0;width:1200px;height:630px;background:#fff;font-family:PS,Arial,sans-serif}
.wrap{box-sizing:border-box;height:630px;padding:0 110px;display:flex;flex-direction:column;justify-content:center;gap:34px;border-top:14px solid #013275;position:relative}
img{width:760px;height:auto;display:block}
p{margin:0;font-size:44px;line-height:1.25;font-weight:600;color:#18222f;max-width:900px}
.rule{width:96px;height:6px;background:#b02018;border-radius:3px}
</style>
<div class="wrap"><img src="data:image/png;base64,${logo}"><div class="rule"></div><p>Private blood tests for men and women</p></div>`;

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.setContent(html);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: 'public/og-image.png' });
await browser.close();
