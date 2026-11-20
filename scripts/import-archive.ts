import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { load } from "cheerio";
import sharp from "sharp";
import type { Article, ArticleKind } from "../src/lib/schema";

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, "src", "data");
const MEDIA_DIR = path.join(ROOT, "public", "media", "archive");
const WP_API = "https://www.hoyextremaduraesfuturo.es/wp-json/wp/v2";
const FALLBACK_IMAGE = "/media/og-default.jpg";

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  Accept: "application/json,text/html;q=0.9,*/*;q=0.8",
  "Accept-Language": "es-ES,es;q=0.9",
};

const CATEGORY_NAMES: Record<number, string> = {
  1: "Noticias",
  4: "Encuentros",
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function decodeHtml(value: string): string {
  return load(`<div>${value}</div>`).text().replace(/\s+/g, " ").trim();
}

function stripHtml(value: string): string {
  return load(`<div>${value}</div>`).text().replace(/\s+/g, " ").trim();
}

function cleanContent(value: string): string {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/\[\/?[a-zA-Z_][^\]]*\]/g, " ")
    .replace(/\.[\w-]+\s*\{[^}]*\}/g, " ")
    .replace(/#[\w-]+\s*\{[^}]*\}/g, " ")
    .replace(/\son\w+=("[^"]*"|'[^']*')/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/src="\/wp-content\//gi, 'src="https://www.hoyextremaduraesfuturo.es/wp-content/')
    .replace(
      /<img\b(?![^>]*\balt=)([^>]*)>/gi,
      '<img alt=""$1>',
    )
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function classifyPost(
  categories: number[],
  title: string,
  content: string,
): ArticleKind {
  if (categories.includes(4)) return "encuentro";

  if (/(encuentro|foro|jornada|charla|coloquio)/i.test(title)) {
    return "encuentro";
  }

  const text = `${title} ${content}`.toLowerCase();
  if (
    title.includes("«") ||
    /(entrevista|nos cuenta|conversamos|habla de|asegura|reivindica|explica)/.test(
      text,
    )
  ) {
    return "entrevista";
  }

  return "reportaje";
}

async function fetchJson<T>(url: string, attempt = 1): Promise<T> {
  try {
    const response = await fetch(url, { headers: HEADERS });
    if (!response.ok) throw new Error(`HTTP ${response.status} ${url}`);
    return (await response.json()) as T;
  } catch (error) {
    if (attempt < 3) {
      await sleep(1000 * attempt);
      return fetchJson<T>(url, attempt + 1);
    }
    throw error;
  }
}

async function fetchAllPosts(): Promise<any[]> {
  const posts: any[] = [];

  for (let page = 1; page <= 10; page++) {
    const url = `${WP_API}/posts?per_page=100&page=${page}&_fields=id,date,modified,slug,link,title,excerpt,content,categories,featured_media,author`;
    const batch = await fetchJson<any[]>(url);

    if (!Array.isArray(batch) || batch.length === 0) break;
    posts.push(...batch);
    console.log(`  posts página ${page}: ${batch.length}`);
    if (batch.length < 100) break;
  }

  return posts;
}

async function fetchMedia(ids: number[]): Promise<Map<number, any>> {
  const map = new Map<number, any>();
  const chunks: number[][] = [];

  for (let i = 0; i < ids.length; i += 100) {
    chunks.push(ids.slice(i, i + 100));
  }

  for (const chunk of chunks) {
    const url = `${WP_API}/media?per_page=100&include=${chunk.join(
      ",",
    )}&_fields=id,source_url,media_details,alt_text`;
    const items = await fetchJson<any[]>(url);
    for (const item of items) map.set(item.id, item);
  }

  return map;
}

async function fetchUsers(): Promise<Map<number, string>> {
  const users = await fetchJson<any[]>(
    `${WP_API}/users?per_page=100&_fields=id,name,url`,
  );
  return new Map(users.map((user) => [user.id, user.name]));
}

async function ensureVariants(source: string, slug: string) {
  for (const width of [480, 800]) {
    const variant = path.join(MEDIA_DIR, `${slug}-${width}.webp`);
    try {
      await access(variant);
    } catch {
      await sharp(source)
        .resize({ width, withoutEnlargement: true })
        .webp({ quality: 76 })
        .toFile(variant);
    }
  }
}

async function cacheImage(
  sourceUrl: string | undefined,
  slug: string,
): Promise<{ image: string; width: number; height: number }> {
  if (!sourceUrl) {
    return { image: FALLBACK_IMAGE, width: 1200, height: 630 };
  }

  const target = path.join(MEDIA_DIR, `${slug}.webp`);
  const publicPath = `/media/archive/${slug}.webp`;

  try {
    await access(target);
    await ensureVariants(target, slug);
    const metadata = await sharp(target).metadata();
    return {
      image: publicPath,
      width: metadata.width ?? 1200,
      height: metadata.height ?? 840,
    };
  } catch {
    // Se descarga y optimiza.
  }

  try {
    const response = await fetch(sourceUrl, { headers: HEADERS });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const buffer = Buffer.from(await response.arrayBuffer());
    await sharp(buffer)
      .rotate()
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality: 78 })
      .toFile(target);

    await ensureVariants(target, slug);

    const metadata = await sharp(target).metadata();
    return {
      image: publicPath,
      width: metadata.width ?? 1200,
      height: metadata.height ?? 840,
    };
  } catch (error) {
    console.warn(
      `  imagen no disponible (${slug}): ${
        error instanceof Error ? error.message : error
      }`,
    );
    return { image: FALLBACK_IMAGE, width: 1200, height: 630 };
  }
}

function pickMediaUrl(media: any): string | undefined {
  const sizes = media?.media_details?.sizes ?? {};
  return (
    sizes.large?.source_url ??
    sizes["1536x1536"]?.source_url ??
    sizes.medium_large?.source_url ??
    media?.source_url
  );
}

async function main() {
  await mkdir(DATA_DIR, { recursive: true });
  await mkdir(MEDIA_DIR, { recursive: true });

  console.log("Leyendo archivo de WordPress…");
  const [posts, users] = await Promise.all([fetchAllPosts(), fetchUsers()]);
  console.log(`Posts: ${posts.length} · Usuarios: ${users.size}`);

  const mediaIds = [
    ...new Set(posts.map((post) => post.featured_media).filter(Boolean)),
  ] as number[];
  console.log(`Medios destacados: ${mediaIds.length}`);
  const media = await fetchMedia(mediaIds);

  const articles: Article[] = [];
  const fetchedAt = new Date().toISOString();

  for (let i = 0; i < posts.length; i += 8) {
    const batch = posts.slice(i, i + 8);

    await Promise.all(
      batch.map(async (post) => {
        const slug = String(post.slug);
        const categories = (post.categories ?? []).map(
          (id: number) => CATEGORY_NAMES[id] ?? String(id),
        );
        const title = decodeHtml(post.title?.rendered ?? "");
        const contentHtml = cleanContent(post.content?.rendered ?? "");
        const contentText = stripHtml(contentHtml)
          .replace(/\[[^\]]*\]/g, " ")
          .replace(/\s+/g, " ")
          .trim();
        const rawExcerpt = stripHtml(post.excerpt?.rendered ?? "");
        const excerptSource =
          rawExcerpt &&
          !/\[|\.vc_|image_with_animation|full_screen|position:|display:/i.test(
            rawExcerpt,
          )
            ? rawExcerpt
            : contentText || title;
        const excerpt =
          excerptSource.length > 220
            ? `${excerptSource.slice(0, 220).replace(/\s+\S*$/, "").trim()}…`
            : excerptSource;
        const kind = classifyPost(post.categories ?? [], title, contentHtml);
        const mediaItem = media.get(post.featured_media);
        const sourceUrl = pickMediaUrl(mediaItem);
        const image = await cacheImage(sourceUrl, slug);
        const rawAuthor = users.get(post.author) ?? "Redacción";
        const authorName = rawAuthor.includes("@") ? "Redacción" : rawAuthor;

        articles.push({
          id: slug,
          source: "archive",
          sourceUrl: String(post.link ?? ""),
          href: `/noticias/${slug}/`,
          title,
          excerpt,
          contentHtml,
          image: image.image,
          imageWidth: image.width,
          imageHeight: image.height,
          authorName,
          authorUrl: "",
          section: categories[0] ?? "",
          categories,
          publishedAt: String(post.date ?? ""),
          modifiedAt: String(post.modified ?? ""),
          kind,
          tags: categories,
          featured: false,
          fetchedAt,
        });
      }),
    );

    console.log(
      `  ${Math.min(i + 8, posts.length)}/${posts.length} piezas procesadas`,
    );
  }

  articles.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

  await writeFile(
    path.join(DATA_DIR, "archive.json"),
    `${JSON.stringify(articles, null, 2)}\n`,
    "utf8",
  );

  const counts = articles.reduce<Record<string, number>>((acc, article) => {
    acc[article.kind] = (acc[article.kind] ?? 0) + 1;
    return acc;
  }, {});

  console.log(`Archivo listo: ${articles.length} piezas`, counts);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
