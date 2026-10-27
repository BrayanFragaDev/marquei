import type { EstabelecimentoId } from "../compartilhado/identificador";
import type { Servico } from "./servico";
import type { ServicoId } from "./servico-id";

/** Porta de persistencia do catalogo de servicos. Sempre escopada por estabelecimento. */
export interface ServicoRepositorio {
  listarAtivos(estabelecimentoId: EstabelecimentoId): Promise<readonly Servico[]>;
  /** Devolve `null` se nao existir no estabelecimento (inclusive se pertencer a outro). */
  obterPorId(estabelecimentoId: EstabelecimentoId, id: ServicoId): Promise<Servico | null>;
}
