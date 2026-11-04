import type { DadosDoServico, ServicoDoCatalogo } from "../contratos/catalogo";

export interface RepositorioDeServicos {
  listar(): Promise<readonly ServicoDoCatalogo[]>;
  criar(dados: DadosDoServico): Promise<ServicoDoCatalogo>;
  atualizar(id: string, dados: DadosDoServico): Promise<ServicoDoCatalogo>;
  desativar(id: string): Promise<void>;
}
