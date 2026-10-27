import type { Dinheiro } from "../compartilhado/dinheiro";
import type { EstabelecimentoId } from "../compartilhado/identificador";
import type { Instante } from "../compartilhado/instante";
import type { ProfissionalId } from "../catalogo/profissional-id";
import type { ServicoId } from "../catalogo/servico-id";
import { AgendamentoNaoCancelavelError } from "./agendamento-nao-cancelavel-error";
import { AgendamentoNaoConcluivelError } from "./agendamento-nao-concluivel-error";
import { AgendamentoNaoEncontradoError } from "./agendamento-nao-encontrado-error";
import { AgendamentoNaoRemarcavelError } from "./agendamento-nao-remarcavel-error";
import { AgendamentoNoPassadoError } from "./agendamento-no-passado-error";
import type { AgendamentoId } from "./agendamento-id";
import type { AtorDoAgendamento } from "./ator-do-agendamento";
import type { ClienteFinalId } from "./cliente-final-id";
import { ForaDoPrazoDeCancelamentoError } from "./fora-do-prazo-de-cancelamento-error";
import { JanelaDeTempo } from "./janela-de-tempo";
import type { PoliticaDeCancelamento } from "./politica-de-cancelamento";
import { StatusAgendamento } from "./status-agendamento";

export interface DadosDoAgendamento {
  readonly id: AgendamentoId;
  readonly estabelecimentoId: EstabelecimentoId;
  readonly servicoId: ServicoId;
  readonly profissionalId: ProfissionalId;
  readonly clienteId: ClienteFinalId;
  readonly janela: JanelaDeTempo;
  /** Preco combinado no momento do agendamento (nao muda se o servico mudar depois). */
  readonly preco: Dinheiro;
  /** Folga do profissional depois do atendimento; faz parte da janela ocupada. */
  readonly intervaloAposMinutos: number;
}

/** Reserva de um profissional por uma janela de tempo. Imutavel: cada mudanca devolve nova instancia. */
export class Agendamento {
  private constructor(
    readonly dados: DadosDoAgendamento,
    readonly status: StatusAgendamento,
  ) {}

  static criar(dados: DadosDoAgendamento, agora: Instante): Agendamento {
    if (dados.janela.inicio.antesDe(agora)) throw new AgendamentoNoPassadoError();
    return new Agendamento(dados, StatusAgendamento.Confirmado);
  }

  /** Reidrata do armazenamento sem revalidar o passado (o fato ja ocorreu). */
  static reconstituir(dados: DadosDoAgendamento, status: StatusAgendamento): Agendamento {
    return new Agendamento(dados, status);
  }

  get id(): AgendamentoId {
    return this.dados.id;
  }

  get estabelecimentoId(): EstabelecimentoId {
    return this.dados.estabelecimentoId;
  }

  get servicoId(): ServicoId {
    return this.dados.servicoId;
  }

  get profissionalId(): ProfissionalId {
    return this.dados.profissionalId;
  }

  get clienteId(): ClienteFinalId {
    return this.dados.clienteId;
  }

  get janela(): JanelaDeTempo {
    return this.dados.janela;
  }

  get preco(): Dinheiro {
    return this.dados.preco;
  }

  get intervaloAposMinutos(): number {
    return this.dados.intervaloAposMinutos;
  }

  /** O atendimento mais a folga que o profissional precisa antes do proximo. */
  janelaOcupada(): JanelaDeTempo {
    return JanelaDeTempo.criar(
      this.janela.inicio,
      this.janela.fim.maisMinutos(this.dados.intervaloAposMinutos),
    );
  }

  ocupaHorario(): boolean {
    return this.status === StatusAgendamento.Confirmado;
  }

  antecedenciaEmMinutos(agora: Instante): number {
    return Math.trunc(agora.minutosAte(this.janela.inicio));
  }

  dentroDaPolitica(agora: Instante, politica: PoliticaDeCancelamento): boolean {
    return politica.permite(this.janela.inicio, agora);
  }

  cancelar(agora: Instante, politica: PoliticaDeCancelamento): Agendamento {
    this.exigirConfirmado((status) => new AgendamentoNaoCancelavelError(status));
    if (!politica.permite(this.janela.inicio, agora)) throw new ForaDoPrazoDeCancelamentoError();
    return this.comStatus(StatusAgendamento.Cancelado);
  }

  /**
   * Cancelamento por quem o pediu. Agendamento de outro cliente "nao existe" para o ator (sem
   * vazar a existencia); a politica de prazo vale so para o cliente.
   */
  cancelarPor(
    ator: AtorDoAgendamento,
    agora: Instante,
    politica: PoliticaDeCancelamento,
  ): Agendamento {
    if (!ator.enxerga(this.clienteId)) throw new AgendamentoNaoEncontradoError();
    if (ator.sujeitoAPolitica()) return this.cancelar(agora, politica);
    this.exigirConfirmado((status) => new AgendamentoNaoCancelavelError(status));
    return this.comStatus(StatusAgendamento.Cancelado);
  }

  concluir(agora: Instante): Agendamento {
    this.exigirConfirmado((status) => new AgendamentoNaoConcluivelError(`status "${status}"`));
    if (agora.antesDe(this.janela.inicio)) {
      throw new AgendamentoNaoConcluivelError("o atendimento ainda nao comecou");
    }
    return this.comStatus(StatusAgendamento.Concluido);
  }

  /** Minutos entre o inicio previsto e `momento` (nunca negativo). */
  duracaoRealAte(momento: Instante): number {
    return Math.max(0, Math.round(this.janela.inicio.minutosAte(momento)));
  }

  /** Move o atendimento para `novoInicio` mantendo duracao, intervalo, preco e identidade. */
  remarcarPara(
    novoInicio: Instante,
    agora: Instante,
    politica: PoliticaDeCancelamento,
  ): Agendamento {
    this.exigirConfirmado((status) => new AgendamentoNaoRemarcavelError(status));
    if (novoInicio.antesDe(agora)) throw new AgendamentoNoPassadoError();
    if (!politica.permite(this.janela.inicio, agora)) throw new ForaDoPrazoDeCancelamentoError();
    const janela = JanelaDeTempo.comDuracao(novoInicio, this.janela.duracaoEmMinutos());
    return new Agendamento({ ...this.dados, janela }, this.status);
  }

  private comStatus(status: StatusAgendamento): Agendamento {
    return new Agendamento(this.dados, status);
  }

  private exigirConfirmado(erro: (status: StatusAgendamento) => Error): void {
    if (this.status !== StatusAgendamento.Confirmado) throw erro(this.status);
  }
}
