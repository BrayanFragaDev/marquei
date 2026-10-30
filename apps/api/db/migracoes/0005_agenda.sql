-- Up Migration
-- BN-2: horarios de trabalho, bloqueios, habilitacao profissional x servico e a configuracao de
-- agenda. Aditiva; nada da 0002 e editado. Toda tabela nova e de tenant: RLS habilitada e forcada.

ALTER TABLE servico
  ADD COLUMN intervalo_apos_minutos integer NOT NULL DEFAULT 0
    CHECK (intervalo_apos_minutos BETWEEN 0 AND 240);

ALTER TABLE estabelecimento
  ADD COLUMN passo_agenda_minutos integer NOT NULL DEFAULT 15
    CHECK (passo_agenda_minutos BETWEEN 5 AND 120),
  ADD COLUMN antecedencia_cancelamento_minutos integer NOT NULL DEFAULT 120
    CHECK (antecedencia_cancelamento_minutos >= 0);

CREATE TABLE horario_trabalho (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estabelecimento_id uuid NOT NULL REFERENCES estabelecimento (id),
  profissional_id uuid NOT NULL,
  -- 0 = domingo ... 6 = sabado; minutos desde a meia-noite LOCAL do estabelecimento.
  dia_da_semana smallint NOT NULL CHECK (dia_da_semana BETWEEN 0 AND 6),
  inicio_minutos smallint NOT NULL CHECK (inicio_minutos BETWEEN 0 AND 1439),
  fim_minutos smallint NOT NULL CHECK (fim_minutos BETWEEN 1 AND 1440),
  CHECK (fim_minutos > inicio_minutos),
  FOREIGN KEY (profissional_id, estabelecimento_id) REFERENCES profissional (id, estabelecimento_id)
);

CREATE INDEX horario_trabalho_profissional_idx ON horario_trabalho (estabelecimento_id, profissional_id);

CREATE TABLE bloqueio (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estabelecimento_id uuid NOT NULL REFERENCES estabelecimento (id),
  -- NULL bloqueia o estabelecimento todo (a FK composta nao se aplica quando ha coluna NULL).
  profissional_id uuid,
  inicio timestamptz NOT NULL,
  fim timestamptz NOT NULL,
  motivo text NOT NULL DEFAULT '',
  CHECK (fim > inicio),
  FOREIGN KEY (profissional_id, estabelecimento_id) REFERENCES profissional (id, estabelecimento_id)
);

CREATE INDEX bloqueio_periodo_idx ON bloqueio (estabelecimento_id, inicio, fim);

CREATE TABLE profissional_servico (
  estabelecimento_id uuid NOT NULL REFERENCES estabelecimento (id),
  profissional_id uuid NOT NULL,
  servico_id uuid NOT NULL,
  PRIMARY KEY (profissional_id, servico_id),
  FOREIGN KEY (profissional_id, estabelecimento_id) REFERENCES profissional (id, estabelecimento_id),
  FOREIGN KEY (servico_id, estabelecimento_id) REFERENCES servico (id, estabelecimento_id)
);

DO $$
DECLARE
  tabela text;
BEGIN
  FOREACH tabela IN ARRAY ARRAY['horario_trabalho', 'bloqueio', 'profissional_servico'] LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tabela);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', tabela);
    EXECUTE format(
      'CREATE POLICY isolamento_tenant ON %I TO app_usuario
         USING (estabelecimento_id = app_estabelecimento_id())
         WITH CHECK (estabelecimento_id = app_estabelecimento_id())', tabela);
    EXECUTE format(
      'CREATE POLICY acesso_plataforma ON %I TO app_plataforma USING (true) WITH CHECK (true)', tabela);
    EXECUTE format(
      'GRANT SELECT, INSERT, UPDATE, DELETE ON %I TO app_usuario, app_plataforma', tabela);
  END LOOP;
END
$$;

-- Agendamento passa a guardar o preco combinado e a folga final. A janela OCUPADA
-- (inicio ate fim + folga) e o que a restricao de exclusao protege, de modo que o intervalo
-- entre atendimentos vale tambem sob concorrencia. `ocupa_ate` nulo (linhas antigas) = `fim`.
ALTER TABLE agendamento
  ADD COLUMN preco_centavos integer NOT NULL DEFAULT 0 CHECK (preco_centavos >= 0),
  ADD COLUMN intervalo_apos_minutos integer NOT NULL DEFAULT 0
    CHECK (intervalo_apos_minutos BETWEEN 0 AND 240),
  ADD COLUMN ocupa_ate timestamptz,
  ADD CONSTRAINT agendamento_ocupa_ate_apos_fim CHECK (ocupa_ate IS NULL OR ocupa_ate >= fim);

ALTER TABLE agendamento DROP CONSTRAINT agendamento_sem_sobreposicao;
ALTER TABLE agendamento ADD CONSTRAINT agendamento_sem_sobreposicao EXCLUDE USING gist (
  profissional_id WITH =,
  tstzrange(inicio, GREATEST(fim, ocupa_ate), '[)') WITH &&
) WHERE (status = 'confirmado');

-- Down Migration
ALTER TABLE agendamento DROP CONSTRAINT agendamento_sem_sobreposicao;
ALTER TABLE agendamento ADD CONSTRAINT agendamento_sem_sobreposicao EXCLUDE USING gist (
  profissional_id WITH =,
  tstzrange(inicio, fim, '[)') WITH &&
) WHERE (status = 'confirmado');
ALTER TABLE agendamento
  DROP CONSTRAINT agendamento_ocupa_ate_apos_fim,
  DROP COLUMN ocupa_ate,
  DROP COLUMN intervalo_apos_minutos,
  DROP COLUMN preco_centavos;

DROP TABLE IF EXISTS profissional_servico;
DROP TABLE IF EXISTS bloqueio;
DROP TABLE IF EXISTS horario_trabalho;

ALTER TABLE estabelecimento
  DROP COLUMN antecedencia_cancelamento_minutos,
  DROP COLUMN passo_agenda_minutos;
ALTER TABLE servico DROP COLUMN intervalo_apos_minutos;
