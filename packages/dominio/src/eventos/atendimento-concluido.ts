import type { EventoDeDominio } from "../compartilhado/evento-de-dominio";
import type { EstabelecimentoId } from "../compartilhado/identificador";
import type { Instante } from "../compartilhado/instante";

export interface DadosDeAtendimentoConcluido {
  readonly estabelecimentoId: EstabelecimentoId;
  readonly ocorridoEm: Instante;
  readonly agendamentoId: string;
  readonly valorCentavos: number;
  readonly duracaoRealMinutos: number;
}

/** O profissional concluiu o atendimento. Emissor: BN. */
export class AtendimentoConcluido implements EventoDeDominio {
  readonly nome = "atendimento_concluido";
  readonly estabelecimentoId: EstabelecimentoId;
  readonly ocorridoEm: Instante;
  readonly propriedades: EventoDeDominio["propriedades"];

  constructor(dados: DadosDeAtendimentoConcluido) {
    this.estabelecimentoId = dados.estabelecimentoId;
    this.ocorridoEm = dados.ocorridoEm;
    this.propriedades = {
      agendamento_id: dados.agendamentoId,
      valor_centavos: dados.valorCentavos,
      duracao_real_min: dados.duracaoRealMinutos,
    };
  }
}
