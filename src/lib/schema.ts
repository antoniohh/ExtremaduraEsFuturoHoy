import { z } from "zod";

export const ArticleKindSchema = z.enum(["entrevista", "encuentro", "reportaje"]);
export type ArticleKind = z.infer<typeof ArticleKindSchema>;

export const ArticleSchema = z.object({
  id: z.string().min(1),
  source: z.enum(["hoy", "archive"]),
  sourceUrl: z.string().min(1),
  href: z.string().min(1),
  title: z.string().min(1),
  excerpt: z.string().default(""),
  contentHtml: z.string().default(""),
  image: z.string().min(1),
  imageWidth: z.number().int().positive().default(1200),
  imageHeight: z.number().int().positive().default(840),
  authorName: z.string().default("Redacción"),
  authorUrl: z.string().default(""),
  section: z.string().default(""),
  categories: z.array(z.string()).default([]),
  publishedAt: z.string().min(1),
  modifiedAt: z.string().default(""),
  kind: ArticleKindSchema,
  tags: z.array(z.string()).default([]),
  featured: z.boolean().default(false),
  fetchedAt: z.string().min(1),
});
export type Article = z.infer<typeof ArticleSchema>;

export const SocialSchema = z.object({
  platform: z.enum(["instagram", "youtube", "tiktok"]),
  url: z.string().min(1),
  date: z.string().min(1),
  image: z.string().min(1),
  caption: z.string().min(1),
  relatedPerson: z.string().optional(),
  relatedCompany: z.string().optional(),
  relatedEvent: z.string().optional(),
  featured: z.boolean().default(false),
});
export type SocialPost = z.infer<typeof SocialSchema>;

export const EventSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  subtitle: z.string().optional().default(""),
  date: z.string().min(1),
  time: z.string().optional().default(""),
  place: z.string().min(1),
  city: z.string().min(1),
  province: z.string().optional().default(""),
  description: z.string().min(1),
  speakers: z.array(z.string()).default([]),
  articleSlug: z.string().optional().default(""),
  videoUrl: z.string().optional().default(""),
  image: z.string().min(1),
  status: z.enum(["upcoming", "past"]),
  registrationUrl: z.string().optional().default(""),
});
export type Event = z.infer<typeof EventSchema>;

export const YouTubeVideoSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  url: z.string().min(1),
  thumbnail: z.string().min(1),
  publishedAt: z.string().min(1),
  author: z.string().min(1),
});
export type YouTubeVideo = z.infer<typeof YouTubeVideoSchema>;

export const SyncStatusSchema = z.object({
  generatedAt: z.string().min(1),
  sources: z.record(
    z.string(),
    z.object({
      url: z.string(),
      count: z.number(),
    }),
  ),
  total: z.number(),
  errors: z.array(z.string()),
});
export type SyncStatus = z.infer<typeof SyncStatusSchema>;
