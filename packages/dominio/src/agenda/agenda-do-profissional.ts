import type { Agendamento } from "../agendamento/agendamento";
import type { Profissional } from "../catalogo/profissional";
import type { Bloqueio } from "./bloqueio";
import type { HorarioDeTrabalho } from "./horario-de-trabalho";

/** Tudo que limita a agenda de um profissional, ja carregado pela aplicacao. */
export interface AgendaDoProfissional {
  readonly profissional: Profissional;
  readonly horarios: readonly HorarioDeTrabalho[];
  readonly bloqueios: readonly Bloqueio[];
  /** Agendamentos que tocam o dia; so os confirmados ocupam horario. */
  readonly ocupantes: readonly Agendamento[];
}
