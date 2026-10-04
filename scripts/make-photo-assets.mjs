// Colour-grades the source photographs for the warm identity. Grading only; no retouching.
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
const IN = 'brand/photo-sources/', OUT = 'src/assets/photos/';
mkdirSync(OUT, { recursive: true });

const rgb2hsv = (r, g, b) => {
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; let h = 0;
  if (d) { if (mx === r) h = ((g - b) / d) % 6; else if (mx === g) h = (b - r) / d + 2; else h = (r - g) / d + 4; h *= 60; if (h < 0) h += 360; }
  return [h, mx ? d / mx : 0, mx];
};
const hsv2rgb = (h, s, v) => { h = ((h % 360) + 360) % 360; const c = v * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = v - c; const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x]; return [(r + m) * 255, (g + m) * 255, (b + m) * 255]; };

// Client photograph: cool grey room -> warm, a touch brighter and richer
await sharp(IN + 'client-clinician-and-patient.webp')
  .modulate({ saturation: 1.08, brightness: 1.04 })
  .linear([1.03, 1.0, 0.94], [2, 1, 0])
  .jpeg({ quality: 88 }).toFile(OUT + 'visit.jpg');

// Pull greens back and nudge teal toward the logo blue so every photograph sits in the blue/red palette
const palette = async (src, dst, { sat = 1.04, warm = [1.02, 1.0, 0.97], green = 0.45 } = {}) => {
  const { data, info } = await sharp(IN + src).modulate({ saturation: sat, brightness: 1.02 }).linear(warm, [0, 0, 0]).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 3) {
    let [h, sa, v] = rgb2hsv(data[i] / 255, data[i + 1] / 255, data[i + 2] / 255);
    if (h >= 70 && h < 160) sa *= green;                        // greens: quieter
    else if (h >= 160 && h < 200) { h = 160 + (h - 160) * 0.5 + 40; sa *= 0.85; } // teal -> blue
    const [r, g, b] = hsv2rgb(h, sa, v);
    data[i] = r; data[i + 1] = g; data[i + 2] = b;
  }
  await sharp(data, { raw: info }).jpeg({ quality: 88 }).toFile(OUT + dst);
};
await palette('stocksnap-7BQNRHB6EX-smiling-man.jpg', 'man.jpg');
await palette('stocksnap-8I4ATM3V9B-woman-with-flowers.jpg', 'woman.jpg', { green: 0.62, sat: 1.12 });
await palette('stocksnap-EHXDKPHZ0C-mother-and-child.jpg', 'everyday.jpg', { warm: [1, 1, 1], sat: 1.0 });
await palette('stocksnap-GU5GXVZDIY-beach-walk.jpg', 'walk.jpg', { sat: 1.05 });
await palette('stocksnap-ULIKLNPKK0-cutting-orange.jpg', 'orange.jpg', { green: 0.4 });
await palette('client-clinician-explaining-results.webp', 'results.jpg', { warm: [1.03, 1.0, 0.95], sat: 1.04 });
console.log('photos graded');
