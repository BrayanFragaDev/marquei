import type { EstabelecimentoId, EventoDeDominio, Instante } from "@marquei/dominio";
import type { AutorDaAlteracao } from "../autoria/autor-da-alteracao";

export interface DadosDoRascunhoSalvo {
  readonly autor: AutorDaAlteracao;
  readonly ocorridoEm: Instante;
  readonly versao: number;
  readonly camposAlterados: readonly string[];
}

/** Evento `tema_rascunho_salvo` (plano.md, secao 7). Sem dado pessoal: apenas ids e nomes de campo. */
export class TemaRascunhoSalvo implements EventoDeDominio {
  readonly nome = "tema_rascunho_salvo";
  readonly estabelecimentoId: EstabelecimentoId;
  readonly ocorridoEm: Instante;
  readonly propriedades: EventoDeDominio["propriedades"];

  constructor(dados: DadosDoRascunhoSalvo) {
    this.estabelecimentoId = dados.autor.estabelecimentoId;
    this.ocorridoEm = dados.ocorridoEm;
    this.propriedades = {
      versao: dados.versao,
      campos_alterados: dados.camposAlterados.join(","),
      ator_tipo: dados.autor.tipoDeAtor,
      ator_id: dados.autor.usuarioId.valor,
    };
  }
}
