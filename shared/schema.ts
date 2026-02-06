import { sqliteTable, text, integer, boolean, timestamp, uuid } from "drizzle-orm/sqlite-core";
import { pgTable, text as pgText, serial, integer as pgInteger, boolean as pgBoolean, timestamp as pgTimestamp, uuid as pgUuid, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Database agnostic table exports
export const clients = sqliteTable("clients", {
  id: text("id").primaryKey().$default(() => crypto.randomUUID()),
  name: text("name").notNull(),
  description: text("description"),
  niche: text("niche"),
  targetAudience: text("target_audience"),
  createdAt: integer("created_at", { mode: "timestamp" }).$default(() => Date.now()),
});

export const sources = sqliteTable("sources", {
  id: text("id").primaryKey().$default(() => crypto.randomUUID()),
  clientId: text("client_id").notNull().references(() => clients.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  url: text("url").notNull(),
  type: text("type").default('blog').notNull(), // blog, youtube, news
  isActive: integer("is_active", { mode: "boolean" }).default(true).notNull(),
  lastScrapedAt: integer("last_scraped_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).$default(() => Date.now()),
});

export const contents = sqliteTable("contents", {
  id: text("id").primaryKey().$default(() => crypto.randomUUID()),
  sourceId: text("source_id").notNull().references(() => sources.id, { onDelete: 'cascade' }),
  clientId: text("client_id").notNull().references(() => clients.id, { onDelete: 'cascade' }),
  title: text("title").notNull(),
  url: text("url").notNull(),
  contentText: text("content_text"),
  summary: text("summary"),
  topics: text("topics", { mode: "json" }), // JSON for SQLite
  publishedAt: integer("published_at", { mode: "timestamp" }),
  scrapedAt: integer("scraped_at", { mode: "timestamp" }).$default(() => Date.now()),
  isAnalyzed: integer("is_analyzed", { mode: "boolean" }).default(false).notNull(),
});

export const briefs = sqliteTable("briefs", {
  id: text("id").primaryKey().$default(() => crypto.randomUUID()),
  clientId: text("client_id").notNull().references(() => clients.id, { onDelete: 'cascade' }),
  contentIds: text("content_ids", { mode: "json" }), // JSON array for SQLite
  title: text("title").notNull(),
  angle: text("angle"),
  keyPoints: text("key_points", { mode: "json" }), // JSON array for SQLite
  contentType: text("content_type"),
  suggestedCopy: text("suggested_copy"),
  status: text("status").default('draft').notNull(), // draft, approved, rejected
  createdAt: integer("created_at", { mode: "timestamp" }).$default(() => Date.now()),
  generatedBy: text("generated_by").default('claude'),
});

export const analysisConfigs = sqliteTable("analysis_configs", {
  id: text("id").primaryKey().$default(() => crypto.randomUUID()),
  clientId: text("client_id").notNull().references(() => clients.id, { onDelete: 'cascade' }),
  minContentLength: integer("min_content_length").default(500),
  topicsOfInterest: text("topics_of_interest", { mode: "json" }), // JSON array for SQLite
  excludePatterns: text("exclude_patterns", { mode: "json" }), // JSON array for SQLite
  createdAt: integer("created_at", { mode: "timestamp" }).$default(() => Date.now()),
});

// === SCHEMAS ===

export const insertClientSchema = createInsertSchema(clients).omit({ id: true, createdAt: true });
export const insertSourceSchema = createInsertSchema(sources).omit({ id: true, createdAt: true, lastScrapedAt: true });
export const insertContentSchema = createInsertSchema(contents).omit({ id: true, scrapedAt: true });
export const insertBriefSchema = createInsertSchema(briefs).omit({ id: true, createdAt: true });
export const insertAnalysisConfigSchema = createInsertSchema(analysisConfigs).omit({ id: true, createdAt: true });

// === TYPES ===

export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;

export type Source = typeof sources.$inferSelect;
export type InsertSource = z.infer<typeof insertSourceSchema>;

export type Content = typeof contents.$inferSelect;
export type InsertContent = z.infer<typeof insertContentSchema>;

export type Brief = typeof briefs.$inferSelect;
export type InsertBrief = z.infer<typeof insertBriefSchema>;

export type AnalysisConfig = typeof analysisConfigs.$inferSelect;
export type InsertAnalysisConfig = z.infer<typeof insertAnalysisConfigSchema>;