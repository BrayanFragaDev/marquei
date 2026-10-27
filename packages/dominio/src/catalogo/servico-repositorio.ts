import type { EstabelecimentoId } from "../compartilhado/identificador";
import type { ServicoId } from "./servico-id";
import type { ServicoLeitura } from "./servico-leitura";

/** Porta de persistencia do catalogo de servicos. Sempre escopada por estabelecimento. */
export interface ServicoRepositorio {
  listarAtivos(estabelecimentoId: EstabelecimentoId): Promise<readonly ServicoLeitura[]>;
  /** Devolve `null` se nao existir no estabelecimento (inclusive se pertencer a outro). */
  obterPorId(estabelecimentoId: EstabelecimentoId, id: ServicoId): Promise<ServicoLeitura | null>;
}
