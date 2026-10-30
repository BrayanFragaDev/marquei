import type { AgendamentoDaAgenda, FiltroDoDia } from "../contratos/agenda";

export interface RepositorioDeAgendamentos {
  listarDoDia(filtro: FiltroDoDia): Promise<readonly AgendamentoDaAgenda[]>;
  cancelar(id: string): Promise<AgendamentoDaAgenda>;
}
