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

  // Knowledge Items
  app.get("/api/clients/:clientId/knowledge", async (req, res) => {
    const { data, error } = await supabaseAdmin
      .from('knowledge_items')
      .select('*')
      .eq('client_id', req.params.clientId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching knowledge items:', error);
      return res.status(500).json({ message: 'Failed to fetch knowledge items' });
    }

    res.json(data || []);
  });

  app.post("/api/clients/:clientId/knowledge", async (req, res) => {
    try {
      const { title, content, type, source_url } = req.body;

      const { data, error } = await supabaseAdmin
        .from('knowledge_items')
        .insert({
          user_id: req.userId,
          client_id: req.params.clientId,
          title,
          content,
          type,
          source_url,
        })
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('Failed to create knowledge item');

      res.status(201).json(data);
    } catch (error: any) {
      console.error('Error creating knowledge item:', error);
      res.status(500).json({ message: error.message || 'Failed to create knowledge item' });
    }
  });

  app.delete("/api/knowledge/:id", async (req, res) => {
    try {
      const { error } = await supabaseAdmin
        .from('knowledge_items')
        .delete()
        .eq('id', req.params.id);

      if (error) throw error;

      res.status(204).send();
    } catch (error: any) {
      console.error('Error deleting knowledge item:', error);
      res.status(500).json({ message: error.message || 'Failed to delete knowledge item' });
    }
  });

  // ===== ANALYTICS - MULTI-ACCOUNT OAUTH SYSTEM =====

  // Helper function to refresh Meta token
  async function refreshMetaToken(refreshToken: string) {
    const appId = process.env.META_APP_ID;
    const appSecret = process.env.META_APP_SECRET;
    
    const res = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${refreshToken}`);
    return await res.json();
  }

  // Helper function to refresh Google token
  async function refreshGoogleToken(refreshToken: string) {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: clientId!,
        client_secret: clientSecret!,
      }),
    });
    return await res.json();
  }

  // Helper to get valid token (refresh if needed)
  async function getValidToken(userId: string, platform: string, accountId: string) {
    const { data: tokenData, error } = await supabaseAdmin
      .from('analytics_tokens')
      .select('*')
      .eq('user_id', userId)
      .eq('platform', platform)
      .eq('account_id', accountId)
      .eq('is_active', true)
      .single();
    
    if (error || !tokenData) {
      throw new Error('Token not found');
    }
    
    // Check if token is expired or will expire in next 5 minutes
    const expiresAt = new Date(tokenData.expires_at);
    const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
    
    if (expiresAt <= fiveMinutesFromNow && tokenData.refresh_token) {
      // Token needs refresh
      let refreshResult;
      if (platform === 'meta') {
        refreshResult = await refreshMetaToken(tokenData.refresh_token);
      } else {
        refreshResult = await refreshGoogleToken(tokenData.refresh_token);
      }
      
      if (refreshResult.error) {
        throw new Error(refreshResult.error.message || 'Token refresh failed');
      }
      
      // Update token in database
      const newExpiresAt = refreshResult.expires_in 
        ? new Date(Date.now() + refreshResult.expires_in * 1000).toISOString()
        : new Date(Date.now() + 3600 * 1000).toISOString(); // Default 1 hour
      
      await supabaseAdmin
        .from('analytics_tokens')
        .update({
          access_token: refreshResult.access_token,
          expires_at: newExpiresAt,
          updated_at: new Date().toISOString(),
        })
        .eq('id', tokenData.id);
      
      return refreshResult.access_token;
    }
    
    return tokenData.access_token;
  }

  // Meta OAuth - Redirect to Facebook OAuth dialog
  app.get("/api/auth/meta", async (req, res) => {
    const appId = process.env.META_APP_ID;
    const redirectUri = `${process.env.APP_URL}/api/auth/meta/callback`;
    const scope = 'pages_read_engagement,pages_read_user_content,ads_read,read_insights';
    
    if (!appId) {
      return res.status(500).json({ message: 'META_APP_ID not configured' });
    }
    
    const authUrl = `https://www.facebook.com/v18.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&state=${req.userId}`;
    res.redirect(authUrl);
  });

  // Meta OAuth Callback - Multi-Account Support
  app.get("/api/auth/meta/callback", async (req, res) => {
    const { code, state: userId } = req.query;
    const appId = process.env.META_APP_ID;
    const appSecret = process.env.META_APP_SECRET;
    const redirectUri = `${process.env.APP_URL}/api/auth/meta/callback`;
    
    if (!code || !userId) {
      return res.status(400).json({ message: 'Missing code or user' });
    }
    
    try {
      // Exchange code for access token
      const tokenRes = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&code=${code}&redirect_uri=${encodeURIComponent(redirectUri)}`);
      const tokenData = await tokenRes.json();
      
      if (tokenData.error) {
        throw new Error(tokenData.error.message);
      }
      
      // Get long-lived token (60 days)
      const longLivedRes = await fetch(`https://graph.facebook.com/v18.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${appId}&client_secret=${appSecret}&fb_exchange_token=${tokenData.access_token}`);
      const longLivedData = await longLivedRes.json();
      
      const accessToken = longLivedData.access_token || tokenData.access_token;
      const expiresIn = longLivedData.expires_in || tokenData.expires_in;
      
      // Fetch all pages the user manages
      const pagesRes = await fetch(`https://graph.facebook.com/v18.0/me/accounts?access_token=${accessToken}&fields=id,name,access_token`);
      const pagesData = await pagesRes.json();
      
      // Fetch all ad accounts
      const adAccountsRes = await fetch(`https://graph.facebook.com/v18.0/me/adaccounts?access_token=${accessToken}&fields=id,name`);
      const adAccountsData = await adAccountsRes.json();
      
      const expiresAt = expiresIn 
        ? new Date(Date.now() + expiresIn * 1000).toISOString()
        : new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(); // 60 days default
      
      // Store pages
      if (pagesData.data && pagesData.data.length > 0) {
        for (const page of pagesData.data) {
          await supabaseAdmin
            .from('analytics_tokens')
            .upsert({
              user_id: userId,
              platform: 'meta',
              account_id: page.id,
              account_name: page.name,
              account_type: 'page',
              access_token: page.access_token, // Use page-specific token
              refresh_token: accessToken, // Store user token for refresh
              expires_at: expiresAt,
              is_active: true,
            }, { onConflict: 'user_id,platform,account_id' });
        }
      }
      
      // Store ad accounts
      if (adAccountsData.data && adAccountsData.data.length > 0) {
        for (const account of adAccountsData.data) {
          await supabaseAdmin
            .from('analytics_tokens')
            .upsert({
              user_id: userId,
              platform: 'meta',
              account_id: account.id,
              account_name: account.name || 'Ad Account',
              account_type: 'ad_account',
              access_token: accessToken,
              refresh_token: accessToken,
              expires_at: expiresAt,
              is_active: true,
            }, { onConflict: 'user_id,platform,account_id' });
        }
      }
      
      // Set first account as selected if none selected
      const { data: selectedAccount } = await supabaseAdmin
        .from('analytics_tokens')
        .select('id')
        .eq('user_id', userId)
        .eq('platform', 'meta')
        .eq('is_selected', true)
        .single();
      
      if (!selectedAccount && pagesData.data && pagesData.data.length > 0) {
        await supabaseAdmin
          .from('analytics_tokens')
          .update({ is_selected: true })
          .eq('user_id', userId)
          .eq('platform', 'meta')
          .eq('account_id', pagesData.data[0].id);
      }
      
      res.redirect('/analytics?meta=connected&accounts=' + (pagesData.data?.length || 0 + adAccountsData.data?.length || 0));
    } catch (error: any) {
      console.error('Meta OAuth error:', error);
      res.redirect('/analytics?meta=error&message=' + encodeURIComponent(error.message));
    }
  });

  // Google OAuth - Redirect to Google OAuth dialog
  app.get("/api/auth/google", async (req, res) => {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const redirectUri = `${process.env.APP_URL}/api/auth/google/callback`;
    const scope = 'https://www.googleapis.com/auth/adwords';
    
    if (!clientId) {
      return res.status(500).json({ message: 'GOOGLE_CLIENT_ID not configured' });
    }
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&response_type=code&access_type=offline&prompt=consent&state=${req.userId}`;
    res.redirect(authUrl);
  });

  // Google OAuth Callback - Multi-Account Support
  app.get("/api/auth/google/callback", async (req, res) => {
    const { code, state: userId } = req.query;
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    const redirectUri = `${process.env.APP_URL}/api/auth/google/callback`;
    
    if (!code || !userId) {
      return res.status(400).json({ message: 'Missing code or user' });
    }
    
    try {
      // Exchange code for access token
      const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          code: code as string,
          client_id: clientId!,
          client_secret: clientSecret!,
          redirect_uri: redirectUri,
          grant_type: 'authorization_code',
        }),
      });
      
      const tokenData = await tokenRes.json();
      
      if (tokenData.error) {
        throw new Error(tokenData.error_description);
      }
      
      // For Google, we store the token but need the user to provide customer ID
      const expiresAt = tokenData.expires_in 
        ? new Date(Date.now() + tokenData.expires_in * 1000).toISOString()
        : new Date(Date.now() + 3600 * 1000).toISOString();
      
      // Store a placeholder token
      await supabaseAdmin
        .from('analytics_tokens')
        .upsert({
          user_id: userId,
          platform: 'google',
          account_id: 'default',
          account_name: 'Google Ads Account',
          account_type: 'mcc',
          access_token: tokenData.access_token,
          refresh_token: tokenData.refresh_token,
          expires_at: expiresAt,
          is_active: true,
          is_selected: true,
        }, { onConflict: 'user_id,platform,account_id' });
      
      res.redirect('/analytics?google=connected');
    } catch (error: any) {
      console.error('Google OAuth error:', error);
      res.redirect('/analytics?google=error&message=' + encodeURIComponent(error.message));
    }
  });

  // Get Connected Accounts
  app.get("/api/analytics/accounts", async (req, res) => {
    try {
      const { data, error } = await supabaseAdmin
        .from('analytics_tokens')
        .select('id, platform, account_id, account_name, account_type, is_active, is_selected, created_at')
        .eq('user_id', req.userId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const accounts = {
        meta: data?.filter(a => a.platform === 'meta') || [],
        google: data?.filter(a => a.platform === 'google') || [],
      };
      
      res.json(accounts);
    } catch (error: any) {
      console.error('Error fetching accounts:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // Select Account (switch which account to view)
  app.post("/api/analytics/select-account", async (req, res) => {
    try {
      const { platform, accountId } = req.body;
      
      // First, unselect all accounts for this platform
      await supabaseAdmin
        .from('analytics_tokens')
        .update({ is_selected: false })
        .eq('user_id', req.userId)
        .eq('platform', platform);
      
      // Then select the requested account
      const { error } = await supabaseAdmin
        .from('analytics_tokens')
        .update({ is_selected: true })
        .eq('user_id', req.userId)
        .eq('platform', platform)
        .eq('account_id', accountId);
      
      if (error) throw error;
      
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error selecting account:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // Hide Account (soft delete)
  app.post("/api/analytics/hide-account", async (req, res) => {
    try {
      const { id } = req.body;
      
      const { error } = await supabaseAdmin
        .from('analytics_tokens')
        .update({ is_active: false, is_selected: false })
        .eq('id', id)
        .eq('user_id', req.userId);
      
      if (error) throw error;
      
      res.json({ success: true });
    } catch (error: any) {
      console.error('Error hiding account:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // Get Selected Account
  app.get("/api/analytics/selected-account/:platform", async (req, res) => {
    try {
      const { platform } = req.params;
      
      const { data, error } = await supabaseAdmin
        .from('analytics_tokens')
        .select('*')
        .eq('user_id', req.userId)
        .eq('platform', platform)
        .eq('is_selected', true)
        .eq('is_active', true)
        .single();
      
      if (error) {
        return res.status(404).json({ message: 'No account selected' });
      }
      
      res.json(data);
    } catch (error: any) {
      console.error('Error fetching selected account:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // Meta Organic Metrics
  app.get("/api/analytics/meta/organic", async (req, res) => {
    try {
      // Get selected account
      const { data: accountData } = await supabaseAdmin
        .from('analytics_tokens')
        .select('*')
        .eq('user_id', req.userId)
        .eq('platform', 'meta')
        .eq('is_selected', true)
        .eq('is_active', true)
        .single();
      
      if (!accountData) {
        return res.status(404).json({ message: 'No Meta account selected' });
      }
      
      // Get valid token (refresh if needed)
      const token = await getValidToken(req.userId!, 'meta', accountData.account_id);
      
      // Get page insights
      const insightsRes = await fetch(`https://graph.facebook.com/v18.0/${accountData.account_id}/insights?metric=page_impressions,page_impressions_unique,page_engaged_users,page_fans,page_post_engagements,page_video_views&period=days_28&access_token=${token}`);
      const insightsData = await insightsRes.json();
      
      if (insightsData.error) {
        throw new Error(insightsData.error.message);
      }
      
      res.json({
        account: { id: accountData.account_id, name: accountData.account_name },
        metrics: insightsData.data || [],
      });
    } catch (error: any) {
      console.error('Error fetching Meta organic metrics:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // Meta Ads Metrics
  app.get("/api/analytics/meta/ads", async (req, res) => {
    try {
      // Get selected account
      const { data: accountData } = await supabaseAdmin
        .from('analytics_tokens')
        .select('*')
        .eq('user_id', req.userId)
        .eq('platform', 'meta')
        .eq('is_selected', true)
        .eq('is_active', true)
        .single();
      
      if (!accountData) {
        return res.status(404).json({ message: 'No Meta account selected' });
      }
      
      // Get valid token
      const token = await getValidToken(req.userId!, 'meta', accountData.account_id);
      
      // Get campaigns
      const campaignsRes = await fetch(`https://graph.facebook.com/v18.0/${accountData.account_id}/campaigns?fields=id,name,status,insights{spend,impressions,clicks,ctr,cpc,conversions,purchase_roas}&access_token=${token}`);
      const campaignsData = await campaignsRes.json();
      
      if (campaignsData.error) {
        throw new Error(campaignsData.error.message);
      }
      
      res.json({
        account: { id: accountData.account_id, name: accountData.account_name },
        campaigns: campaignsData.data || [],
      });
    } catch (error: any) {
      console.error('Error fetching Meta ads metrics:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // Google Ads Metrics
  app.get("/api/analytics/google/ads", async (req, res) => {
    try {
      // Get selected account
      const { data: accountData } = await supabaseAdmin
        .from('analytics_tokens')
        .select('*')
        .eq('user_id', req.userId)
        .eq('platform', 'google')
        .eq('is_selected', true)
        .eq('is_active', true)
        .single();
      
      if (!accountData) {
        return res.status(404).json({ message: 'No Google account selected' });
      }
      
      // Get valid token
      const token = await getValidToken(req.userId!, 'google', accountData.account_id);
      
      // Note: This is a placeholder. Google Ads API requires more complex setup
      res.json({
        account: { id: accountData.account_id, name: accountData.account_name },
        message: 'Google Ads API integration requires customer ID configuration',
        connected: true,
        campaigns: [],
      });
    } catch (error: any) {
      console.error('Error fetching Google Ads metrics:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // ==================== PROXY PARA SCRAPER PYTHON ====================

  const SCRAPER_BASE_URL = process.env.SCRAPER_URL || 'http://localhost:8000';

  async function proxyToScraper(path: string, body?: any) {
    try {
      const response = await fetch(`${SCRAPER_BASE_URL}/${path}`, {
        method: body ? 'POST' : 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || data.detail || 'Error from scraper');
      }

      return data;
    } catch (error: any) {
      console.error(`Scraper proxy error (${path}):`, error);
      throw new Error(error.message || 'Failed to reach scraper');
    }
  }

  // Scrape URL com formatos específicos
  app.post("/api/scraper/scrape", async (req, res) => {
    try {
      const data = await proxyToScraper('scrape', req.body);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Web Search
  app.post("/api/scraper/search", async (req, res) => {
    try {
      const data = await proxyToScraper('search', req.body);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // AI Agent
  app.post("/api/scraper/agent", async (req, res) => {
    try {
      const data = await proxyToScraper('agent', req.body);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Map Site
  app.post("/api/scraper/map", async (req, res) => {
    try {
      const data = await proxyToScraper('map', req.body);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Crawl Site
  app.post("/api/scraper/crawl", async (req, res) => {
    try {
      const data = await proxyToScraper('crawl', req.body);
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  return httpServer;
}
