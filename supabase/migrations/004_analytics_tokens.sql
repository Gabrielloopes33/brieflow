-- Migration: Add analytics_tokens table for Meta and Google Analytics integration (Multi-Account Support)

-- Drop old table if exists (for fresh start)
DROP TABLE IF EXISTS analytics_tokens;

-- Tabela: analytics_tokens (Multi-Account Support)
CREATE TABLE analytics_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('meta', 'google')),
  account_id TEXT NOT NULL, -- Meta: page_id or ad_account_id, Google: customer_id
  account_name TEXT, -- Display name of the account/page
  account_type TEXT NOT NULL CHECK (account_type IN ('page', 'ad_account', 'mcc')), -- For Meta: page/ad_account, For Google: mcc/customer
  access_token TEXT NOT NULL,
  refresh_token TEXT, -- For automatic token refresh
  expires_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN DEFAULT true, -- Soft delete (hide account)
  is_selected BOOLEAN DEFAULT false, -- Currently viewing this account
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX idx_analytics_tokens_user_id ON analytics_tokens(user_id);
CREATE INDEX idx_analytics_tokens_platform ON analytics_tokens(platform);
CREATE INDEX idx_analytics_tokens_user_platform ON analytics_tokens(user_id, platform);
CREATE INDEX idx_analytics_tokens_account_id ON analytics_tokens(account_id);
CREATE INDEX idx_analytics_tokens_is_active ON analytics_tokens(is_active);
CREATE INDEX idx_analytics_tokens_is_selected ON analytics_tokens(is_selected);

-- Constraint única: um usuário não pode ter o mesmo account_id duplicado
CREATE UNIQUE INDEX idx_analytics_tokens_user_account 
  ON analytics_tokens(user_id, platform, account_id);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_analytics_tokens_updated_at 
    BEFORE UPDATE ON analytics_tokens 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Comment on table
COMMENT ON TABLE analytics_tokens IS 'Tokens OAuth para integração multi-conta com Meta e Google Analytics';
