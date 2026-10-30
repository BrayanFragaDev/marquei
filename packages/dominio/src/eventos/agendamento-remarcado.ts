import type { EventoDeDominio } from "../compartilhado/evento-de-dominio";
import type { EstabelecimentoId } from "../compartilhado/identificador";
import type { Instante } from "../compartilhado/instante";

export interface DadosDeAgendamentoRemarcado {
  readonly estabelecimentoId: EstabelecimentoId;
  readonly ocorridoEm: Instante;
  readonly agendamentoId: string;
  readonly inicioAntigo: Instante;
  readonly inicioNovo: Instante;
}

/** Remarcacao de um agendamento confirmado. Emissor: BN. */
export class AgendamentoRemarcado implements EventoDeDominio {
  readonly nome = "agendamento_remarcado";
  readonly estabelecimentoId: EstabelecimentoId;
  readonly ocorridoEm: Instante;
  readonly propriedades: EventoDeDominio["propriedades"];

  constructor(dados: DadosDeAgendamentoRemarcado) {
    this.estabelecimentoId = dados.estabelecimentoId;
    this.ocorridoEm = dados.ocorridoEm;
    this.propriedades = {
      agendamento_id: dados.agendamentoId,
      inicio_antigo: dados.inicioAntigo.paraIso(),
      inicio_novo: dados.inicioNovo.paraIso(),
    };
  }
}
