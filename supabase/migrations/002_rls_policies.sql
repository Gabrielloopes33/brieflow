-- Migration: Row Level Security Policies for Multi-Tenancy
-- Habilitar RLS em todas as tabelas
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE briefs ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_configs ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS: Usuários autenticados só veem seus próprios dados
-- Cada usuário só pode CRUD nos registros onde user_id = auth.uid()

-- Clients policies
CREATE POLICY "Users can insert own clients" ON clients
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can select own clients" ON clients
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own clients" ON clients
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own clients" ON clients
  FOR DELETE USING (auth.uid() = user_id);

-- Sources policies
CREATE POLICY "Users can insert own sources" ON sources
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can select own sources" ON sources
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own sources" ON sources
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own sources" ON sources
  FOR DELETE USING (auth.uid() = user_id);

-- Contents policies
CREATE POLICY "Users can insert own contents" ON contents
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can select own contents" ON contents
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own contents" ON contents
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own contents" ON contents
  FOR DELETE USING (auth.uid() = user_id);

-- Briefs policies
CREATE POLICY "Users can insert own briefs" ON briefs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can select own briefs" ON briefs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own briefs" ON briefs
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own briefs" ON briefs
  FOR DELETE USING (auth.uid() = user_id);

-- Analysis configs policies
CREATE POLICY "Users can insert own configs" ON analysis_configs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can select own configs" ON analysis_configs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own configs" ON analysis_configs
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own configs" ON analysis_configs
  FOR DELETE USING (auth.uid() = user_id);

-- Comment on RLS
COMMENT ON TABLE clients IS 'RLS ativo: usuários só veem seus próprios clientes';
COMMENT ON TABLE sources IS 'RLS ativo: usuários só veem suas próprias fontes';
COMMENT ON TABLE contents IS 'RLS ativo: usuários só veem seus próprios conteúdos';
COMMENT ON TABLE briefs IS 'RLS ativo: usuários só veem seus próprios briefs';
COMMENT ON TABLE analysis_configs IS 'RLS ativo: usuários só veem suas próprias configs';
