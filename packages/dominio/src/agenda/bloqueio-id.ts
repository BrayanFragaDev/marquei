import { Identificador } from "../compartilhado/identificador";

export type BloqueioId = Identificador<"bloqueio">;

export const BloqueioId = {
  de: (texto: string): BloqueioId => Identificador.de(texto, "bloqueio"),
};
