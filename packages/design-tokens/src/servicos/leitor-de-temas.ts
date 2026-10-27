import type { EstabelecimentoId } from "@marquei/dominio";
import { temaPadraoDaVertical } from "../padroes/temas-padrao";
import type { TemaRepositorio } from "../persistencia/tema-repositorio";
import { TemaVersionado } from "../persistencia/tema-versionado";
import type { VerticalDoEstabelecimento } from "../persistencia/vertical-do-estabelecimento";

/** De onde veio o tema devolvido. */
export type OrigemDoTema = "rascunho" | "publicado" | "padrao";

export interface TemaLido {
  readonly versionado: TemaVersionado;
  readonly origem: OrigemDoTema;
}

/**
 * Regras de leitura dos temas. O cliente final so enxerga o publicado (ou o padrao da vertical
 * enquanto nada foi publicado); o editor parte do rascunho, depois do publicado, depois do padrao.
 */
export class LeitorDeTemas {
  constructor(
    private readonly temas: TemaRepositorio,
    private readonly verticais: VerticalDoEstabelecimento,
  ) {}

  /** Nunca devolve rascunho. */
  async publicadoOuPadrao(estabelecimento: EstabelecimentoId): Promise<TemaLido> {
    const publicado = await this.temas.obterPublicado(estabelecimento);
    if (publicado) return { versionado: publicado, origem: "publicado" };
    return { versionado: await this.padraoDa(estabelecimento), origem: "padrao" };
  }

  /** Ponto de partida do editor. */
  async paraEdicao(estabelecimento: EstabelecimentoId): Promise<TemaLido> {
    const rascunho = await this.temas.obterRascunho(estabelecimento);
    if (rascunho) return { versionado: rascunho, origem: "rascunho" };
    return this.publicadoOuPadrao(estabelecimento);
  }

  async padraoDa(estabelecimento: EstabelecimentoId): Promise<TemaVersionado> {
    const vertical = await this.verticais.de(estabelecimento);
    return TemaVersionado.padrao(temaPadraoDaVertical(vertical));
  }
}
