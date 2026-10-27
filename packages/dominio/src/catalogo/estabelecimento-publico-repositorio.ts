import type { EstabelecimentoPublico } from "./estabelecimento-publico";
import type { Slug } from "./slug";

/**
 * Resolucao publica por slug, que ANTECEDE o conhecimento do tenant. A implementacao le somente
 * a projecao publica de estabelecimentos ativos e o tema em estado `publicado`.
 */
export interface EstabelecimentoPublicoRepositorio {
  obterPorSlug(slug: Slug): Promise<EstabelecimentoPublico | null>;
}
