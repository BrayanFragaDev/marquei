import {
  EstabelecimentoId,
  Slug,
  type EstabelecimentoLeitura,
  type EstabelecimentoRepositorio,
} from "@marquei/dominio";
import type { ProvedorDeTransacao } from "../../../nucleo";

interface LinhaDeEstabelecimento {
  readonly id: string;
  readonly slug: string;
  readonly nome: string;
  readonly fuso_horario: string;
  readonly vertical: string;
  readonly passo_agenda_minutos: number;
  readonly antecedencia_cancelamento_minutos: number;
}

/** Exige transacao com tenant: a RLS de `estabelecimento` so deixa ver o proprio tenant. */
export class EstabelecimentoRepositorioPostgres implements EstabelecimentoRepositorio {
  constructor(private readonly transacao: ProvedorDeTransacao) {}

  async obterPorId(id: EstabelecimentoId): Promise<EstabelecimentoLeitura | null> {
    const r = await this.transacao.atual().consultar<LinhaDeEstabelecimento>(
      `SELECT e.id, e.slug, e.nome, e.fuso_horario, v.slug AS vertical,
              e.passo_agenda_minutos, e.antecedencia_cancelamento_minutos
         FROM estabelecimento e
         JOIN vertical v ON v.id = e.vertical_id
        WHERE e.id = $1 AND e.status = 'ativo'`,
      [id.valor],
    );
    const l = r.linhas[0];
    if (!l) return null;
    return {
      id: EstabelecimentoId.de(l.id),
      slug: Slug.de(l.slug),
      nome: l.nome,
      fusoHorario: l.fuso_horario,
      vertical: l.vertical,
      passoDaAgendaMinutos: l.passo_agenda_minutos,
      antecedenciaDeCancelamentoMinutos: l.antecedencia_cancelamento_minutos,
    };
  }
}
