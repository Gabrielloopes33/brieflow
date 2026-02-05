import { 
  clients, sources, contents, briefs, analysisConfigs,
  type InsertClient, type Client,
  type InsertSource, type Source,
  type InsertContent, type Content,
  type InsertBrief, type Brief,
  type InsertAnalysisConfig, type AnalysisConfig
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Clients
  getClients(): Promise<Client[]>;
  getClient(id: string): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: string, updates: Partial<InsertClient>): Promise<Client>;
  deleteClient(id: string): Promise<void>;

  // Sources
  getSourcesByClientId(clientId: string): Promise<Source[]>;
  createSource(source: InsertSource): Promise<Source>;
  deleteSource(id: string): Promise<void>;

  // Contents
  getContentsByClientId(clientId: string): Promise<Content[]>;
  createContent(content: InsertContent): Promise<Content>;
  
  // Briefs
  getBriefsByClientId(clientId: string): Promise<Brief[]>;
  getBrief(id: string): Promise<Brief | undefined>;
  createBrief(brief: InsertBrief): Promise<Brief>;
  updateBrief(id: string, updates: Partial<InsertBrief>): Promise<Brief>;
}

export class DatabaseStorage implements IStorage {
  // Clients
  async getClients(): Promise<Client[]> {
    return await db.select().from(clients).orderBy(desc(clients.createdAt));
  }

  async getClient(id: string): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client;
  }

  async createClient(insertClient: InsertClient): Promise<Client> {
    const [client] = await db.insert(clients).values(insertClient).returning();
    return client;
  }

  async updateClient(id: string, updates: Partial<InsertClient>): Promise<Client> {
    const [client] = await db.update(clients).set(updates).where(eq(clients.id, id)).returning();
    return client;
  }

  async deleteClient(id: string): Promise<void> {
    await db.delete(clients).where(eq(clients.id, id));
  }

  // Sources
  async getSourcesByClientId(clientId: string): Promise<Source[]> {
    return await db.select().from(sources).where(eq(sources.clientId, clientId)).orderBy(desc(sources.createdAt));
  }

  async createSource(insertSource: InsertSource): Promise<Source> {
    const [source] = await db.insert(sources).values(insertSource).returning();
    return source;
  }

  async deleteSource(id: string): Promise<void> {
    await db.delete(sources).where(eq(sources.id, id));
  }

  // Contents
  async getContentsByClientId(clientId: string): Promise<Content[]> {
    return await db.select().from(contents).where(eq(contents.clientId, clientId)).orderBy(desc(contents.scrapedAt));
  }

  async createContent(insertContent: InsertContent): Promise<Content> {
    const [content] = await db.insert(contents).values(insertContent).returning();
    return content;
  }

  // Briefs
  async getBriefsByClientId(clientId: string): Promise<Brief[]> {
    return await db.select().from(briefs).where(eq(briefs.clientId, clientId)).orderBy(desc(briefs.createdAt));
  }

  async getBrief(id: string): Promise<Brief | undefined> {
    const [brief] = await db.select().from(briefs).where(eq(briefs.id, id));
    return brief;
  }

  async createBrief(insertBrief: InsertBrief): Promise<Brief> {
    const [brief] = await db.insert(briefs).values(insertBrief).returning();
    return brief;
  }

  async updateBrief(id: string, updates: Partial<InsertBrief>): Promise<Brief> {
    const [brief] = await db.update(briefs).set(updates).where(eq(briefs.id, id)).returning();
    return brief;
  }
}

export const storage = new DatabaseStorage();
