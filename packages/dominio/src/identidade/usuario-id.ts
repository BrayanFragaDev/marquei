import { Identificador } from "../compartilhado/identificador";

export type UsuarioId = Identificador<"usuario">;

export const UsuarioId = {
  de: (texto: string): UsuarioId => Identificador.de(texto, "usuario"),
};
