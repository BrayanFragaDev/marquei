export const StatusAgendamento = {
  Confirmado: "confirmado",
  Cancelado: "cancelado",
  Concluido: "concluido",
} as const;

export type StatusAgendamento = (typeof StatusAgendamento)[keyof typeof StatusAgendamento];
