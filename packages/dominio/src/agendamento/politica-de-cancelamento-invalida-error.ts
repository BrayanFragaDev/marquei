import { ErroDeDominio } from "../compartilhado/erro-de-dominio";

export class PoliticaDeCancelamentoInvalidaError extends ErroDeDominio {
  readonly codigo = "politica_de_cancelamento_invalida";

  constructor() {
    super("A antecedencia minima deve ser um numero inteiro de minutos, zero ou mais.");
  }
}
