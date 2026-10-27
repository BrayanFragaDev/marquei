import type { Instante } from "../compartilhado/instante";
import { PoliticaDeCancelamentoInvalidaError } from "./politica-de-cancelamento-invalida-error";
import type { PoliticaDeCancelamento } from "./politica-de-cancelamento";

/** Permite cancelar (ou remarcar) enquanto faltar ao menos `minutos` para o inicio. */
export class PoliticaDeCancelamentoPorAntecedencia implements PoliticaDeCancelamento {
  private constructor(readonly antecedenciaMinimaMinutos: number) {}

  static deMinutos(minutos: number): PoliticaDeCancelamentoPorAntecedencia {
    if (!Number.isSafeInteger(minutos) || minutos < 0) {
      throw new PoliticaDeCancelamentoInvalidaError();
    }
    return new PoliticaDeCancelamentoPorAntecedencia(minutos);
  }

  permite(inicioDoAgendamento: Instante, agora: Instante): boolean {
    return agora.minutosAte(inicioDoAgendamento) >= this.antecedenciaMinimaMinutos;
  }
}
