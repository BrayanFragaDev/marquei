import type { Dinheiro } from "../compartilhado/dinheiro";
import type { ServicoId } from "./servico-id";

/**
 * Tipo de leitura (projecao) de um servico do catalogo. A entidade `Servico` com regras de
 * edicao chega com as tarefas de CRUD do catalogo; consultas usam esta visao imutavel.
 */
export interface ServicoLeitura {
  readonly id: ServicoId;
  readonly nome: string;
  readonly duracaoMinutos: number;
  readonly preco: Dinheiro;
  readonly ativo: boolean;
}
