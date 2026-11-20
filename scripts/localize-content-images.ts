import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import type { Article } from "../src/lib/schema";

const ROOT = process.cwd();
const ARCHIVE_PATH = path.join(ROOT, "src", "data", "archive.json");
const MEDIA_DIR = path.join(ROOT, "public", "media", "archive-content");
const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
};

async function localize(src: string): Promise<string> {
  if (
    !/^https?:\/\/www\.hoyextremaduraesfuturo\.es\/wp-content\/uploads\//i.test(
      src,
    )
  ) {
    return src;
  }

  const hash = createHash("sha1").update(src).digest("hex").slice(0, 16);
  const target = path.join(MEDIA_DIR, `${hash}.webp`);
  const publicPath = `/media/archive-content/${hash}.webp`;

  try {
    const response = await fetch(src, { headers: HEADERS });
    if (!response.ok) return src;
    const buffer = Buffer.from(await response.arrayBuffer());
    await sharp(buffer)
      .rotate()
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality: 78 })
      .toFile(target);
    return publicPath;
  } catch {
    return src;
  }
}

async function main() {
  await mkdir(MEDIA_DIR, { recursive: true });
  const archive = JSON.parse(
    await readFile(ARCHIVE_PATH, "utf8"),
  ) as Article[];

  let count = 0;

  for (const article of archive) {
    const matches = [...article.contentHtml.matchAll(/<img\b[^>]*src="([^"]+)"/gi)];
    if (matches.length === 0) continue;

    let html = article.contentHtml;
    for (const match of matches) {
      const original = match[1];
      const local = await localize(original);
      if (local !== original) {
        html = html.split(`src="${original}"`).join(`src="${local}"`);
        count++;
      }
    }
    article.contentHtml = html;
  }

  await writeFile(ARCHIVE_PATH, `${JSON.stringify(archive, null, 2)}\n`, "utf8");
  console.log(`Imágenes de contenido localizadas: ${count}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
