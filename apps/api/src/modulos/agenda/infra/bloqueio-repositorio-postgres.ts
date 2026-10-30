import {
  Bloqueio,
  BloqueioId,
  EstabelecimentoId,
  Instante,
  JanelaDeTempo,
  ProfissionalId,
  type BloqueioRepositorio,
} from "@marquei/dominio";
import type { ProvedorDeTransacao } from "../../../nucleo";

interface LinhaDeBloqueio {
  readonly id: string;
  readonly estabelecimento_id: string;
  readonly profissional_id: string | null;
  readonly inicio: Date;
  readonly fim: Date;
  readonly motivo: string;
}

/** Exige transacao com tenant; o filtro por estabelecimento convive com a RLS do banco. */
export class BloqueioRepositorioPostgres implements BloqueioRepositorio {
  constructor(private readonly transacao: ProvedorDeTransacao) {}

  async doProfissional(
    estabelecimentoId: EstabelecimentoId,
    profissionalId: ProfissionalId,
    janela: JanelaDeTempo,
  ): Promise<readonly Bloqueio[]> {
    const r = await this.transacao.atual().consultar<LinhaDeBloqueio>(
      `SELECT id, estabelecimento_id, profissional_id, inicio, fim, motivo
         FROM bloqueio
        WHERE estabelecimento_id = $1
          AND (profissional_id = $2 OR profissional_id IS NULL)
          AND inicio < $4 AND fim > $3
        ORDER BY inicio, id`,
      [
        estabelecimentoId.valor,
        profissionalId.valor,
        janela.inicio.paraIso(),
        janela.fim.paraIso(),
      ],
    );
    return r.linhas.map(paraDominio);
  }
}

function paraDominio(l: LinhaDeBloqueio): Bloqueio {
  return Bloqueio.criar({
    id: BloqueioId.de(l.id),
    estabelecimentoId: EstabelecimentoId.de(l.estabelecimento_id),
    profissionalId: l.profissional_id === null ? null : ProfissionalId.de(l.profissional_id),
    janela: JanelaDeTempo.criar(
      Instante.deEpochMs(l.inicio.getTime()),
      Instante.deEpochMs(l.fim.getTime()),
    ),
    motivo: l.motivo,
  });
}
