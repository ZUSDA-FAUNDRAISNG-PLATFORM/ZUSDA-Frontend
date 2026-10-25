import { copyFile, mkdir, readdir, stat, unlink } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const assetsRoot = path.join(projectRoot, "src", "assets");
const originalsRoot = path.join(projectRoot, "originals", "src", "assets");
const minimumBytes = 150_000;
const supportedExtensions = new Set([".jpg", ".jpeg", ".png"]);

async function collectImages(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const filePath = path.join(directory, entry.name);
      return entry.isDirectory() ? collectImages(filePath) : [filePath];
    }),
  );
  return files.flat();
}

const imagePaths = (await collectImages(assetsRoot)).filter((filePath) =>
  supportedExtensions.has(path.extname(filePath).toLowerCase()),
);
let optimizedCount = 0;

for (const imagePath of imagePaths) {
  const metadata = await sharp(imagePath).metadata();
  const { size } = await stat(imagePath);
  const relativePath = path.relative(assetsRoot, imagePath);
  const isPortraitCollection = /(?:^|[\\/])(?:gallery|team|committee)(?:[\\/]|$)/i.test(relativePath);
  if (size <= minimumBytes && !isPortraitCollection) continue;

  const backupPath = path.join(originalsRoot, relativePath);
  const outputPath = imagePath.replace(/\.(?:jpe?g|png)$/i, ".webp");
  const maxWidth = isPortraitCollection ? 1000 : 1600;

  await mkdir(path.dirname(backupPath), { recursive: true });
  await copyFile(imagePath, backupPath);
  await sharp(imagePath)
    .resize({ width: maxWidth, withoutEnlargement: true })
    .webp({ quality: 75 })
    .toFile(outputPath);
  await unlink(imagePath);

  console.log(
    `${relativePath}: ${Math.round(size / 1000)} kB -> ${path.relative(assetsRoot, outputPath)} ` +
      `(${metadata.width}x${metadata.height}, max width ${maxWidth})`,
  );
  optimizedCount += 1;
}

console.log(`Optimized ${optimizedCount} image(s); originals preserved under originals/src/assets.`);
