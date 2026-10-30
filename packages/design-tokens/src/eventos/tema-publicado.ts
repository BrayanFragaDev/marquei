import type { EstabelecimentoId, EventoDeDominio, Instante } from "@marquei/dominio";
import type { AutorDaAlteracao } from "../autoria/autor-da-alteracao";

export interface DadosDoTemaPublicado {
  readonly autor: AutorDaAlteracao;
  readonly ocorridoEm: Instante;
  readonly versao: number;
  readonly contrasteMinimo: number;
}

const CENTESIMOS = 100;

/** Evento `tema_publicado` (plano.md, secao 7). O contraste e truncado, nunca inflado. */
export class TemaPublicado implements EventoDeDominio {
  readonly nome = "tema_publicado";
  readonly estabelecimentoId: EstabelecimentoId;
  readonly ocorridoEm: Instante;
  readonly propriedades: EventoDeDominio["propriedades"];

  constructor(dados: DadosDoTemaPublicado) {
    this.estabelecimentoId = dados.autor.estabelecimentoId;
    this.ocorridoEm = dados.ocorridoEm;
    this.propriedades = {
      versao: dados.versao,
      contraste_minimo: Math.floor(dados.contrasteMinimo * CENTESIMOS) / CENTESIMOS,
      ator_tipo: dados.autor.tipoDeAtor,
      ator_id: dados.autor.usuarioId.valor,
    };
  }
}
