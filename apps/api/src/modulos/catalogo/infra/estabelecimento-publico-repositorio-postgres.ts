import {
  EstabelecimentoId,
  Slug,
  type EstabelecimentoPublico,
  type EstabelecimentoPublicoRepositorio,
  type TemaPublicadoLeitura,
} from "@marquei/dominio";
import type { ExecutorTransacional, ProvedorDeTransacao } from "../../../nucleo";

interface LinhaPublica {
  readonly id: string;
  readonly slug: string;
  readonly nome: string;
  readonly fuso_horario: string;
  readonly vertical: string;
  readonly vocabulario: Record<string, unknown>;
  readonly tokens: Record<string, unknown> | null;
  readonly publicacoes: string;
}

/**
 * Consulta controlada: a vitrine e lida ANTES de se conhecer o tenant, e `app_usuario` nao
 * enxerga `estabelecimento` sem tenant (RLS). Por isso esta unica consulta roda com
 * `app_plataforma` e projeta SOMENTE o publico: nome, vertical, vocabulario, fuso e o tema em
 * estado `publicado` (rascunho jamais e lido), de estabelecimentos ativos.
 */
export class EstabelecimentoPublicoRepositorioPostgres implements EstabelecimentoPublicoRepositorio {
  constructor(
    private readonly executor: ExecutorTransacional,
    private readonly transacao: ProvedorDeTransacao,
  ) {}

  obterPorSlug(slug: Slug): Promise<EstabelecimentoPublico | null> {
    return this.executor.executar({ papel: "app_plataforma" }, async () => {
      const r = await this.transacao.atual().consultar<LinhaPublica>(
        `SELECT e.id, e.slug, e.nome, e.fuso_horario, v.slug AS vertical, v.vocabulario,
                t.tokens,
                (SELECT count(*) FROM evento_analitico ev
                  WHERE ev.estabelecimento_id = e.id AND ev.nome = 'tema_publicado') AS publicacoes
           FROM estabelecimento e
           JOIN vertical v ON v.id = e.vertical_id
           LEFT JOIN tema t ON t.estabelecimento_id = e.id AND t.estado = 'publicado'
          WHERE e.slug = $1 AND e.status = 'ativo'`,
        [slug.valor],
      );
      const l = r.linhas[0];
      if (!l) return null;
      return {
        id: EstabelecimentoId.de(l.id),
        slug: Slug.de(l.slug),
        nome: l.nome,
        vertical: l.vertical,
        vocabulario: soTextos(l.vocabulario),
        fusoHorario: l.fuso_horario,
        tema: l.tokens ? temaDe(l.tokens, Number(l.publicacoes)) : null,
      };
    });
  }
}

function soTextos(registro: Record<string, unknown>): Record<string, string> {
  return Object.fromEntries(
    Object.entries(registro).filter((par): par is [string, string] => typeof par[1] === "string"),
  );
}

/**
 * A tabela `tema` ainda nao tem coluna de versao. Mesma derivacao do modulo de tema (DS): a
 * versao publicada e o numero de eventos `tema_publicado` do estabelecimento (minimo 1).
 * Pendencia para AD/DS: coluna `versao`, que substitui esta contagem.
 */
function temaDe(tokens: Record<string, unknown>, publicacoes: number): TemaPublicadoLeitura {
  return { versao: Math.max(1, publicacoes), tokens };
}
