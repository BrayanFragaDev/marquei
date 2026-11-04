import type { components } from "@marquei/api-client";

/** `Agendamento` do OpenAPI; a listagem por dia ainda nao existe na API. */
export type AgendamentoDaAgenda = components["schemas"]["Agendamento"];

export interface FiltroDoDia {
  /** Dia civil `YYYY-MM-DD` no fuso do estabelecimento. */
  readonly dia: string;
  /** Preenchido para o papel profissional (so a propria agenda). */
  readonly profissionalId?: string;
}
