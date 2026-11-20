import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Article } from "../src/lib/schema";

const ROOT = process.cwd();
const ARCHIVE_PATH = path.join(ROOT, "src", "data", "archive.json");
const HTACCESS_PATH = path.join(ROOT, "public", ".htaccess");

async function main() {
  const archive = JSON.parse(
    await readFile(ARCHIVE_PATH, "utf8"),
  ) as Article[];

  const redirects = archive
    .map((article) => {
      const oldPath = new URL(article.sourceUrl).pathname;
      return `Redirect 301 ${oldPath} ${article.href}`;
    })
    .join("\n");

  const htaccess = `AddDefaultCharset UTF-8
DirectoryIndex index.html
Options -Indexes

ErrorDocument 404 /404.html

# Migración del WordPress original
Redirect 301 /ediciones-anteriores/ /ediciones/
RedirectMatch 410 ^/(login|register|resetpass|your-profile)/?$

${redirects}

<IfModule mod_headers.c>
  <FilesMatch "\\.(css|js|woff2|avif|webp|jpg|jpeg|png|svg|ico)$">
    Header set Cache-Control "public, max-age=31536000, immutable"
  </FilesMatch>
  <FilesMatch "\\.html$">
    Header set Cache-Control "public, max-age=300, must-revalidate"
  </FilesMatch>
  <FilesMatch "\\.(xml|txt)$">
    Header set Cache-Control "public, max-age=300, must-revalidate"
  </FilesMatch>
  Header set X-Content-Type-Options "nosniff"
  Header set Referrer-Policy "strict-origin-when-cross-origin"
  Header set Permissions-Policy "camera=(), microphone=(), geolocation=()"
</IfModule>
`;

  await writeFile(HTACCESS_PATH, htaccess, "utf8");
  console.log(`.htaccess generado con ${archive.length} redirecciones.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
