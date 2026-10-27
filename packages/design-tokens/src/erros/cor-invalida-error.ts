import { ErroDeTema } from "./erro-de-tema";

/** Texto que nao esta no formato `#rrggbb`. */
export class CorInvalidaError extends ErroDeTema {
  constructor(readonly entrada: string) {
    super("cor_invalida", `Cor invalida: "${entrada}". Use o formato #rrggbb.`);
  }
}
