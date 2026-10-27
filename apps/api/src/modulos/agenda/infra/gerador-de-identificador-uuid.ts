import { randomUUID } from "node:crypto";
import { Identificador, type GeradorDeIdentificador } from "@marquei/dominio";

/** Gera UUID v4 reais; o dominio nunca sorteia identificador por conta propria. */
export class GeradorDeIdentificadorUuid implements GeradorDeIdentificador {
  novo<M extends string>(rotulo: M): Identificador<M> {
    return Identificador.de(randomUUID(), rotulo);
  }
}
