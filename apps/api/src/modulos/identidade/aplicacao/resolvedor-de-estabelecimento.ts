import type { EstabelecimentoId, Slug } from "@marquei/dominio";

/**
 * Porta da resolucao slug -> tenant feita NO SERVIDOR antes do login. E a unica consulta
 * que precede o conhecimento do tenant; devolve `null` para slug inexistente ou inativo.
 */
export interface ResolvedorDeEstabelecimento {
  idPorSlug(slug: Slug): Promise<EstabelecimentoId | null>;
}
