-- Up Migration
CREATE TABLE vertical (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9-]+$'),
  nome text NOT NULL,
  vocabulario jsonb NOT NULL,
  servicos_modelo jsonb NOT NULL DEFAULT '[]'::jsonb
);

CREATE TABLE estabelecimento (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  vertical_id uuid NOT NULL REFERENCES vertical (id),
  slug text NOT NULL UNIQUE CHECK (slug ~ '^[a-z0-9-]+$'),
  nome text NOT NULL,
  fuso_horario text NOT NULL DEFAULT 'America/Sao_Paulo',
  status text NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'suspenso', 'encerrado')),
  criado_em timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE usuario (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estabelecimento_id uuid NOT NULL REFERENCES estabelecimento (id),
  email text NOT NULL,
  nome text NOT NULL,
  papel text NOT NULL CHECK (papel IN ('dono', 'gestor', 'profissional')),
  senha_hash text NOT NULL,
  ativo boolean NOT NULL DEFAULT true,
  criado_em timestamptz NOT NULL DEFAULT now(),
  UNIQUE (estabelecimento_id, email)
);

CREATE TABLE servico (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estabelecimento_id uuid NOT NULL REFERENCES estabelecimento (id),
  nome text NOT NULL,
  duracao_minutos integer NOT NULL CHECK (duracao_minutos > 0),
  preco_centavos integer NOT NULL CHECK (preco_centavos >= 0),
  ativo boolean NOT NULL DEFAULT true,
  UNIQUE (id, estabelecimento_id)
);

CREATE TABLE profissional (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estabelecimento_id uuid NOT NULL REFERENCES estabelecimento (id),
  usuario_id uuid,
  nome text NOT NULL,
  ativo boolean NOT NULL DEFAULT true,
  UNIQUE (id, estabelecimento_id)
);

-- Chave composta em usuario para permitir a FK acima presa ao mesmo tenant.
ALTER TABLE usuario ADD CONSTRAINT usuario_id_estabelecimento_uq UNIQUE (id, estabelecimento_id);
ALTER TABLE profissional
  ADD CONSTRAINT profissional_usuario_fk
  FOREIGN KEY (usuario_id, estabelecimento_id) REFERENCES usuario (id, estabelecimento_id);

CREATE TABLE cliente_final (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estabelecimento_id uuid NOT NULL REFERENCES estabelecimento (id),
  telefone text NOT NULL,
  nome text,
  consentimento_em timestamptz,
  anonimizado_em timestamptz,
  criado_em timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id, estabelecimento_id),
  UNIQUE (estabelecimento_id, telefone)
);

CREATE TABLE agendamento (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estabelecimento_id uuid NOT NULL REFERENCES estabelecimento (id),
  profissional_id uuid NOT NULL,
  servico_id uuid NOT NULL,
  cliente_id uuid NOT NULL,
  inicio timestamptz NOT NULL,
  fim timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'confirmado'
    CHECK (status IN ('confirmado', 'cancelado', 'concluido', 'faltou')),
  criado_em timestamptz NOT NULL DEFAULT now(),
  CHECK (fim > inicio),
  FOREIGN KEY (profissional_id, estabelecimento_id) REFERENCES profissional (id, estabelecimento_id),
  FOREIGN KEY (servico_id, estabelecimento_id) REFERENCES servico (id, estabelecimento_id),
  FOREIGN KEY (cliente_id, estabelecimento_id) REFERENCES cliente_final (id, estabelecimento_id),
  -- Dois clientes nunca confirmam o mesmo profissional no mesmo intervalo.
  CONSTRAINT agendamento_sem_sobreposicao EXCLUDE USING gist (
    profissional_id WITH =,
    tstzrange(inicio, fim, '[)') WITH &&
  ) WHERE (status = 'confirmado')
);

CREATE INDEX agendamento_agenda_idx ON agendamento (estabelecimento_id, profissional_id, inicio);

CREATE TABLE tema (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estabelecimento_id uuid NOT NULL REFERENCES estabelecimento (id),
  estado text NOT NULL CHECK (estado IN ('rascunho', 'publicado')),
  tokens jsonb NOT NULL,
  atualizado_em timestamptz NOT NULL DEFAULT now(),
  UNIQUE (estabelecimento_id, estado)
);

CREATE TABLE evento_analitico (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  estabelecimento_id uuid NOT NULL REFERENCES estabelecimento (id),
  nome text NOT NULL CHECK (nome ~ '^[a-z]+(_[a-z]+)*$'),
  ocorrido_em timestamptz NOT NULL,
  propriedades jsonb NOT NULL DEFAULT '{}'::jsonb,
  gravado_em timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX evento_analitico_consulta_idx ON evento_analitico (estabelecimento_id, nome, ocorrido_em);

-- Down Migration
DROP TABLE IF EXISTS evento_analitico;
DROP TABLE IF EXISTS tema;
DROP TABLE IF EXISTS agendamento;
DROP TABLE IF EXISTS cliente_final;
DROP TABLE IF EXISTS profissional;
DROP TABLE IF EXISTS servico;
DROP TABLE IF EXISTS usuario;
DROP TABLE IF EXISTS estabelecimento;
DROP TABLE IF EXISTS vertical;
