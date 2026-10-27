import type { Identificador } from "./identificador";

/**
 * Porta para criar identificadores novos. O dominio nao gera UUID por conta propria
 * (depende de aleatoriedade): a infraestrutura implementa; testes usam o sequencial.
 */
export interface GeradorDeIdentificador {
  novo<M extends string>(rotulo: M): Identificador<M>;
}
