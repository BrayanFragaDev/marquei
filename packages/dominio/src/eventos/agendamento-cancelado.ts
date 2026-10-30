import type { EventoDeDominio } from "../compartilhado/evento-de-dominio";
import type { EstabelecimentoId } from "../compartilhado/identificador";
import type { Instante } from "../compartilhado/instante";

export interface DadosDeAgendamentoCancelado {
  readonly estabelecimentoId: EstabelecimentoId;
  readonly ocorridoEm: Instante;
  readonly agendamentoId: string;
  readonly quemCancelou: "cliente_final" | "profissional" | "gestor";
  readonly antecedenciaMinutos: number;
  readonly dentroDaPolitica: boolean;
}

/** Cancelamento de um agendamento confirmado. Emissor: BN. */
export class AgendamentoCancelado implements EventoDeDominio {
  readonly nome = "agendamento_cancelado";
  readonly estabelecimentoId: EstabelecimentoId;
  readonly ocorridoEm: Instante;
  readonly propriedades: EventoDeDominio["propriedades"];

  constructor(dados: DadosDeAgendamentoCancelado) {
    this.estabelecimentoId = dados.estabelecimentoId;
    this.ocorridoEm = dados.ocorridoEm;
    this.propriedades = {
      agendamento_id: dados.agendamentoId,
      quem_cancelou: dados.quemCancelou,
      antecedencia_min: dados.antecedenciaMinutos,
      dentro_da_politica: dados.dentroDaPolitica,
    };
  }
}
