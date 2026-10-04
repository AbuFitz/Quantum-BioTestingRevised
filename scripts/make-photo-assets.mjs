// Colour-grades the source photographs for the warm identity. Grading only; no retouching.
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
const IN = 'brand/photo-sources/', OUT = 'src/assets/photos/';
mkdirSync(OUT, { recursive: true });

// Client photograph: cool grey room -> warm, a touch brighter and richer
await sharp(IN + 'client-clinician-and-patient.webp')
  .modulate({ saturation: 1.08, brightness: 1.04 })
  .linear([1.03, 1.0, 0.94], [2, 1, 0])
  .jpeg({ quality: 88 }).toFile(OUT + 'visit.jpg');

const lift = (src, dst, sat = 1.06, warm = [1.03, 1.0, 0.96]) =>
  sharp(IN + src).modulate({ saturation: sat, brightness: 1.02 }).linear(warm, [0, 0, 0]).jpeg({ quality: 88 }).toFile(OUT + dst);
await lift('stocksnap-7BQNRHB6EX-smiling-man.jpg', 'man.jpg');
await lift('stocksnap-8I4ATM3V9B-woman-with-flowers.jpg', 'woman.jpg');
await lift('stocksnap-EHXDKPHZ0C-mother-and-child.jpg', 'everyday.jpg', 1.0, [1, 1, 1]);
await lift('stocksnap-GU5GXVZDIY-beach-walk.jpg', 'walk.jpg', 1.05);
await lift('stocksnap-ULIKLNPKK0-cutting-orange.jpg', 'orange.jpg', 1.04);
console.log('photos graded');
