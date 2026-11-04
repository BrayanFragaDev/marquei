import type { OrigemDoTema } from "./servico-de-tema";

export interface DadosDoResumo {
  readonly servicosAtivos: number;
  readonly membrosDaEquipe: number;
  readonly agendamentosDoDia: number;
  readonly origemDoTema: OrigemDoTema;
  readonly versaoDoTema: number;
}

export type SituacaoDoTema = "publicado" | "padrao" | "com_rascunho";

/** Resumo simples do painel inicial (numeros de apoio; os indicadores reais vem depois). */
export class ResumoDoPainel {
  constructor(private readonly dados: DadosDoResumo) {}

  get servicosAtivos(): number {
    return this.dados.servicosAtivos;
  }
  get membrosDaEquipe(): number {
    return this.dados.membrosDaEquipe;
  }
  get agendamentosDoDia(): number {
    return this.dados.agendamentosDoDia;
  }
  get versaoDoTema(): number {
    return this.dados.versaoDoTema;
  }

  situacaoDoTema(): SituacaoDoTema {
    if (this.dados.origemDoTema === "rascunho") return "com_rascunho";
    return this.dados.origemDoTema === "publicado" ? "publicado" : "padrao";
  }
}
