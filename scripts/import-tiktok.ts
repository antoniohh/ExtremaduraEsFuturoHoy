import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import type { SocialPost } from "../src/lib/schema";

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, "src", "data");
const MEDIA_DIR = path.join(ROOT, "public", "media", "tiktok");

const USER = "extremaduraesfuturohoy";
const BASE_IMAGE =
  "https://www.hoyextremaduraesfuturo.es/wp-content/uploads/sb-tiktok-feeds-images";

/**
 * Últimos vídeos disponibles en la caché pública del plugin de TikTok del
 * WordPress original. TikTok no expone un listado público sin API o firma,
 * así que esta es la fuente fiable para las portadas.
 */
const VIDEO_IDS = [
  "7489129182077766934",
  "7488342343800704278",
  "7488293247098342678",
  "7487938970488147222",
  "7486817457316039938",
  "7486163253261896982",
  "7485473222347984150",
  "7484247912252198166",
  "7483974272533384470",
  "7483547745387547926",
  "7483512541377809686",
  "7482816859868335383",
  "7481635127580216598",
  "7481395529746812182",
  "7481381558042103062",
  "7480158155419241750",
  "7479058279172197654",
  "7478843541624524054",
  "7478406111616568599",
  "7478397607086247190",
  "7477966635765075222",
  "7477935535173094678",
  "7477625005602295062",
  "7476215621622041878",
  "7475425178458082582",
  "7474988389704437014",
  "7474971071666605334",
  "7473489416682523926",
  "7472530954792357142",
  "7471265835777133846",
  "7471241541713988886",
  "7470596324728032534",
  "7470532796751023382",
  "7470512338345446678",
  "7470505815112289558",
  "7470140619122396438",
  "7469836389694098710",
  "7468308363542023446",
  "7467154868235406614",
  "7465681395495570710",
  "7465674793707179286",
  "7465369559990766871",
  "7462795894316961057",
  "7462434471946538273",
  "7462345810861149473",
  "7462060464353201440",
  "7462030476811767072",
  "7454270227354766625",
  "7452734112231607584",
  "7451615191973776673",
  "7450525996911971617",
  "7449738242024312096",
  "7447864383755062561",
  "7446887782993169696",
  "7444963779210644768",
  "7444148538642025761",
  "7443790065479765280",
  "7442282852730916128",
  "7441898542592986400",
  "7441882720810110240",
  "7441180871119359264",
  "7440137558694153504",
  "7439782511842053409",
  "7439439532317052192",
  "7439428064917949729",
  "7439009395830279457",
  "7437507571763662112",
  "7437151245028166944",
  "7436788849931554080",
  "7436338710129544481",
  "7435996007118441761",
  "7434137124804300064",
];

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
  Accept: "image/webp,image/*,*/*;q=0.8",
};

async function main() {
  await mkdir(DATA_DIR, { recursive: true });
  await mkdir(MEDIA_DIR, { recursive: true });

  const posts: SocialPost[] = [];

  for (const id of VIDEO_IDS) {
    const target = path.join(MEDIA_DIR, `${id}.webp`);
    const publicPath = `/media/tiktok/${id}.webp`;
    const source = `${BASE_IMAGE}/${id}-full.webp`;

    try {
      const response = await fetch(source, { headers: HEADERS });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const buffer = Buffer.from(await response.arrayBuffer());
      await sharp(buffer)
        .resize({ width: 1080, withoutEnlargement: true })
        .webp({ quality: 80 })
        .toFile(target);

      for (const width of [480, 720]) {
        await sharp(target)
          .resize({ width, withoutEnlargement: true })
          .webp({ quality: 76 })
          .toFile(path.join(MEDIA_DIR, `${id}-${width}.webp`));
      }
    } catch (error) {
      console.warn(
        `TikTok ${id}: ${error instanceof Error ? error.message : error}`,
      );
    }

    const timestamp = Number(BigInt(id) >> 32n) * 1000;

    posts.push({
      platform: "tiktok",
      url: `https://www.tiktok.com/@${USER}/video/${id}`,
      date: new Date(timestamp).toISOString(),
      image: publicPath,
      caption: "Clip de TikTok · @extremaduraesfuturohoy",
      featured: false,
    });
  }

  await writeFile(
    path.join(DATA_DIR, "tiktok.json"),
    `${JSON.stringify(posts, null, 2)}\n`,
    "utf8",
  );

  console.log(`TikTok listo: ${posts.length} vídeos.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
