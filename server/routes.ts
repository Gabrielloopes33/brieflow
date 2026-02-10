import type { Express } from "express";
import type { Server } from "http";
import { supabaseAdmin } from "@shared/supabase";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Clients - Protected Routes
  app.get("/api/clients", async (req, res) => {
    const { data, error } = await supabaseAdmin
      .from('clients')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching clients:', error);
      return res.status(500).json({ message: 'Failed to fetch clients' });
    }

    res.json(data || []);
  });

  app.get("/api/clients/:id", async (req, res) => {
    const { data, error } = await supabaseAdmin
      .from('clients')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) {
      console.error('Error fetching client:', error);
      return res.status(500).json({ message: 'Failed to fetch client' });
    }

    if (!data) {
      return res.status(404).json({ message: 'Client not found' });
    }

    res.json(data);
  });

  app.post("/api/clients", async (req, res) => {
    try {
      const { name, description, niche, target_audience } = req.body;

      const { data, error } = await supabaseAdmin
        .from('clients')
        .insert({
          name,
          description,
          niche,
          target_audience,
        })
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to create client');

      res.status(201).json(data);
    } catch (error: any) {
      console.error('Error creating client:', error);
      res.status(500).json({ message: error.message || 'Failed to create client' });
    }
  });

  app.put("/api/clients/:id", async (req, res) => {
    try {
      const { name, description, niche, target_audience } = req.body;

      const { data, error } = await supabaseAdmin
        .from('clients')
        .update({
          name,
          description,
          niche,
          target_audience,
          updated_at: new Date().toISOString(),
        })
        .eq('id', req.params.id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Client not found');

      res.json(data);
    } catch (error: any) {
      console.error('Error updating client:', error);
      res.status(500).json({ message: error.message || 'Failed to update client' });
    }
  });

  app.delete("/api/clients/:id", async (req, res) => {
    try {
      const { error } = await supabaseAdmin
        .from('clients')
        .delete()
        .eq('id', req.params.id);

      if (error) throw error;

      res.status(204).send();
    } catch (error: any) {
      console.error('Error deleting client:', error);
      res.status(500).json({ message: error.message || 'Failed to delete client' });
    }
  });

  // Sources
  app.get("/api/clients/:clientId/sources", async (req, res) => {
    const { data, error } = await supabaseAdmin
      .from('sources')
      .select('*')
      .eq('client_id', req.params.clientId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching sources:', error);
      return res.status(500).json({ message: 'Failed to fetch sources' });
    }

    res.json(data || []);
  });

  app.post("/api/clients/:clientId/sources", async (req, res) => {
    try {
      const { name, url, type } = req.body;

      const { data, error } = await supabaseAdmin
        .from('sources')
        .insert({
          user_id: req.userId,
          client_id: req.params.clientId,
          name,
          url,
          type: type || 'blog',
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to create source');

      res.status(201).json(data);
    } catch (error: any) {
      console.error('Error creating source:', error);
      res.status(500).json({ message: error.message || 'Failed to create source' });
    }
  });

  app.delete("/api/sources/:id", async (req, res) => {
    try {
      const { error } = await supabaseAdmin
        .from('sources')
        .delete()
        .eq('id', req.params.id);

      if (error) throw error;

      res.status(204).send();
    } catch (error: any) {
      console.error('Error deleting source:', error);
      res.status(500).json({ message: error.message || 'Failed to delete source' });
    }
  });

  // Contents
  app.get("/api/clients/:id/contents", async (req, res) => {
    const { data, error } = await supabaseAdmin
      .from('contents')
      .select('*')
      .eq('client_id', req.params.id)
      .order('scraped_at', { ascending: false });

    if (error) {
      console.error('Error fetching contents:', error);
      return res.status(500).json({ message: 'Failed to fetch contents' });
    }

    res.json(data || []);
  });

  // Briefs
  app.get("/api/clients/:id/briefs", async (req, res) => {
    const { data, error } = await supabaseAdmin
      .from('briefs')
      .select('*')
      .eq('client_id', req.params.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching briefs:', error);
      return res.status(500).json({ message: 'Failed to fetch briefs' });
    }

    res.json(data || []);
  });

  app.get("/api/briefs/:id", async (req, res) => {
    const { data, error } = await supabaseAdmin
      .from('briefs')
      .select('*')
      .eq('id', req.params.id)
      .single();

    if (error) {
      console.error('Error fetching brief:', error);
      return res.status(500).json({ message: 'Failed to fetch brief' });
    }

    if (!data) {
      return res.status(404).json({ message: 'Brief not found' });
    }

    res.json(data);
  });

  app.post("/api/clients/:clientId/briefs", async (req, res) => {
    try {
      const { title, angle, key_points, content_type, suggested_copy, status } = req.body;

      const { data, error } = await supabaseAdmin
        .from('briefs')
        .insert({
          user_id: req.userId,
          client_id: req.params.clientId,
          title,
          angle,
          key_points,
          content_type,
          suggested_copy,
          status: status || 'draft',
          generated_by: 'manual',
        })
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to create brief');

      res.status(201).json(data);
    } catch (error: any) {
      console.error('Error creating brief:', error);
      res.status(500).json({ message: error.message || 'Failed to create brief' });
    }
  });

  app.put("/api/briefs/:id", async (req, res) => {
    try {
      const { title, angle, key_points, content_type, suggested_copy, status } = req.body;

      const { data, error } = await supabaseAdmin
        .from('briefs')
        .update({
          title,
          angle,
          key_points,
          content_type,
          suggested_copy,
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', req.params.id)
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Brief not found');

      res.json(data);
    } catch (error: any) {
      console.error('Error updating brief:', error);
      res.status(500).json({ message: error.message || 'Failed to update brief' });
    }
  });

  // AI Generation
  app.post("/api/clients/:clientId/briefs/generate", async (req, res) => {
    const { clientId } = req.params;
    const { topic } = req.body;

    try {
      const msg = await anthropic.messages.create({
        model: "claude-sonnet-4-20250514",
        max_tokens: 1024,
        messages: [{ role: "user", content: `Generate a content brief for a marketing article about ${topic || "industry trends"}. Return JSON with fields: title, angle, keyPoints (array of strings), suggestedCopy.` }],
      });

      const content = msg.content[0].text;

      const { data, error } = await supabaseAdmin
        .from('briefs')
        .insert({
          user_id: req.userId,
          client_id: clientId,
          title: `Generated Brief: ${topic || "Topic"}`,
          angle: "Comprehensive Guide",
          key_points: ["Point 1", "Point 2", "Point 3"],
          content_type: "article",
          suggested_copy: "Here is a draft copy...",
          status: "draft",
          generated_by: "claude",
        })
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to create brief');

      res.status(201).json(data);
    } catch (error: any) {
      console.error("AI Gen Error:", error);
      res.status(500).json({ message: error.message || "Failed to generate brief" });
    }
  });

  return httpServer;
}
