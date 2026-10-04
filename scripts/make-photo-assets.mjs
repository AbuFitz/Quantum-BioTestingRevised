// One shared grade for every homepage photograph, so they read as a single set.
// Shadows toward the logo navy, highlights toward warm cream, slightly muted colour, gentle contrast.
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
const IN = 'brand/photo-sources/', OUT = 'src/assets/photos/';
mkdirSync(OUT, { recursive: true });

const NAVY = [11, 29, 61], CREAM = [255, 243, 226];
async function grade(src, dst, { sat = 0.9, contrast = 1.06, shadow = 0.2, high = 0.1, brightness = 1.0 } = {}) {
  const { data, info } = await sharp(IN + src).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < data.length; i += 3) {
    let r = data[i], g = data[i + 1], b = data[i + 2];
    const y = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
    // muted colour
    const gray = y * 255;
    r = gray + (r - gray) * sat; g = gray + (g - gray) * sat; b = gray + (b - gray) * sat;
    // split tone
    const ws = Math.pow(1 - y, 2) * shadow, wh = Math.pow(y, 3) * high;
    r = r * (1 - ws - wh) + NAVY[0] * ws + CREAM[0] * wh;
    g = g * (1 - ws - wh) + NAVY[1] * ws + CREAM[1] * wh;
    b = b * (1 - ws - wh) + NAVY[2] * ws + CREAM[2] * wh;
    // contrast around mid grey, brightness
    data[i] = Math.max(0, Math.min(255, ((r - 128) * contrast + 128) * brightness));
    data[i + 1] = Math.max(0, Math.min(255, ((g - 128) * contrast + 128) * brightness));
    data[i + 2] = Math.max(0, Math.min(255, ((b - 128) * contrast + 128) * brightness));
  }
  await sharp(data, { raw: info }).jpeg({ quality: 88 }).toFile(OUT + dst);
}
await grade('client-clinician-and-patient.webp', 'visit.jpg', { brightness: 1.03 });
await grade('client-clinician-explaining-results.webp', 'results.jpg', { brightness: 1.03 });
console.log('photographs graded');
