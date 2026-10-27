import { Identificador } from "../compartilhado/identificador";

export type AgendamentoId = Identificador<"agendamento">;

export const AgendamentoId = {
  de: (texto: string): AgendamentoId => Identificador.de(texto, "agendamento"),
};
