import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

interface PromoGalleryItem {
  path: string;
  width: number;
  height: number;
  bytes: number;
}

const PUBLIC_DIR = path.resolve(process.cwd(), 'public');
const PROMO_DIR = path.join(PUBLIC_DIR, 'promo');
const MANIFEST_PATH = path.join(PROMO_DIR, 'manifest.json');

const INITIAL_IMAGE_SOURCES: Record<string, string> = {
  'pemeriksaan-dokter-umum.webp': path.join(PUBLIC_DIR, 'assets', 'services', 'layanan-umum-pemeriksaan.webp'),
  'usg-kandungan.webp': path.join(PUBLIC_DIR, 'assets', 'services', 'asset_pemeriksaankehamilan.webp'),
  'persalinan-24-jam.webp': path.join(PUBLIC_DIR, 'assets', 'services', 'asset_persalinan.webp'),
};

async function ensureInitialImages(): Promise<void> {
  if (!fs.existsSync(PROMO_DIR)) {
    fs.mkdirSync(PROMO_DIR, { recursive: true });
  }

  for (const [filename, sourcePath] of Object.entries(INITIAL_IMAGE_SOURCES)) {
    const targetPath = path.join(PROMO_DIR, filename);
    if (!fs.existsSync(targetPath)) {
      if (fs.existsSync(sourcePath)) {
        await sharp(sourcePath)
          .resize(1600, 900, { fit: 'cover', position: 'center' })
          .webp({ quality: 85 })
          .toFile(targetPath);
        console.log(`[manifest:promo] Created sample image: ${filename} (1600x900)`);
      } else {
        // Fallback: create solid background banner with SVG text
        const svg = `
          <svg width="1600" height="900" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="#0ea5e9"/>
            <text x="50%" y="50%" font-family="sans-serif" font-size="64" font-weight="bold" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">
              ${filename.replace('.webp', '').toUpperCase()}
            </text>
          </svg>
        `;
        await sharp(Buffer.from(svg))
          .webp({ quality: 85 })
          .toFile(targetPath);
        console.log(`[manifest:promo] Generated SVG-based sample: ${filename}`);
      }
    }
  }
}

async function generateManifest(): Promise<void> {
  await ensureInitialImages();

  const entries = fs.readdirSync(PROMO_DIR, { withFileTypes: true });
  const items: PromoGalleryItem[] = [];

  const allowedExtensions = new Set(['.webp', '.jpg', '.jpeg', '.png', '.avif']);

  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const ext = path.extname(entry.name).toLowerCase();
    if (!allowedExtensions.has(ext)) continue;

    const fullPath = path.join(PROMO_DIR, entry.name);
    try {
      const stats = fs.statSync(fullPath);
      const meta = await sharp(fullPath).metadata();

      items.push({
        path: `/promo/${entry.name}`,
        width: meta.width ?? 1600,
        height: meta.height ?? 900,
        bytes: stats.size,
      });
    } catch (err) {
      console.warn(`[manifest:promo] Failed to process ${entry.name}:`, err);
    }
  }

  items.sort((a, b) => a.path.localeCompare(b.path));

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(items, null, 2), 'utf-8');
  console.log(`[manifest:promo] Successfully generated ${MANIFEST_PATH} with ${items.length} items.`);
}

generateManifest().catch((err) => {
  console.error('[manifest:promo] Fatal error:', err);
  process.exit(1);
});
