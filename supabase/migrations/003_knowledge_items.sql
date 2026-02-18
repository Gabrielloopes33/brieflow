-- Migration: Add knowledge_items table for client knowledge base

-- Tabela: knowledge_items
CREATE TABLE knowledge_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('scrape', 'search', 'agent', 'map', 'crawl')),
  source_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_knowledge_items_user_id ON knowledge_items(user_id);
CREATE INDEX idx_knowledge_items_client_id ON knowledge_items(client_id);
CREATE INDEX idx_knowledge_items_type ON knowledge_items(type);
CREATE INDEX idx_knowledge_items_created_at ON knowledge_items(created_at);

-- Comment on table
COMMENT ON TABLE knowledge_items IS 'Itens salvos na base de conhecimento dos clientes via ferramentas (scrape, search, agent, map, crawl)';
