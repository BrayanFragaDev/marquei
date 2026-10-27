import type { EstabelecimentoId } from "@marquei/dominio";
import type { Vertical } from "../padroes/vertical";

/** Porta de consulta da vertical (define o tema padrao). Vertical desconhecida vira `outro`. */
export interface VerticalDoEstabelecimento {
  de(estabelecimento: EstabelecimentoId): Promise<Vertical>;
}
