import { FalhaDaApi } from "../../api/falha-da-api";
import type { DadosDoMembro, MembroDaEquipe } from "../../contratos/catalogo";
import type { RepositorioDeEquipe } from "../../portas/repositorio-de-equipe";
import { obterOu, type ArmazemProvisorio } from "./armazem-provisorio";
import { sementeDoEstabelecimento } from "./sementes-do-mock";

/** Equipe em memoria (a API ainda nao tem endpoints de equipe). */
export class EquipeProvisoria implements RepositorioDeEquipe {
  constructor(
    private readonly armazem: ArmazemProvisorio,
    private readonly estabelecimentoId: string,
  ) {}

  async listar(): Promise<readonly MembroDaEquipe[]> {
    return this.membros();
  }

  async criar(dados: DadosDoMembro): Promise<MembroDaEquipe> {
    const novo: MembroDaEquipe = { id: crypto.randomUUID(), ...dados, ativo: true };
    this.membros().push(novo);
    return novo;
  }

  async atualizar(id: string, dados: DadosDoMembro): Promise<MembroDaEquipe> {
    const atualizado = this.substituir(id, (m) => ({ ...m, ...dados }));
    return atualizado;
  }

  async desativar(id: string): Promise<void> {
    this.substituir(id, (m) => ({ ...m, ativo: false }));
  }

  private substituir(
    id: string,
    alteracao: (membro: MembroDaEquipe) => MembroDaEquipe,
  ): MembroDaEquipe {
    const lista = this.membros();
    const indice = lista.findIndex((m) => m.id === id);
    const atual = lista[indice];
    if (!atual) throw FalhaDaApi.deResposta(404, { codigo: "nao_encontrado" });
    const novo = alteracao(atual);
    lista[indice] = novo;
    return novo;
  }

  private membros(): MembroDaEquipe[] {
    return obterOu(this.armazem.equipe, this.estabelecimentoId, () => [
      ...sementeDoEstabelecimento(this.estabelecimentoId).equipe,
    ]);
  }
}
