import type { EventoDeDominio } from "../compartilhado/evento-de-dominio";
import type { EstabelecimentoId } from "../compartilhado/identificador";
import type { Instante } from "../compartilhado/instante";

export interface DadosDeEstabelecimentoCriado {
  readonly estabelecimentoId: EstabelecimentoId;
  readonly ocorridoEm: Instante;
  readonly vertical: string;
  readonly modoAgenda: "profissional_unico" | "equipe";
  readonly origemLeadId: string | null;
}

/** Onboarding concluido. Emissor: BN. */
export class EstabelecimentoCriado implements EventoDeDominio {
  readonly nome = "estabelecimento_criado";
  readonly estabelecimentoId: EstabelecimentoId;
  readonly ocorridoEm: Instante;
  readonly propriedades: EventoDeDominio["propriedades"];

  constructor(dados: DadosDeEstabelecimentoCriado) {
    this.estabelecimentoId = dados.estabelecimentoId;
    this.ocorridoEm = dados.ocorridoEm;
    this.propriedades = {
      vertical: dados.vertical,
      modo_agenda: dados.modoAgenda,
      origem_lead_id: dados.origemLeadId,
    };
  }
}
