import { ErroDeDominio } from "./erro-de-dominio";

export class DinheiroInvalidoError extends ErroDeDominio {
  readonly codigo = "dinheiro_invalido";

  constructor(motivo: string) {
    super(`Valor monetario invalido: ${motivo}.`);
  }
}
