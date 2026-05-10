/**
 * One-shot: favicon.svg → public/apple-touch-icon.png (180×180) for iOS “添加到主屏幕”.
 * Run: node scripts/rasterize-app-icon.mjs
 */
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
await sharp(join(root, 'public/favicon.svg')).resize(180, 180).png().toFile(join(root, 'public/apple-touch-icon.png'));
console.log('public/apple-touch-icon.png');
