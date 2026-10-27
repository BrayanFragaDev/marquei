import { Identificador } from "../compartilhado/identificador";

export type ClienteFinalId = Identificador<"cliente-final">;

export const ClienteFinalId = {
  de: (texto: string): ClienteFinalId => Identificador.de(texto, "cliente-final"),
};
