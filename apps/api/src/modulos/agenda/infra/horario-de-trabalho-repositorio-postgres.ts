import {
  HorarioDeTrabalho,
  ProfissionalId,
  type DiaDaSemana,
  type EstabelecimentoId,
  type HorarioDeTrabalhoRepositorio,
} from "@marquei/dominio";
import type { ProvedorDeTransacao } from "../../../nucleo";

interface LinhaDeHorario {
  readonly profissional_id: string;
  readonly dia_da_semana: number;
  readonly inicio_minutos: number;
  readonly fim_minutos: number;
}

/** Exige transacao com tenant; o filtro por estabelecimento convive com a RLS do banco. */
export class HorarioDeTrabalhoRepositorioPostgres implements HorarioDeTrabalhoRepositorio {
  constructor(private readonly transacao: ProvedorDeTransacao) {}

  async doProfissional(
    estabelecimentoId: EstabelecimentoId,
    profissionalId: ProfissionalId,
  ): Promise<readonly HorarioDeTrabalho[]> {
    const r = await this.transacao.atual().consultar<LinhaDeHorario>(
      `SELECT profissional_id, dia_da_semana, inicio_minutos, fim_minutos
         FROM horario_trabalho
        WHERE estabelecimento_id = $1 AND profissional_id = $2
        ORDER BY dia_da_semana, inicio_minutos`,
      [estabelecimentoId.valor, profissionalId.valor],
    );
    return r.linhas.map((l) =>
      HorarioDeTrabalho.criar({
        profissionalId: ProfissionalId.de(l.profissional_id),
        diaDaSemana: l.dia_da_semana as DiaDaSemana,
        inicioMinutos: l.inicio_minutos,
        fimMinutos: l.fim_minutos,
      }),
    );
  }
}
