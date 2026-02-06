import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import Anthropic from "@anthropic-ai/sdk";
import {
  checkScraperHealth,
  startScraping,
  getTaskStatus,
  getAllTasks,
  scrapeUrl,
  testSource,
  getClientContentsFromScraper,
} from "./services/scraper";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth Setup - comentado para desenvolvimento
  // await setupAuth(app);
  // registerAuthRoutes(app);

  // Clients
  app.get(api.clients.list.path, async (req, res) => {
    // In a real app, filter by user ownership
    const clients = await storage.getClients();
    res.json(clients);
  });

  app.get(api.clients.get.path, async (req, res) => {
    const client = await storage.getClient(req.params.id);
    if (!client) return res.status(404).json({ message: "Client not found" });
    res.json(client);
  });

  app.post(api.clients.create.path, async (req, res) => {
    try {
      const input = api.clients.create.input.parse(req.body);
      const client = await storage.createClient(input);
      res.status(201).json(client);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put(api.clients.update.path, async (req, res) => {
    try {
      const input = api.clients.update.input.parse(req.body);
      const client = await storage.updateClient(req.params.id, input);
      res.json(client);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(404).json({ message: "Client not found" });
    }
  });

  app.delete(api.clients.delete.path, async (req, res) => {
    await storage.deleteClient(req.params.id);
    res.status(204).send();
  });

  // Sources
  app.get(api.sources.list.path, async (req, res) => {
    const sources = await storage.getSourcesByClientId(req.params.clientId);
    res.json(sources);
  });

  app.post(api.sources.create.path, async (req, res) => {
    try {
      const input = api.sources.create.input.parse(req.body);
      const source = await storage.createSource({
        ...input,
        clientId: req.params.clientId,
      });
      res.status(201).json(source);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.sources.delete.path, async (req, res) => {
    await storage.deleteSource(req.params.id);
    res.status(204).send();
  });

  // Contents
  app.get(api.contents.list.path, async (req, res) => {
    const contents = await storage.getContentsByClientId(req.params.clientId);
    res.json(contents);
  });

  // Briefs
  app.get(api.briefs.list.path, async (req, res) => {
    const briefs = await storage.getBriefsByClientId(req.params.clientId);
    res.json(briefs);
  });

  app.get(api.briefs.get.path, async (req, res) => {
    const brief = await storage.getBrief(req.params.id);
    if (!brief) return res.status(404).json({ message: "Brief not found" });
    res.json(brief);
  });

  app.post(api.briefs.create.path, async (req, res) => {
    try {
      const input = api.briefs.create.input.parse(req.body);
      const brief = await storage.createBrief({
        ...input,
        clientId: req.params.clientId,
      });
      res.status(201).json(brief);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.put(api.briefs.update.path, async (req, res) => {
    try {
      const input = api.briefs.update.input.parse(req.body);
      const brief = await storage.updateBrief(req.params.id, input);
      res.json(brief);
    } catch (err) {
      res.status(404).json({ message: "Brief not found" });
    }
  });

  // AI Generation
  app.post(api.briefs.generate.path, async (req, res) => {
    const { clientId } = req.params;
    const { topic } = req.body;

    try {
      const msg = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514", // As per integration instructions
        max_tokens: 1024,
        messages: [{ role: "user", content: `Generate a content brief for a marketing article about ${topic || "industry trends"}. Return JSON with fields: title, angle, keyPoints (array of strings), suggestedCopy.` }],
      });

      // Simple mock parsing of response - in prod would need robust parsing
      const content = msg.content[0].text;
      // This is a simplified example. Real app needs structured output parsing.
      
      // Creating a mock brief for MVP demonstration if JSON parsing fails or mock data needed
      const brief = await storage.createBrief({
        clientId,
        title: `Generated Brief: ${topic || "Topic"}`,
        angle: "Comprehensive Guide",
        keyPoints: ["Point 1", "Point 2", "Point 3"],
        suggestedCopy: "Here is a draft copy...",
        status: "draft",
        generatedBy: "claude"
      });

      res.status(201).json(brief);
    } catch (error: any) {
        console.error("AI Gen Error:", error);
        res.status(500).json({ message: error.message });
    }
  });

  // ========== SCRAPER INTEGRATION ROUTES ==========

  // Health check do scraper
  app.get("/api/scraper/health", async (_req, res) => {
    try {
      const isHealthy = await checkScraperHealth();
      res.json({ 
        status: isHealthy ? "healthy" : "unavailable",
        scraper_url: process.env.SCRAPER_API_URL || "http://localhost:8000"
      });
    } catch (error: any) {
      res.status(503).json({ 
        status: "unavailable", 
        message: error.message 
      });
    }
  });

  // Iniciar scraping para um cliente
  app.post("/api/clients/:clientId/scrape", async (req, res) => {
    try {
      const { clientId } = req.params;
      const { source_ids, force_rescrape } = req.body;

      // Verificar se o cliente existe
      const client = await storage.getClient(clientId);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }

      // Se não foram especificadas fontes, buscar todas as fontes do cliente
      let targetSourceIds = source_ids;
      if (!targetSourceIds || targetSourceIds.length === 0) {
        const sources = await storage.getSourcesByClientId(clientId);
        targetSourceIds = sources.map(s => s.id);
      }

      if (targetSourceIds.length === 0) {
        return res.status(400).json({ 
          message: "No sources found for this client. Add sources first." 
        });
      }

      // Iniciar scraping
      const result = await startScraping({
        source_ids: targetSourceIds,
        client_ids: [clientId],
        force_rescrape: force_rescrape || false,
      });

      res.status(202).json({
        message: "Scraping started successfully",
        task_id: result.task_id,
        client_id: clientId,
        sources_count: targetSourceIds.length,
        status: result.status,
        estimated_duration: result.estimated_duration,
      });
    } catch (error: any) {
      console.error("❌ Error starting scraping:", error);
      res.status(500).json({ 
        message: "Failed to start scraping",
        error: error.message 
      });
    }
  });

  // Obter status de uma tarefa de scraping
  app.get("/api/scraper/tasks/:taskId", async (req, res) => {
    try {
      const { taskId } = req.params;
      const status = await getTaskStatus(taskId);
      res.json(status);
    } catch (error: any) {
      console.error("❌ Error getting task status:", error);
      res.status(500).json({ 
        message: "Failed to get task status",
        error: error.message 
      });
    }
  });

  // Obter todas as tarefas de scraping
  app.get("/api/scraper/tasks", async (_req, res) => {
    try {
      const tasks = await getAllTasks();
      res.json(tasks);
    } catch (error: any) {
      console.error("❌ Error getting tasks:", error);
      res.status(500).json({ 
        message: "Failed to get tasks",
        error: error.message 
      });
    }
  });

  // Fazer scraping de uma URL específica
  app.post("/api/scraper/scrape-url", async (req, res) => {
    try {
      const { url } = req.body;
      
      if (!url) {
        return res.status(400).json({ message: "URL is required" });
      }

      const content = await scrapeUrl(url);
      res.json(content);
    } catch (error: any) {
      console.error("❌ Error scraping URL:", error);
      res.status(500).json({ 
        message: "Failed to scrape URL",
        error: error.message 
      });
    }
  });

  // Testar uma fonte antes de adicionar
  app.post("/api/scraper/test-source", async (req, res) => {
    try {
      const { url, type } = req.body;
      
      if (!url || !type) {
        return res.status(400).json({ 
          message: "URL and type are required" 
        });
      }

      const result = await testSource(url, type);
      res.json(result);
    } catch (error: any) {
      console.error("❌ Error testing source:", error);
      res.status(500).json({ 
        message: "Failed to test source",
        error: error.message 
      });
    }
  });

  // Sincronizar conteúdos do scraper para o banco local
  app.post("/api/clients/:clientId/sync-contents", async (req, res) => {
    try {
      const { clientId } = req.params;
      const { limit } = req.query;

      // Verificar se o cliente existe
      const client = await storage.getClient(clientId);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }

      // Buscar conteúdos do scraper
      const { contents } = await getClientContentsFromScraper(
        clientId, 
        parseInt(limit as string) || 100
      );

      // Aqui você pode adicionar lógica para sincronizar com o banco local
      // Por enquanto, apenas retornamos os conteúdos
      res.json({
        message: "Contents retrieved from scraper",
        client_id: clientId,
        contents_count: contents.length,
        contents,
      });
    } catch (error: any) {
      console.error("❌ Error syncing contents:", error);
      res.status(500).json({ 
        message: "Failed to sync contents",
        error: error.message 
      });
    }
  });

  return httpServer;
}
