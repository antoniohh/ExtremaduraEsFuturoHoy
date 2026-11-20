import { access, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { load } from "cheerio";
import sharp from "sharp";
import type {
  Article,
  ArticleKind,
  SyncStatus,
} from "../src/lib/schema";

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, "src", "data");
const ARTICLE_MEDIA_DIR = path.join(ROOT, "public", "media", "articles");

const TEMATICA_URL =
  "https://www.hoy.es/tematicas/extremadura-es-futuro-hoy.html";
const AUTHOR_URL = "https://www.hoy.es/autor/daniel-vaquerizo-7580.html";

const MAX_ARTICLES = Number(process.env.HOY_MAX_ARTICLES ?? 18);
const REQUEST_DELAY_MS = Number(process.env.HOY_REQUEST_DELAY_MS ?? 1200);

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  "Accept-Language": "es-ES,es;q=0.9",
};

const PROJECT_PATTERNS = [
  "extremadura-futuro",
  "encuentro",
  "metafora-visual",
  "aceitunas-jope",
  "little-house",
  "azzurea",
  "old-school",
  "terracota",
  "zazu",
  "voleibol",
  "wanderlust",
  "the-glow",
  "glow",
];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function clean(value: unknown): string {
  return String(value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .replace(/^["“]|["”]$/g, "")
    .trim();
}

async function fetchText(url: string, attempt = 1): Promise<string> {
  try {
    const response = await fetch(url, { headers: HEADERS, redirect: "follow" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.text();
  } catch (error) {
    if (attempt < 3) {
      await sleep(1500 * attempt);
      return fetchText(url, attempt + 1);
    }
    throw error;
  }
}

function jsonLdBlocks(html: string): any[] {
  const $ = load(html);
  const blocks: any[] = [];

  $('script[type="application/ld+json"]').each((_, element) => {
    const raw = $(element).text().trim();
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);
      const values = Array.isArray(parsed) ? parsed : [parsed];
      for (const value of values) {
        if (value && value["@graph"]) blocks.push(...value["@graph"]);
        else if (value) blocks.push(value);
      }
    } catch {
      // Ignore malformed blocks; HOY sometimes includes tracking JSON.
    }
  });

  return blocks;
}

function itemListUrls(html: string): string[] {
  const urls = new Set<string>();

  for (const block of jsonLdBlocks(html)) {
    if (!block || block["@type"] !== "CollectionPage") continue;
    const list = block.mainEntity;
    if (!list || list["@type"] !== "ItemList") continue;

    for (const item of list.itemListElement ?? []) {
      if (typeof item?.url === "string") urls.add(item.url.split("#")[0]);
    }
  }

  if (urls.size === 0) {
    const $ = load(html);
    $("article a[href]").each((_, element) => {
      const href = $(element).attr("href");
      if (href?.startsWith("https://www.hoy.es/")) urls.add(href.split("#")[0]);
    });
  }

  return [...urls];
}

function isProjectUrl(url: string): boolean {
  const value = url.toLowerCase();
  return PROJECT_PATTERNS.some((pattern) => value.includes(pattern));
}

function slugFromUrl(url: string): string {
  const pathname = new URL(url).pathname;
  const basename = pathname.split("/").filter(Boolean).pop() ?? "articulo";
  return basename
    .replace(/\.html$/i, "")
    .replace(/[^a-z0-9-]/gi, "-")
    .toLowerCase()
    .slice(0, 90);
}

function firstImage(value: unknown): {
  url: string;
  width: number;
  height: number;
} {
  const candidate = Array.isArray(value) ? value[0] : value;

  if (typeof candidate === "string") {
    return { url: candidate, width: 1200, height: 840 };
  }

  if (candidate && typeof candidate === "object") {
    const image = candidate as Record<string, any>;
    return {
      url: String(image.url ?? image["@id"] ?? ""),
      width: Number(image.width ?? 1200),
      height: Number(image.height ?? 840),
    };
  }

  return { url: "", width: 1200, height: 840 };
}

function firstAuthor(value: unknown): { name: string; url: string } {
  const candidate = Array.isArray(value) ? value[0] : value;

  if (typeof candidate === "string") {
    return { name: clean(candidate), url: "" };
  }

  if (candidate && typeof candidate === "object") {
    const author = candidate as Record<string, any>;
    return {
      name: clean(author.name ?? "Redacción"),
      url: String(author.url ?? ""),
    };
  }

  return { name: "Redacción", url: "" };
}

function normalizeTags(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((tag) => clean(tag)).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((tag) => clean(tag))
      .filter(Boolean);
  }

  return [];
}

function classify(url: string, title: string, excerpt: string): ArticleKind {
  const urlValue = url.toLowerCase();
  const titleValue = title.toLowerCase();
  const excerptValue = excerpt.toLowerCase();

  if (
    urlValue.includes("encuentro") ||
    urlValue.endsWith("-ga.html") ||
    titleValue.includes("así fue el encuentro") ||
    titleValue.includes("charla-coloquio")
  ) {
    return "encuentro";
  }

  if (
    titleValue.includes("«") ||
    titleValue.includes("entrevista") ||
    /(cuenta|habla|conversamos|nos explica|asegura|reivindica)/.test(
      excerptValue,
    )
  ) {
    return "entrevista";
  }

  return "reportaje";
}

function extractArticle(html: string, url: string): Article | null {
  const blocks = jsonLdBlocks(html);
  const news = blocks.find((block) =>
    ["NewsArticle", "ReportageNewsArticle", "Article", "BlogPosting"].includes(
      block?.["@type"],
    ),
  );

  if (!news) return null;

  const title = clean(news.headline ?? news.name ?? "");
  if (!title) return null;

  const excerpt = clean(news.description ?? "");
  const image = firstImage(news.image);
  const author = firstAuthor(news.author);

  return {
    id: slugFromUrl(url),
    source: "hoy",
    sourceUrl: url,
    href: url,
    title,
    excerpt,
    contentHtml: "",
    image: image.url,
    imageWidth: image.width,
    imageHeight: image.height,
    authorName: author.name || "Redacción",
    authorUrl: author.url,
    section: clean(news.articleSection ?? ""),
    categories: [],
    publishedAt: String(news.datePublished ?? new Date().toISOString()),
    modifiedAt: String(news.dateModified ?? ""),
    kind: classify(url, title, excerpt),
    tags: normalizeTags(news.keywords),
    featured: false,
    fetchedAt: new Date().toISOString(),
  };
}

async function ensureArticleVariants(source: string, id: string) {
  for (const width of [480, 800]) {
    const variant = path.join(ARTICLE_MEDIA_DIR, `${id}-${width}.webp`);
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

async function cacheArticleImage(article: Article): Promise<Article> {
  if (!article.image.startsWith("http")) return article;

  const filename = `${article.id}.webp`;
  const target = path.join(ARTICLE_MEDIA_DIR, filename);
  const publicPath = `/media/articles/${filename}`;

  try {
    await access(target);
    await ensureArticleVariants(target, article.id);
    return { ...article, image: publicPath };
  } catch {
    // El archivo no existe todavía; se descarga y se optimiza.
  }

  try {
    const response = await fetch(article.image, { headers: HEADERS });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const buffer = Buffer.from(await response.arrayBuffer());
    await sharp(buffer)
      .rotate()
      .resize({ width: 1200, withoutEnlargement: true })
      .webp({ quality: 78 })
      .toFile(target);

    await ensureArticleVariants(target, article.id);

    const metadata = await sharp(target).metadata();

    return {
      ...article,
      image: publicPath,
      imageWidth: metadata.width ?? article.imageWidth,
      imageHeight: metadata.height ?? article.imageHeight,
    };
  } catch (error) {
    console.warn(
      `No se pudo cachear la imagen de ${article.sourceUrl}: ${
        error instanceof Error ? error.message : error
      }`,
    );
    return article;
  }
}

async function hasExistingArticles(): Promise<boolean> {
  try {
    await access(path.join(DATA_DIR, "articles.json"));
    return true;
  } catch {
    return false;
  }
}

async function main() {
  await mkdir(DATA_DIR, { recursive: true });
  await mkdir(ARTICLE_MEDIA_DIR, { recursive: true });

  const errors: string[] = [];
  const articles: Article[] = [];

  console.log("Leyendo temática y autor de HOY…");
  let tematicaHtml = "";
  let authorHtml = "";
  try {
    [tematicaHtml, authorHtml] = await Promise.all([
      fetchText(TEMATICA_URL),
      fetchText(AUTHOR_URL),
    ]);
  } catch (error) {
    if (await hasExistingArticles()) {
      console.warn(
        `Aviso: no se pudo conectar con HOY (${
          error instanceof Error ? error.message : error
        }). Se conserva el articles.json anterior.`,
      );
      return;
    }
    throw error;
  }

  const tematicaUrls = itemListUrls(tematicaHtml);
  const authorUrls = itemListUrls(authorHtml).filter(isProjectUrl);
  const urls = [...new Set([...tematicaUrls, ...authorUrls])].slice(
    0,
    MAX_ARTICLES,
  );

  console.log(
    `Temática: ${tematicaUrls.length} URLs · Autor: ${authorUrls.length} URLs · Total a revisar: ${urls.length}`,
  );

  for (const [index, url] of urls.entries()) {
    try {
      const html = await fetchText(url);
      const article = extractArticle(html, url);

      if (article) {
        const articleWithImage = await cacheArticleImage(article);
        const isFromTematica = tematicaUrls.includes(url);
        const isProject =
          isFromTematica ||
          isProjectUrl(url) ||
          article.tags.includes("Extremadura Es Futuro HOY");

        if (isProject) articles.push(articleWithImage);
      }
    } catch (error) {
      errors.push(`${url}: ${error instanceof Error ? error.message : error}`);
    }

    console.log(`  ${index + 1}/${urls.length} ${url}`);
    if (index < urls.length - 1) await sleep(REQUEST_DELAY_MS);
  }

  const uniqueArticles = [
    ...new Map(articles.map((article) => [article.sourceUrl, article])).values(),
  ]
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    )
    .map((article, index) => ({ ...article, featured: index < 3 }));

  if (uniqueArticles.length === 0) {
    if (await hasExistingArticles()) {
      console.warn(
        "Aviso: no se ha podido extraer ningún artículo nuevo. Se conserva el articles.json anterior.",
      );
      return;
    }
    throw new Error(
      "No se ha podido extraer ningún artículo y no existe un articles.json previo.",
    );
  }

  await writeFile(
    path.join(DATA_DIR, "articles.json"),
    `${JSON.stringify(uniqueArticles, null, 2)}\n`,
    "utf8",
  );

  const status: SyncStatus = {
    generatedAt: new Date().toISOString(),
    sources: {
      tematica: { url: TEMATICA_URL, count: tematicaUrls.length },
      autor: { url: AUTHOR_URL, count: authorUrls.length },
    },
    total: uniqueArticles.length,
    errors,
  };

  await writeFile(
    path.join(DATA_DIR, "sync-status.json"),
    `${JSON.stringify(status, null, 2)}\n`,
    "utf8",
  );

  console.log(
    `Listo: ${uniqueArticles.length} artículos. Errores: ${errors.length}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
