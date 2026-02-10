-- Migration: Initial Schema for BriefFlow
-- Extension para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela: clients
CREATE TABLE clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  niche TEXT,
  target_audience TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela: sources
CREATE TABLE sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  type TEXT DEFAULT 'blog',
  is_active BOOLEAN DEFAULT true,
  last_scraped_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela: contents
CREATE TABLE contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  source_id UUID REFERENCES sources(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  content_text TEXT,
  summary TEXT,
  topics JSONB,
  published_at TIMESTAMP WITH TIME ZONE,
  scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_analyzed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela: briefs
CREATE TABLE briefs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  content_ids JSONB,
  title TEXT NOT NULL,
  angle TEXT,
  key_points JSONB,
  content_type TEXT,
  suggested_copy TEXT,
  status TEXT DEFAULT 'draft',
  generated_by TEXT DEFAULT 'claude',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela: analysis_configs
CREATE TABLE analysis_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
  min_content_length INTEGER DEFAULT 500,
  topics_of_interest JSONB,
  exclude_patterns JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_sources_user_id ON sources(user_id);
CREATE INDEX idx_sources_client_id ON sources(client_id);
CREATE INDEX idx_contents_user_id ON contents(user_id);
CREATE INDEX idx_contents_client_id ON contents(client_id);
CREATE INDEX idx_briefs_user_id ON briefs(user_id);
CREATE INDEX idx_briefs_client_id ON briefs(client_id);
CREATE INDEX idx_analysis_configs_user_id ON analysis_configs(user_id);
CREATE INDEX idx_analysis_configs_client_id ON analysis_configs(client_id);

-- Comment on tables
COMMENT ON TABLE clients IS 'Clientes gerenciados por usuários';
COMMENT ON TABLE sources IS 'Fontes de conteúdo (blog, youtube, news) para cada cliente';
COMMENT ON TABLE contents IS 'Conteúdos extraídos das fontes via scraping';
COMMENT ON TABLE briefs IS 'Briefs gerados manualmente ou via IA';
COMMENT ON TABLE analysis_configs IS 'Configurações de análise de conteúdo por cliente';
