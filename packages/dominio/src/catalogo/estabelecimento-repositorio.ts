import type { EstabelecimentoId } from "../compartilhado/identificador";
import type { EstabelecimentoLeitura } from "./estabelecimento-leitura";

/** Porta de consulta do estabelecimento do tenant corrente (a RLS vale alem do filtro). */
export interface EstabelecimentoRepositorio {
  /** Devolve `null` se o estabelecimento nao for o do tenant da transacao. */
  obterPorId(id: EstabelecimentoId): Promise<EstabelecimentoLeitura | null>;
}
