import type { EstabelecimentoId } from "@marquei/dominio";
import type { Vertical } from "../padroes/vertical";
import type { VerticalDoEstabelecimento } from "../persistencia/vertical-do-estabelecimento";

/** Fake: cada estabelecimento tem a vertical registrada; os demais caem em `outro`. */
export class VerticalDoEstabelecimentoFixa implements VerticalDoEstabelecimento {
  private readonly verticais = new Map<string, Vertical>();

  comVertical(estabelecimento: EstabelecimentoId, vertical: Vertical): this {
    this.verticais.set(estabelecimento.valor, vertical);
    return this;
  }

  de(estabelecimento: EstabelecimentoId): Promise<Vertical> {
    return Promise.resolve(this.verticais.get(estabelecimento.valor) ?? "outro");
  }
}
