export function articleSrcSet(image: string): string | undefined {
  if (!image.startsWith("/media/articles/") || !image.endsWith(".webp")) {
    return undefined;
  }

  const base = image.slice(0, -".webp".length);
  return `${base}-480.webp 480w, ${base}-800.webp 800w, ${image} 1200w`;
}
