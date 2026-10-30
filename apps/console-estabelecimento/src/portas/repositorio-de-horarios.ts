import type { AgendaDoProfissional, Bloqueio, Folga, JanelaSemanal } from "../contratos/catalogo";

export interface RepositorioDeHorarios {
  obter(profissionalId: string): Promise<AgendaDoProfissional>;
  adicionarJanela(janela: Omit<JanelaSemanal, "id">): Promise<void>;
  removerJanela(profissionalId: string, id: string): Promise<void>;
  adicionarFolga(folga: Omit<Folga, "id">): Promise<void>;
  removerFolga(profissionalId: string, id: string): Promise<void>;
  adicionarBloqueio(bloqueio: Omit<Bloqueio, "id">): Promise<void>;
  removerBloqueio(profissionalId: string, id: string): Promise<void>;
}
