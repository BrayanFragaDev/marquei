import { Identificador } from "../compartilhado/identificador";

export type ServicoId = Identificador<"servico">;

export const ServicoId = {
  de: (texto: string): ServicoId => Identificador.de(texto, "servico"),
};
