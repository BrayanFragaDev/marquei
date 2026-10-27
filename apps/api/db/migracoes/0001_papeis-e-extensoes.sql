-- Up Migration
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Papeis de grupo (sem login). A aplicacao conecta com um usuario de login que e membro de um
-- destes papeis; nenhum deles tem BYPASSRLS (CLAUDE.md, secao 5). Senhas nunca ficam aqui.
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'app_usuario') THEN
    CREATE ROLE app_usuario NOLOGIN NOBYPASSRLS;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'app_plataforma') THEN
    CREATE ROLE app_plataforma NOLOGIN NOBYPASSRLS;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'migrador') THEN
    CREATE ROLE migrador NOLOGIN NOBYPASSRLS;
  END IF;
END
$$;

GRANT USAGE ON SCHEMA public TO app_usuario, app_plataforma, migrador;

-- Tenant da transacao corrente. Sem tenant definido (ou vazio) devolve NULL e, como
-- `estabelecimento_id = NULL` nunca e verdadeiro, nenhuma linha fica visivel.
CREATE FUNCTION app_estabelecimento_id() RETURNS uuid
  LANGUAGE sql STABLE
  AS $$ SELECT nullif(current_setting('app.estabelecimento_id', true), '')::uuid $$;

GRANT EXECUTE ON FUNCTION app_estabelecimento_id() TO app_usuario, app_plataforma;

-- Down Migration
DROP FUNCTION IF EXISTS app_estabelecimento_id();
REVOKE USAGE ON SCHEMA public FROM app_usuario, app_plataforma, migrador;
DROP ROLE IF EXISTS migrador;
DROP ROLE IF EXISTS app_plataforma;
DROP ROLE IF EXISTS app_usuario;
