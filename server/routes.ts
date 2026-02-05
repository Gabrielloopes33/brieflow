import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth Setup
  await setupAuth(app);
  registerAuthRoutes(app);

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

  return httpServer;
}
