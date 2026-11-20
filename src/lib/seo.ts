import type { Article, Event, YouTubeVideo } from "./schema";
import { SITE } from "./site";

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path;
  return new URL(path, SITE.url).toString();
}

export function articleUrl(article: Article): string {
  return absoluteUrl(article.href);
}

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE.url}/#organization`,
    name: SITE.name,
    url: SITE.url,
    logo: absoluteUrl("/logo.png"),
    description: SITE.description,
    sameAs: [
      SITE.social.instagram,
      SITE.social.youtube,
      SITE.social.tiktok,
      SITE.hoy.tematica,
      SITE.hoy.autor,
    ],
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE.url}/#website`,
    name: SITE.name,
    url: SITE.url,
    description: SITE.description,
    inLanguage: "es-ES",
    publisher: { "@id": `${SITE.url}/#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE.url}/buscar/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function collectionSchema(
  name: string,
  description: string,
  path: string,
  articles: Article[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url: absoluteUrl(path),
    inLanguage: "es-ES",
    isPartOf: { "@id": `${SITE.url}/#website` },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: articles.map((article, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: articleUrl(article),
        name: article.title,
      })),
    },
  };
}

export function articleSchema(article: Article) {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.excerpt,
    image: [absoluteUrl(article.image)],
    datePublished: article.publishedAt,
    dateModified: article.modifiedAt || article.publishedAt,
    author: {
      "@type": "Person",
      name: article.authorName,
    },
    publisher: { "@id": `${SITE.url}/#organization` },
    mainEntityOfPage: articleUrl(article),
    articleSection: article.section,
    inLanguage: "es-ES",
  };
}

export function videoSchema(video: YouTubeVideo) {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: video.title,
    description: video.title,
    thumbnailUrl: [video.thumbnail],
    uploadDate: video.publishedAt,
    contentUrl: video.url,
    embedUrl: `https://www.youtube.com/embed/${video.id}`,
    publisher: { "@id": `${SITE.url}/#organization` },
  };
}

export function eventSchema(event: Event) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description,
    startDate: `${event.date}T${event.time || "00:00"}:00`,
    eventStatus:
      event.status === "upcoming"
        ? "https://schema.org/EventScheduled"
        : "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: event.place,
      address: {
        "@type": "PostalAddress",
        addressLocality: event.city,
        addressRegion: event.province || "Extremadura",
        addressCountry: "ES",
      },
    },
    image: [absoluteUrl(event.image)],
    organizer: { "@id": `${SITE.url}/#organization` },
    offers: {
      "@type": "Offer",
      price: 0,
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
      url: event.registrationUrl || absoluteUrl(`/encuentros/${event.slug}/`),
    },
  };
}

export function breadcrumbSchema(
  items: Array<{ name: string; path: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
