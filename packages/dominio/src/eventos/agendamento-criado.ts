import type { EventoDeDominio } from "../compartilhado/evento-de-dominio";
import type { EstabelecimentoId } from "../compartilhado/identificador";
import type { Instante } from "../compartilhado/instante";

export type CanalDeAgendamento = "app" | "manual" | "web";

export interface DadosDeAgendamentoCriado {
  readonly estabelecimentoId: EstabelecimentoId;
  readonly ocorridoEm: Instante;
  readonly agendamentoId: string;
  readonly servicoId: string;
  readonly profissionalId: string;
  readonly inicio: Instante;
  readonly canal: CanalDeAgendamento;
  readonly precoCentavos: number;
}

/** Agendamento confirmado. Emissor: BN (plano.md, secao 7). */
export class AgendamentoCriado implements EventoDeDominio {
  readonly nome = "agendamento_criado";
  readonly estabelecimentoId: EstabelecimentoId;
  readonly ocorridoEm: Instante;
  readonly propriedades: EventoDeDominio["propriedades"];

  constructor(dados: DadosDeAgendamentoCriado) {
    this.estabelecimentoId = dados.estabelecimentoId;
    this.ocorridoEm = dados.ocorridoEm;
    this.propriedades = {
      agendamento_id: dados.agendamentoId,
      servico_id: dados.servicoId,
      profissional_id: dados.profissionalId,
      inicio: dados.inicio.paraIso(),
      canal: dados.canal,
      preco_centavos: dados.precoCentavos,
    };
  }
}
