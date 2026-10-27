-- Up Migration
-- Tabelas de tenant: RLS habilitada E forcada (vale ate para o dono da tabela).
-- `estabelecimento` e o proprio tenant: a chave e `id`. As demais usam `estabelecimento_id`.

ALTER TABLE estabelecimento ENABLE ROW LEVEL SECURITY;
ALTER TABLE estabelecimento FORCE ROW LEVEL SECURITY;
CREATE POLICY isolamento_tenant ON estabelecimento TO app_usuario
  USING (id = app_estabelecimento_id())
  WITH CHECK (id = app_estabelecimento_id());
CREATE POLICY acesso_plataforma ON estabelecimento TO app_plataforma USING (true) WITH CHECK (true);

DO $$
DECLARE
  tabela text;
BEGIN
  FOREACH tabela IN ARRAY ARRAY[
    'usuario', 'servico', 'profissional', 'cliente_final', 'agendamento', 'tema', 'evento_analitico'
  ] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tabela);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', tabela);
    EXECUTE format(
      'CREATE POLICY isolamento_tenant ON %I TO app_usuario
         USING (estabelecimento_id = app_estabelecimento_id())
         WITH CHECK (estabelecimento_id = app_estabelecimento_id())', tabela);
    EXECUTE format(
      'CREATE POLICY acesso_plataforma ON %I TO app_plataforma USING (true) WITH CHECK (true)', tabela);
  END LOOP;
END
$$;

-- Permissoes minimas. `vertical` e catalogo global somente leitura para a aplicacao.
GRANT SELECT ON vertical TO app_usuario, app_plataforma;
GRANT INSERT, UPDATE, DELETE ON vertical TO app_plataforma;

GRANT SELECT, INSERT, UPDATE ON estabelecimento TO app_usuario;
GRANT SELECT, INSERT, UPDATE, DELETE ON estabelecimento TO app_plataforma;

GRANT SELECT, INSERT, UPDATE, DELETE ON usuario, servico, profissional, cliente_final, tema
  TO app_usuario, app_plataforma;
GRANT SELECT, INSERT, UPDATE ON agendamento TO app_usuario;
GRANT SELECT, INSERT, UPDATE, DELETE ON agendamento TO app_plataforma;

-- Outbox: so se acrescenta e le; nunca se altera nem apaga pela aplicacao.
GRANT SELECT, INSERT ON evento_analitico TO app_usuario, app_plataforma;

-- Down Migration
REVOKE ALL ON vertical, estabelecimento, usuario, servico, profissional, cliente_final,
  agendamento, tema, evento_analitico FROM app_usuario, app_plataforma;
DO $$
DECLARE
  tabela text;
BEGIN
  FOREACH tabela IN ARRAY ARRAY[
    'estabelecimento', 'usuario', 'servico', 'profissional', 'cliente_final', 'agendamento',
    'tema', 'evento_analitico'
  ] LOOP
    EXECUTE format('DROP POLICY IF EXISTS isolamento_tenant ON %I', tabela);
    EXECUTE format('DROP POLICY IF EXISTS acesso_plataforma ON %I', tabela);
    EXECUTE format('ALTER TABLE %I NO FORCE ROW LEVEL SECURITY', tabela);
    EXECUTE format('ALTER TABLE %I DISABLE ROW LEVEL SECURITY', tabela);
  END LOOP;
END
$$;
