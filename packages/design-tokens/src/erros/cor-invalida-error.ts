import { ErroDeDominio } from "@marquei/dominio";

/** Texto que nao esta no formato `#rrggbb`. */
export class CorInvalidaError extends ErroDeDominio {
  readonly codigo = "cor_invalida";

  constructor(readonly entrada: string) {
    super(`Cor invalida: "${entrada}". Use o formato #rrggbb.`);
  }
}
