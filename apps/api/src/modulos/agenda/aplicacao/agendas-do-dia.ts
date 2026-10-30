import {
  type AgendaDoProfissional,
  type AgendamentoRepositorio,
  type BloqueioRepositorio,
  type CalculadoraDeHorariosLivres,
  type DiaCivil,
  type EstabelecimentoId,
  type FusoHorario,
  type HorarioDeTrabalhoRepositorio,
  type Profissional,
} from "@marquei/dominio";

export interface DependenciasDeAgendasDoDia {
  readonly horarios: HorarioDeTrabalhoRepositorio;
  readonly bloqueios: BloqueioRepositorio;
  readonly agendamentos: AgendamentoRepositorio;
  readonly calculadora: CalculadoraDeHorariosLivres;
}

/**
 * Colaborador de aplicacao (nao e caso de uso): reune, para um dia, expediente, bloqueios e
 * agendamentos de cada profissional, na janela que a calculadora declara precisar.
 */
export class AgendasDoDia {
  constructor(private readonly dependencias: DependenciasDeAgendasDoDia) {}

  carregar(
    estabelecimentoId: EstabelecimentoId,
    profissionais: readonly Profissional[],
    dia: DiaCivil,
    fuso: FusoHorario,
  ): Promise<readonly AgendaDoProfissional[]> {
    const janela = this.dependencias.calculadora.janelaDeConsulta(dia, fuso);
    const { horarios, bloqueios, agendamentos } = this.dependencias;
    return Promise.all(
      profissionais.map(async (profissional) => ({
        profissional,
        horarios: await horarios.doProfissional(estabelecimentoId, profissional.id),
        bloqueios: await bloqueios.doProfissional(estabelecimentoId, profissional.id, janela),
        ocupantes: await agendamentos.listarOcupantes(estabelecimentoId, profissional.id, janela),
      })),
    );
  }
}
