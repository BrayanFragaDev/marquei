import { Identificador } from "../compartilhado/identificador";

export type ProfissionalId = Identificador<"profissional">;

export const ProfissionalId = {
  de: (texto: string): ProfissionalId => Identificador.de(texto, "profissional"),
};
