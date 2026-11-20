import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { load } from "cheerio";
import sharp from "sharp";
import type { SocialPost, YouTubeVideo } from "../src/lib/schema";

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, "src", "data");
const IG_MEDIA_DIR = path.join(ROOT, "public", "media", "instagram");

const WP_HOME = "https://www.hoyextremaduraesfuturo.es/";
const AJAX = "https://www.hoyextremaduraesfuturo.es/wp-admin/admin-ajax.php";

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8",
  "Accept-Language": "es-ES,es;q=0.9",
};

const AJAX_HEADERS = {
  ...HEADERS,
  "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
  "X-Requested-With": "XMLHttpRequest",
  Origin: "https://www.hoyextremaduraesfuturo.es",
  Referer: WP_HOME,
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchHtml(url: string): Promise<string> {
  const response = await fetch(url, { headers: HEADERS });
  if (!response.ok) throw new Error(`HTTP ${response.status} ${url}`);
  return response.text();
}

async function ajax(payload: Record<string, string>): Promise<any> {
  const response = await fetch(AJAX, {
    method: "POST",
    headers: AJAX_HEADERS,
    body: new URLSearchParams(payload),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status} AJAX`);
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return { html: text };
  }
}

function parseInstagram(html: string): any[] {
  const $ = load(html);
  const items: any[] = [];

  $(".sbi_item").each((_, element) => {
    const $item = $(element);
    const $link = $item.find("a.sbi_photo").first();
    const $img = $item.find("img").first();
    const url = $link.attr("href") ?? "";
    const fullRes = $link.attr("data-full-res") ?? "";
    const date = Number($item.attr("data-date") ?? 0);
    const type = $item.hasClass("sbi_type_video")
      ? "video"
      : $item.hasClass("sbi_type_carousel")
        ? "carousel"
        : "image";

    let srcSet: Record<string, string> = {};
    try {
      srcSet = JSON.parse($link.attr("data-img-src-set") ?? "{}");
    } catch {
      srcSet = {};
    }

    const image = srcSet["640"] ?? srcSet["d"] ?? fullRes;

    if (url && image) {
      items.push({
        url,
        image,
        date,
        type,
        caption: ($img.attr("alt") ?? "").trim(),
      });
    }
  });

  return items;
}

async function cacheInstagramImage(item: any): Promise<string> {
  const shortcode =
    new URL(item.url).pathname.split("/").filter(Boolean).pop() ?? "post";
  const target = path.join(IG_MEDIA_DIR, `${shortcode}.webp`);
  const publicPath = `/media/instagram/${shortcode}.webp`;

  try {
    await access(target);
    return publicPath;
  } catch {
    // Se descarga.
  }

  try {
    const response = await fetch(item.image, { headers: HEADERS });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const buffer = Buffer.from(await response.arrayBuffer());
    await sharp(buffer)
      .rotate()
      .resize({ width: 1080, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(target);

    for (const width of [480, 720]) {
      const variant = path.join(IG_MEDIA_DIR, `${shortcode}-${width}.webp`);
      await sharp(target)
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 76 })
        .toFile(variant);
    }

    return publicPath;
  } catch (error) {
    console.warn(
      `  Instagram ${shortcode}: ${
        error instanceof Error ? error.message : error
      }`,
    );
    return "/media/og-default.jpg";
  }
}

function cleanYouTubeTitle(value: string): string {
  return value
    .replace(/\s+/g, " ")
    .replace(/^\|\s*/, "")
    .replace(/\s*\|\s*Extremadura es Futuro HOY$/i, "")
    .replace(/\s*\|\s*Extremadura es Futuro$/i, "")
    .trim();
}

function parseYouTube(html: string): any[] {
  const $ = load(html);
  const videos: any[] = [];

  $(".sby_item").each((_, element) => {
    const $item = $(element);
    const id = $item.attr("data-video-id") ?? "";
    const date = Number($item.attr("data-date") ?? 0);
    const title =
      $item.find("[data-video-title]").attr("data-video-title") ??
      $item.find(".sby_title").text().trim();

    let srcSet: Record<string, string> = {};
    try {
      srcSet = JSON.parse(
        $item.find("[data-img-src-set]").attr("data-img-src-set") ?? "{}",
      );
    } catch {
      srcSet = {};
    }

    const thumbnail =
      srcSet["640"] ??
      srcSet["480"] ??
      srcSet["320"] ??
      `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;

    if (id && title) {
      videos.push({ id, date, title: cleanYouTubeTitle(title), thumbnail });
    }
  });

  return videos;
}

async function importInstagram(): Promise<SocialPost[]> {
  console.log("Instagram: leyendo el feed de WordPress…");
  const html = await fetchHtml(WP_HOME);
  const all = parseInstagram(html);
  let offset = all.length;
  let page = 2;

  while (page <= 50) {
    await sleep(800);
    const data = await ajax({
      action: "sbi_load_more_clicked",
      offset: String(offset),
      page: String(page),
      feed_id: "*1",
      atts: JSON.stringify({ feed: "1" }),
      location: JSON.stringify({ country: "ES" }),
      post_id: "1874",
      current_resolution: "medium",
      locator_nonce: "d99aa63252",
    });

    const newItems = parseInstagram(data.html ?? "");
    if (newItems.length === 0) break;
    all.push(...newItems);
    offset += newItems.length;
    console.log(`  página ${page}: +${newItems.length} (${all.length})`);

    if (!data.feedStatus?.shouldPaginate) break;
    page++;
  }

  const unique = [
    ...new Map(all.map((item) => [item.url, item])).values(),
  ] as any[];

  console.log(`Instagram: ${unique.length} publicaciones. Descargando imágenes…`);
  const posts: SocialPost[] = [];

  for (let i = 0; i < unique.length; i += 6) {
    const batch = unique.slice(i, i + 6);
    const processed = await Promise.all(
      batch.map(async (item) => ({
        platform: "instagram" as const,
        url: item.url,
        date: new Date(item.date * 1000).toISOString(),
        image: await cacheInstagramImage(item),
        caption: item.caption || "Publicación de @extremaduraesfuturohoy",
        featured: false,
      })),
    );
    posts.push(...processed);
    console.log(`  ${Math.min(i + 6, unique.length)}/${unique.length}`);
  }

  return posts.map((post, index) => ({ ...post, featured: index < 4 }));
}

async function importYouTube(): Promise<YouTubeVideo[]> {
  console.log("YouTube: leyendo el feed de WordPress…");
  const html = await fetchHtml(WP_HOME);
  const all = parseYouTube(html);
  let offset = all.length;
  let page = 2;

  while (page <= 50) {
    await sleep(800);
    const data = await ajax({
      action: "sby_load_more_clicked",
      offset: String(offset),
      feed_id: "sby_UC1I4SH_7zLg7ILl7Ens1rsA#9",
      atts: JSON.stringify({ feed: "5" }),
      location: JSON.stringify({ country: "ES" }),
      post_id: "1874",
      current_resolution: "medium",
    });

    const newVideos = parseYouTube(data.html ?? "");
    if (newVideos.length === 0) break;
    all.push(...newVideos);
    offset += newVideos.length;
    console.log(`  página ${page}: +${newVideos.length} (${all.length})`);

    if (!data.feedStatus?.shouldPaginate) break;
    page++;
  }

  const unique = [...new Map(all.map((item) => [item.id, item])).values()] as any[];

  return unique.map((video) => ({
    id: video.id,
    title: video.title,
    url: `https://www.youtube.com/watch?v=${video.id}`,
    thumbnail: video.thumbnail,
    publishedAt: new Date(video.date * 1000).toISOString(),
    author: "Extremadura Es Futuro HOY",
  }));
}

async function main() {
  await mkdir(DATA_DIR, { recursive: true });
  await mkdir(IG_MEDIA_DIR, { recursive: true });

  const [instagram, youtube] = await Promise.all([
    importInstagram(),
    importYouTube(),
  ]);

  await writeFile(
    path.join(DATA_DIR, "social.json"),
    `${JSON.stringify(instagram, null, 2)}\n`,
    "utf8",
  );

  await writeFile(
    path.join(DATA_DIR, "youtube.json"),
    `${JSON.stringify(youtube, null, 2)}\n`,
    "utf8",
  );

  console.log(
    `Listo: ${instagram.length} publicaciones de Instagram y ${youtube.length} vídeos de YouTube.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
