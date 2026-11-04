import type { DadosDoMembro, MembroDaEquipe } from "../contratos/catalogo";

export interface RepositorioDeEquipe {
  listar(): Promise<readonly MembroDaEquipe[]>;
  criar(dados: DadosDoMembro): Promise<MembroDaEquipe>;
  atualizar(id: string, dados: DadosDoMembro): Promise<MembroDaEquipe>;
  desativar(id: string): Promise<void>;
}
