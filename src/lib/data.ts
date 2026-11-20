import articlesJson from "../data/articles.json";
import archiveJson from "../data/archive.json";
import eventsJson from "../data/events.json";
import socialJson from "../data/social.json";
import syncStatusJson from "../data/sync-status.json";
import tiktokJson from "../data/tiktok.json";
import youtubeJson from "../data/youtube.json";
import {
  ArticleSchema,
  EventSchema,
  SocialSchema,
  SyncStatusSchema,
  YouTubeVideoSchema,
  type Article,
  type Event,
  type SocialPost,
  type YouTubeVideo,
} from "./schema";

const byPublishedAt = (a: Article, b: Article) =>
  new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();

export const hoyArticles: Article[] = ArticleSchema.array()
  .parse(articlesJson)
  .sort(byPublishedAt);

export const archive: Article[] = ArticleSchema.array()
  .parse(archiveJson)
  .sort(byPublishedAt);

export const articles: Article[] = [...hoyArticles, ...archive].sort(
  byPublishedAt,
);

export const social: SocialPost[] = SocialSchema.array()
  .parse(socialJson)
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

export const events: Event[] = EventSchema.array().parse(eventsJson);

export const youtube: YouTubeVideo[] = YouTubeVideoSchema.array()
  .parse(youtubeJson)
  .sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );

export const syncStatus = SyncStatusSchema.parse(syncStatusJson);

export const interviews = articles.filter(
  (article) => article.kind === "entrevista",
);
export const encounters = articles.filter(
  (article) => article.kind === "encuentro",
);
export const reports = articles.filter(
  (article) => article.kind === "reportaje",
);

export const leadArticle = articles[0];
export const latestArticles = articles.slice(1, 6);

export const upcomingEvent = events.find((event) => event.status === "upcoming");
export const pastEvents = events
  .filter((event) => event.status === "past")
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

export const instagramPosts = social.filter(
  (post) => post.platform === "instagram",
);
export const youtubePosts = social.filter((post) => post.platform === "youtube");
export const tiktokPosts = SocialSchema.array()
  .parse(tiktokJson)
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

export function getArticleBySlug(slug: string): Article | undefined {
  return articles.find((article) => article.id === slug);
}

export function getEventBySlug(slug: string): Event | undefined {
  return events.find((event) => event.slug === slug);
}

export function getRelatedArticles(event: Event): Article[] {
  const related = articles.filter(
    (article) =>
      article.kind === "encuentro" &&
      (article.id.includes(event.slug.split("-")[0]) ||
        article.title.toLowerCase().includes(event.title.split(":")[0].toLowerCase())),
  );

  return related.length > 0 ? related : encounters.slice(0, 2);
}
