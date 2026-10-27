import type { Instante } from "./instante";

/**
 * Porta para a hora atual. O dominio nunca chama `Date.now()`; a infraestrutura fornece a
 * implementacao real e os testes usam `RelogioFixo`.
 */
export interface Relogio {
  agora(): Instante;
}
