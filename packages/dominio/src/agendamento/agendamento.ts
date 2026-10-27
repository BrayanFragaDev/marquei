import type { EstabelecimentoId } from "../compartilhado/identificador";
import type { Instante } from "../compartilhado/instante";
import type { ProfissionalId } from "../catalogo/profissional-id";
import type { ServicoId } from "../catalogo/servico-id";
import { AgendamentoNaoCancelavelError } from "./agendamento-nao-cancelavel-error";
import { AgendamentoNoPassadoError } from "./agendamento-no-passado-error";
import type { AgendamentoId } from "./agendamento-id";
import type { ClienteFinalId } from "./cliente-final-id";
import { ForaDoPrazoDeCancelamentoError } from "./fora-do-prazo-de-cancelamento-error";
import type { JanelaDeTempo } from "./janela-de-tempo";
import type { PoliticaDeCancelamento } from "./politica-de-cancelamento";
import { StatusAgendamento } from "./status-agendamento";

export interface DadosDoAgendamento {
  readonly id: AgendamentoId;
  readonly estabelecimentoId: EstabelecimentoId;
  readonly servicoId: ServicoId;
  readonly profissionalId: ProfissionalId;
  readonly clienteId: ClienteFinalId;
  readonly janela: JanelaDeTempo;
}

/**
 * Nucleo minimo para tipar os repositorios (BN-1). Remarcar, concluir e a maquina de estados
 * completa entram nas tarefas de casos de uso.
 */
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

  get janela(): JanelaDeTempo {
    return this.dados.janela;
  }

  ocupaHorario(): boolean {
    return this.status === StatusAgendamento.Confirmado;
  }

  cancelar(agora: Instante, politica: PoliticaDeCancelamento): Agendamento {
    if (this.status !== StatusAgendamento.Confirmado) {
      throw new AgendamentoNaoCancelavelError(this.status);
    }
    if (!politica.permite(this.janela.inicio, agora)) throw new ForaDoPrazoDeCancelamentoError();
    return new Agendamento(this.dados, StatusAgendamento.Cancelado);
  }
}
