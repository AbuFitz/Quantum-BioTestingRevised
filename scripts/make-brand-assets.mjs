// Derives web logo assets from the untouched source in brand/source/.
// Crops only: the artwork, proportions and transparency are not altered.
import sharp from 'sharp';
import { writeFileSync, mkdirSync } from 'node:fs';

const SRC = 'brand/source/quantum-logo-source.png';
const OUT = 'src/assets/brand';
mkdirSync(OUT, { recursive: true });

const { data, info } = await sharp(SRC).raw().toBuffer({ resolveWithObject: true });
const W = info.width;
const alpha = (x, y) => data[(y * W + x) * 4 + 3];
const THRESH = 8;

// Overall artwork bounds
let minx = 1e9, miny = 1e9, maxx = -1, maxy = -1;
for (let y = 0; y < info.height; y++) for (let x = 0; x < W; x++) if (alpha(x, y) > THRESH) {
  minx = Math.min(minx, x); maxx = Math.max(maxx, x); miny = Math.min(miny, y); maxy = Math.max(maxy, y);
}

// Split wordmark from the benefits line: first empty row band after the wordmark
let wordBottom = miny;
for (let y = miny; y <= maxy; y++) {
  let any = false;
  for (let x = minx; x <= maxx && !any; x++) if (alpha(x, y) > THRESH) any = true;
  if (!any) { wordBottom = y - 1; break; }
}

// Wordmark's own horizontal bounds (the benefits line starts further left)
let wMinx = 1e9, wMaxx = -1;
for (let y = miny; y <= wordBottom; y++) for (let x = minx; x <= maxx; x++) if (alpha(x, y) > THRESH) {
  wMinx = Math.min(wMinx, x); wMaxx = Math.max(wMaxx, x);
}
// Q glyph: columns from the wordmark's left edge up to the first empty column
let qRight = wMinx;
for (let x = wMinx; x <= wMaxx; x++) {
  let any = false;
  for (let y = miny; y <= wordBottom && !any; y++) if (alpha(x, y) > THRESH) any = true;
  if (!any) { qRight = x - 1; break; }
}
console.log({ minx, miny, maxx, maxy, wordBottom, wMinx, wMaxx, qRight });

const pad = 4;
const crop = (l, t, r, b) => ({ left: Math.max(0, l - pad), top: Math.max(0, t - pad), width: r - l + 1 + 2 * pad, height: b - t + 1 + 2 * pad });

await sharp(SRC).extract(crop(wMinx, miny, wMaxx, wordBottom)).png({ compressionLevel: 9 }).toFile(`${OUT}/logo-wordmark.png`);
await sharp(SRC).extract(crop(minx, miny, maxx, maxy)).png({ compressionLevel: 9 }).toFile(`${OUT}/logo-lockup.png`);

// Q mark: square canvas, transparent, centred with ~8% breathing room
const q = crop(wMinx, miny, qRight, wordBottom);
const side = Math.round(Math.max(q.width, q.height) * 1.16);
const qBuf = await sharp(SRC).extract(q).png().toBuffer();
// Compose on a square canvas first, then resize (sharp resizes before compositing otherwise)
const qSquare = (size, bg) => sharp({ create: { width: side, height: side, channels: 4, background: bg } })
  .composite([{ input: qBuf, gravity: 'center' }]).png().toBuffer()
  .then((buf) => sharp(buf).resize(size, size, { kernel: 'lanczos3' }).png({ compressionLevel: 9, effort: 10 }));

await (await qSquare(512, { r: 0, g: 0, b: 0, alpha: 0 })).toFile(`${OUT}/logo-q.png`);
await (await qSquare(512, { r: 0, g: 0, b: 0, alpha: 0 })).toFile('public/icon-512.png');
await (await qSquare(192, { r: 0, g: 0, b: 0, alpha: 0 })).toFile('public/icon-192.png');
await (await qSquare(32, { r: 0, g: 0, b: 0, alpha: 0 })).toFile('public/favicon-32.png');
await (await qSquare(180, { r: 255, g: 255, b: 255, alpha: 1 })).flatten({ background: '#ffffff' }).toFile('public/apple-touch-icon.png');

// favicon.ico: 16, 32, 48 PNG entries in an ICO container
const sizes = [16, 32, 48];
const pngs = await Promise.all(sizes.map(async (s) => (await qSquare(s, { r: 0, g: 0, b: 0, alpha: 0 })).toBuffer()));
const header = Buffer.alloc(6); header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(sizes.length, 4);
let offset = 6 + 16 * sizes.length;
const dir = Buffer.concat(sizes.map((s, i) => {
  const e = Buffer.alloc(16);
  e.writeUInt8(s, 0); e.writeUInt8(s, 1); e.writeUInt8(0, 2); e.writeUInt8(0, 3);
  e.writeUInt16LE(1, 4); e.writeUInt16LE(32, 6); e.writeUInt32LE(pngs[i].length, 8); e.writeUInt32LE(offset, 12);
  offset += pngs[i].length; return e;
}));
writeFileSync('public/favicon.ico', Buffer.concat([header, dir, ...pngs]));

// Sample the brand colours from opaque artwork pixels (most common bluish and reddish values)
const tally = { blue: {}, red: {} };
for (let i = 0; i < data.length; i += 4) {
  if (data[i + 3] !== 255) continue;
  const [r, g, b] = [data[i], data[i + 1], data[i + 2]];
  const k = `#${[r, g, b].map((v) => v.toString(16).padStart(2, '0')).join('')}`;
  if (b > r + 60) tally.blue[k] = (tally.blue[k] || 0) + 1;
  else if (r > b + 80) tally.red[k] = (tally.red[k] || 0) + 1;
}
const top = (o) => Object.entries(o).sort((a, b) => b[1] - a[1]).slice(0, 3);
console.log('blue', top(tally.blue), 'red', top(tally.red));
