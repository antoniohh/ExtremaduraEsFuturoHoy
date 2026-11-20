import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  ArticleSchema,
  EventSchema,
  SocialSchema,
  SyncStatusSchema,
  YouTubeVideoSchema,
} from "../src/lib/schema";

const DATA_DIR = path.join(process.cwd(), "src", "data");

async function readJson<T>(file: string): Promise<T> {
  const content = await readFile(path.join(DATA_DIR, file), "utf8");
  return JSON.parse(content) as T;
}

async function main() {
  const articles = ArticleSchema.array().parse(
    await readJson<unknown>("articles.json"),
  );
  const archive = ArticleSchema.array().parse(
    await readJson<unknown>("archive.json"),
  );
  const social = SocialSchema.array().parse(
    await readJson<unknown>("social.json"),
  );
  const events = EventSchema.array().parse(
    await readJson<unknown>("events.json"),
  );

  try {
    YouTubeVideoSchema.array().parse(await readJson<unknown>("youtube.json"));
  } catch {
    console.warn("youtube.json no existe todavía; se omite.");
  }

  try {
    SyncStatusSchema.parse(await readJson<unknown>("sync-status.json"));
  } catch {
    console.warn("sync-status.json no existe todavía; se omite.");
  }

  console.log(
    `Datos válidos: ${articles.length} artículos, ${archive.length} piezas de archivo, ${social.length} posts, ${events.length} eventos.`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
