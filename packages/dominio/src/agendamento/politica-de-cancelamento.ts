import type { Instante } from "../compartilhado/instante";

/** Estrategia injetada: define ate quando o cliente pode cancelar. */
export interface PoliticaDeCancelamento {
  permite(inicioDoAgendamento: Instante, agora: Instante): boolean;
}
