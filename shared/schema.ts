import { pgTable, text, serial, integer, boolean, timestamp, uuid, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Export Auth Models
export * from "./models/auth";

// === TABLE DEFINITIONS ===

export const clients = pgTable("clients", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  description: text("description"),
  niche: text("niche"),
  targetAudience: text("target_audience"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const sources = pgTable("sources", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: uuid("client_id").references(() => clients.id, { onDelete: 'cascade' }).notNull(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  type: text("type").default('blog').notNull(), // blog, youtube, news
  isActive: boolean("is_active").default(true).notNull(),
  lastScrapedAt: timestamp("last_scraped_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const contents = pgTable("contents", {
  id: uuid("id").primaryKey().defaultRandom(),
  sourceId: uuid("source_id").references(() => sources.id, { onDelete: 'cascade' }).notNull(),
  clientId: uuid("client_id").references(() => clients.id, { onDelete: 'cascade' }).notNull(),
  title: text("title").notNull(),
  url: text("url").notNull().unique(),
  contentText: text("content_text"),
  summary: text("summary"),
  topics: jsonb("topics").$type<string[]>(),
  publishedAt: timestamp("published_at"),
  scrapedAt: timestamp("scraped_at").defaultNow(),
  isAnalyzed: boolean("is_analyzed").default(false).notNull(),
});

export const briefs = pgTable("briefs", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: uuid("client_id").references(() => clients.id, { onDelete: 'cascade' }).notNull(),
  contentIds: uuid("content_ids").array(), // Array of content IDs used
  title: text("title").notNull(),
  angle: text("angle"),
  keyPoints: text("key_points").array(),
  contentType: text("content_type"),
  suggestedCopy: text("suggested_copy"),
  status: text("status").default('draft').notNull(), // draft, approved, rejected
  createdAt: timestamp("created_at").defaultNow(),
  generatedBy: text("generated_by").default('claude'),
});

export const analysisConfigs = pgTable("analysis_configs", {
  id: uuid("id").primaryKey().defaultRandom(),
  clientId: uuid("client_id").references(() => clients.id, { onDelete: 'cascade' }).notNull(),
  minContentLength: integer("min_content_length").default(500),
  topicsOfInterest: text("topics_of_interest").array(),
  excludePatterns: text("exclude_patterns").array(),
  createdAt: timestamp("created_at").defaultNow(),
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
