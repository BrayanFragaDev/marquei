import {
  AgendamentoCancelado,
  EstabelecimentoNaoEncontradoError,
  PoliticaDeCancelamentoPorAntecedencia,
  type Agendamento,
  type AgendamentoId,
  type AgendamentoRepositorio,
  type AtorDoAgendamento,
  type EstabelecimentoId,
  type EstabelecimentoRepositorio,
  type PublicadorDeEventos,
  type Relogio,
} from "@marquei/dominio";

export interface DependenciasDeCancelarAgendamento {
  readonly estabelecimentos: EstabelecimentoRepositorio;
  readonly agendamentos: AgendamentoRepositorio;
  readonly eventos: PublicadorDeEventos;
  readonly relogio: Relogio;
}

export interface EntradaDeCancelarAgendamento {
  readonly estabelecimentoId: EstabelecimentoId;
  readonly agendamentoId: AgendamentoId;
  readonly ator: AtorDoAgendamento;
}

export class CancelarAgendamento {
  constructor(private readonly dependencias: DependenciasDeCancelarAgendamento) {}

  async execute(entrada: EntradaDeCancelarAgendamento): Promise<Agendamento> {
    const { estabelecimentos, agendamentos, eventos, relogio } = this.dependencias;
    const { estabelecimentoId, ator } = entrada;
    const agendamento = await agendamentos.obterPorId(estabelecimentoId, entrada.agendamentoId);
    const estabelecimento = await estabelecimentos.obterPorId(estabelecimentoId);
    if (!estabelecimento) throw new EstabelecimentoNaoEncontradoError();
    const politica = PoliticaDeCancelamentoPorAntecedencia.deMinutos(
      estabelecimento.antecedenciaDeCancelamentoMinutos,
    );
    const agora = relogio.agora();
    const cancelado = agendamento.cancelarPor(ator, agora, politica);
    await agendamentos.salvar(cancelado);
    await eventos.publicar(
      new AgendamentoCancelado({
        estabelecimentoId,
        ocorridoEm: agora,
        agendamentoId: cancelado.id.valor,
        quemCancelou: ator.tipo,
        antecedenciaMinutos: agendamento.antecedenciaEmMinutos(agora),
        dentroDaPolitica: agendamento.dentroDaPolitica(agora, politica),
      }),
    );
    return cancelado;
  }
}
