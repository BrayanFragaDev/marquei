import type { EstabelecimentoId } from "../compartilhado/identificador";
import type { EstabelecimentoLeitura } from "./estabelecimento-leitura";
import type { Slug } from "./slug";

/**
 * Porta de consulta do estabelecimento. Unica sem `EstabelecimentoId` obrigatorio na
 * busca por slug: e a resolucao publica que ANTECEDE o conhecimento do tenant.
 */
export interface EstabelecimentoRepositorio {
  obterPorSlug(slug: Slug): Promise<EstabelecimentoLeitura | null>;
  obterPorId(id: EstabelecimentoId): Promise<EstabelecimentoLeitura | null>;
}
