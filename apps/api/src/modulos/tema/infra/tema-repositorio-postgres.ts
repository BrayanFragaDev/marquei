import { Instante, type EstabelecimentoId } from "@marquei/dominio";
import {
  TemaDoEstabelecimento,
  TemaVersionado,
  type TemaRepositorio,
} from "@marquei/design-tokens";
import type { ProvedorDeTransacao } from "../../../nucleo";

type Estado = "rascunho" | "publicado";

interface LinhaDeTema {
  readonly tokens: unknown;
  readonly atualizado_em: Date;
  readonly gravacoes: string;
}

/** Evento do outbox que marca cada gravacao do estado; a contagem dele e a versao. */
const EVENTO_DO_ESTADO: Readonly<Record<Estado, string>> = {
  rascunho: "tema_rascunho_salvo",
  publicado: "tema_publicado",
};

const SELECIONAR = `
  SELECT t.tokens, t.atualizado_em,
         (SELECT count(*) FROM evento_analitico e
           WHERE e.estabelecimento_id = t.estabelecimento_id AND e.nome = $3) AS gravacoes
    FROM tema t
   WHERE t.estabelecimento_id = $1 AND t.estado = $2`;

const GRAVAR = `
  INSERT INTO tema (estabelecimento_id, estado, tokens, atualizado_em)
  VALUES ($1, $2, $3::jsonb, $4)
  ON CONFLICT (estabelecimento_id, estado)
  DO UPDATE SET tokens = EXCLUDED.tokens, atualizado_em = EXCLUDED.atualizado_em`;

/**
 * Exige transacao com tenant; a RLS do banco e a segunda trava alem do WHERE.
 * A tabela `tema` ainda nao tem coluna de versao: a versao e o numero de eventos de gravacao
 * do estado no outbox (a gravacao em curso conta +1, pois o evento e emitido logo depois).
 * Pendencia para AD: coluna `versao` em `tema`, que substitui essa derivacao.
 */
export class TemaRepositorioPostgres implements TemaRepositorio {
  constructor(private readonly transacao: ProvedorDeTransacao) {}

  obterRascunho(estabelecimento: EstabelecimentoId): Promise<TemaVersionado | null> {
    return this.obter(estabelecimento, "rascunho");
  }

  obterPublicado(estabelecimento: EstabelecimentoId): Promise<TemaVersionado | null> {
    return this.obter(estabelecimento, "publicado");
  }

  salvarRascunho(
    estabelecimento: EstabelecimentoId,
    tema: TemaDoEstabelecimento,
    agora: Instante,
  ): Promise<TemaVersionado> {
    return this.gravar(estabelecimento, "rascunho", tema, agora);
  }

  publicar(
    estabelecimento: EstabelecimentoId,
    tema: TemaDoEstabelecimento,
    agora: Instante,
  ): Promise<TemaVersionado> {
    return this.gravar(estabelecimento, "publicado", tema, agora);
  }

  private async obter(
    estabelecimento: EstabelecimentoId,
    estado: Estado,
  ): Promise<TemaVersionado | null> {
    const r = await this.transacao
      .atual()
      .consultar<LinhaDeTema>(SELECIONAR, [
        estabelecimento.valor,
        estado,
        EVENTO_DO_ESTADO[estado],
      ]);
    const linha = r.linhas[0];
    if (!linha) return null;
    return TemaVersionado.reconstituir({
      tema: TemaDoEstabelecimento.criar(linha.tokens),
      versao: Math.max(1, Number(linha.gravacoes)),
      atualizadoEm: Instante.deEpochMs(linha.atualizado_em.getTime()),
    });
  }

  private async gravar(
    estabelecimento: EstabelecimentoId,
    estado: Estado,
    tema: TemaDoEstabelecimento,
    agora: Instante,
  ): Promise<TemaVersionado> {
    const anteriores = await this.transacao
      .atual()
      .consultar<{ gravacoes: string }>(
        `SELECT count(*) AS gravacoes FROM evento_analitico WHERE estabelecimento_id = $1 AND nome = $2`,
        [estabelecimento.valor, EVENTO_DO_ESTADO[estado]],
      );
    await this.transacao
      .atual()
      .consultar(GRAVAR, [
        estabelecimento.valor,
        estado,
        JSON.stringify(tema.paraDados()),
        agora.paraIso(),
      ]);
    return TemaVersionado.reconstituir({
      tema,
      versao: Number(anteriores.linhas[0]?.gravacoes ?? 0) + 1,
      atualizadoEm: agora,
    });
  }
}
