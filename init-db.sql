-- Inicialização do banco de dados BriefFlow
-- Este script é executado automaticamente quando o container PostgreSQL é criado pela primeira vez

-- Extensões úteis
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Criar usuário admin (opcional)
-- DO NOT USE IN PRODUCTION - apenas para desenvolvimento
-- CREATE USER briefflow_admin WITH PASSWORD 'admin_password';
-- GRANT ALL PRIVILEGES ON DATABASE briefflow TO briefflow_admin;

-- Habilitar pg_stat_statements para monitoramento (requer parâmetros específicos)
-- CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Configurar timezone
SET timezone = 'UTC';

-- Logs de criação
DO $$
BEGIN
    RAISE NOTICE 'Banco de dados BriefFlow inicializado com sucesso!';
    RAISE NOTICE 'Extensões: uuid-ossp, pg_trgm';
    RAISE NOTICE 'Timezone: UTC';
END $$;