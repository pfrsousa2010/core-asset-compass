import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.resolve('public/icons');

for (const size of sizes) {
  const svgPath = path.join(iconsDir, `icon-${size}x${size}.svg`);
  const pngPath = path.join(iconsDir, `icon-${size}x${size}.png`);
  if (fs.existsSync(svgPath)) {
    sharp(svgPath)
      .resize(size, size)
      .png()
      .toFile(pngPath)
      .then(() => console.log(`✔️  ${pngPath} gerado!`))
      .catch(err => console.error(`Erro ao converter ${svgPath}:`, err));
  }
} 