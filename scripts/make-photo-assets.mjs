// Colour-grades the openly licensed source photographs for the v2 identity.
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
const OUT = 'src/assets/photos';
mkdirSync(OUT, { recursive: true });

const rgb2hsv = (r, g, b) => {
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; let h = 0;
  if (d) { if (mx === r) h = ((g - b) / d) % 6; else if (mx === g) h = (b - r) / d + 2; else h = (r - g) / d + 4; h *= 60; if (h < 0) h += 360; }
  return [h, mx ? d / mx : 0, mx];
};
const hsv2rgb = (h, s, v) => { const c = v * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = v - c; const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x]; return [(r + m) * 255, (g + m) * 255, (b + m) * 255]; };

// 1. Tube in gloved hand: lilac -> brand blue, ground -> paper white
{
  const { data, info } = await sharp('brand/photo-sources/blood-tube-in-gloved-hand.jpg').removeAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 3) {
    let [h, s, v] = rgb2hsv(data[i] / 255, data[i + 1] / 255, data[i + 2] / 255);
    if (h > 235 && h < 310 && s > 0.1) { h = 218 + (h - 235) * 0.1; s = Math.min(1, s * 1.15); }
    // lift the pale ground to white; keep tonal detail in shadows and the blood
    if (s < 0.14 && v > 0.82) { v = Math.min(1, 0.82 + (v - 0.82) * 2.6); s *= 0.35; }
    const [r, g, b] = hsv2rgb(h, s, v);
    data[i] = r; data[i + 1] = g; data[i + 2] = b;
  }
  await sharp(data, { raw: info }).jpeg({ quality: 92 }).toFile(`${OUT}/blood-tube.jpg`);
}
// 2. Rack of tubes: cooler, quieter, so it belongs with the blue identity
await sharp('brand/photo-sources/sample-tubes-in-rack.jpg')
  .modulate({ saturation: 0.62, brightness: 1.03 })
  .tint ? await sharp('brand/photo-sources/sample-tubes-in-rack.jpg').modulate({ saturation: 0.6 }).linear([0.94, 0.99, 1.08], [0, 2, 8]).jpeg({ quality: 90 }).toFile(`${OUT}/sample-rack.jpg`) : null;
console.log('done');
