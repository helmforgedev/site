/**
 * Generate PNG brand assets from SVG sources using sharp.
 * Run: node scripts/generate-brand-assets.mjs
 */
import sharp from 'sharp';
import { readFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');
const brand = resolve(root, 'brand');
const publicDir = resolve(root, 'public');

mkdirSync(resolve(brand, 'logos'), { recursive: true });
mkdirSync(resolve(brand, 'banners'), { recursive: true });
mkdirSync(resolve(brand, 'icons'), { recursive: true });

// --- Icon PNGs at standard sizes ---
const iconSvg = readFileSync(resolve(brand, 'logos/helmforge-icon.svg'));
const sizes = [64, 128, 256, 512, 1024];

for (const size of sizes) {
  await sharp(iconSvg)
    .resize(size, size)
    .png()
    .toFile(resolve(brand, `logos/helmforge-icon-${size}.png`));
  console.log(`  icon ${size}x${size}`);
}

// --- Favicon set ---
// apple-touch-icon 180x180
await sharp(iconSvg).resize(180, 180).png().toFile(resolve(publicDir, 'apple-touch-icon.png'));
console.log('  apple-touch-icon.png');

// favicon-192 and favicon-512 for PWA manifest
await sharp(iconSvg).resize(192, 192).png().toFile(resolve(publicDir, 'favicon-192.png'));
await sharp(iconSvg).resize(512, 512).png().toFile(resolve(publicDir, 'favicon-512.png'));
console.log('  favicon-192.png, favicon-512.png');

// favicon.ico (32x32 PNG as .ico — browsers handle PNG-in-ICO fine)
await sharp(iconSvg).resize(32, 32).png().toFile(resolve(publicDir, 'favicon.ico'));
console.log('  favicon.ico');

// --- OG / Social banners ---
// og-default 1200x630
const ogSvg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#070708" />
  <defs>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <rect width="40" height="40" fill="none" stroke="rgba(255,255,255,0.025)" stroke-width="1" />
    </pattern>
    <linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#a78bfa" />
      <stop offset="100%" stop-color="#6d28d9" />
    </linearGradient>
    <linearGradient id="g2" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#fb923c" />
      <stop offset="100%" stop-color="#ea580c" />
    </linearGradient>
    <linearGradient id="g3" x1="0%" y1="50%" x2="100%" y2="50%">
      <stop offset="0%" stop-color="#8b5cf6" />
      <stop offset="50%" stop-color="#f43f5e" />
      <stop offset="100%" stop-color="#ea580c" />
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#grid)" />
  <circle cx="600" cy="315" r="350" fill="#8b5cf6" opacity="0.08" />
  <circle cx="800" cy="315" r="350" fill="#f97316" opacity="0.04" />
  <g transform="translate(200, 180) scale(2.5)">
    <polygon points="25,15 45,15 35,85 15,85" fill="url(#g1)" />
    <polygon points="65,15 85,15 75,85 55,85" fill="url(#g2)" />
    <polygon points="28,45 72,45 68,55 24,55" fill="url(#g3)" />
  </g>
  <text x="520" y="340" font-family="system-ui, sans-serif" font-size="80" font-weight="700" fill="#ffffff" letter-spacing="-1">
    Helm<tspan fill="#f97316">Forge</tspan>
  </text>
  <text x="525" y="390" font-family="system-ui, sans-serif" font-size="22" font-weight="400" fill="#a1a1aa" letter-spacing="1">
    PRODUCTION-READY HELM CHARTS
  </text>
</svg>`;

await sharp(Buffer.from(ogSvg)).png().toFile(resolve(brand, 'banners/og-default.png'));
await sharp(Buffer.from(ogSvg)).png().toFile(resolve(publicDir, 'og-default.png'));
console.log('  og-default.png');

// twitter-card 1200x600
const twitterSvg = ogSvg.replace(/height="630"/g, 'height="600"').replace(/viewBox="0 0 1200 630"/g, 'viewBox="0 0 1200 600"');
await sharp(Buffer.from(twitterSvg)).png().toFile(resolve(brand, 'banners/twitter-card.png'));
console.log('  twitter-card.png');

// github-banner 1280x640
const ghSvg = readFileSync(resolve(publicDir, 'github-banner.svg'));
await sharp(ghSvg).resize(1280, 640).png().toFile(resolve(brand, 'banners/github-banner.png'));
console.log('  github-banner.png');

console.log('\nDone. All brand assets generated.');
