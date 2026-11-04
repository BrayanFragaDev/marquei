import type { ClienteDaApi } from "@marquei/api-client";
import { desembrulhar, FalhaDaApi } from "../../api/falha-da-api";
import type { DadosDoServico, ServicoDoCatalogo } from "../../contratos/catalogo";
import type { RepositorioDeServicos } from "../../portas/repositorio-de-servicos";
import { obterOu, type ArmazemProvisorio } from "./armazem-provisorio";

/**
 * Leitura pela API real (`GET /v1/servicos`) na primeira vez; criacao/edicao/desativacao ficam
 * em memoria ate o BN publicar o CRUD.
 */
export class ServicosProvisorios implements RepositorioDeServicos {
  constructor(
    private readonly api: ClienteDaApi,
    private readonly armazem: ArmazemProvisorio,
    private readonly estabelecimentoId: string,
  ) {}

  async listar(): Promise<readonly ServicoDoCatalogo[]> {
    const existente = this.armazem.servicos.get(this.estabelecimentoId);
    if (existente) return existente;
    const { itens } = desembrulhar(await this.api.GET("/v1/servicos"));
    const lista = obterOu(this.armazem.servicos, this.estabelecimentoId, () =>
      itens.map((s) => ({ ...s, ativo: true })),
    );
    return lista;
  }

  async criar(dados: DadosDoServico): Promise<ServicoDoCatalogo> {
    const lista = await this.mutavel();
    const novo: ServicoDoCatalogo = { id: crypto.randomUUID(), ...dados, ativo: true };
    lista.push(novo);
    return novo;
  }

  async atualizar(id: string, dados: DadosDoServico): Promise<ServicoDoCatalogo> {
    const lista = await this.mutavel();
    const indice = lista.findIndex((s) => s.id === id);
    const atual = lista[indice];
    if (!atual) throw FalhaDaApi.deResposta(404, { codigo: "nao_encontrado" });
    const atualizado: ServicoDoCatalogo = { ...atual, ...dados };
    lista[indice] = atualizado;
    return atualizado;
  }

  async desativar(id: string): Promise<void> {
    const lista = await this.mutavel();
    const indice = lista.findIndex((s) => s.id === id);
    const atual = lista[indice];
    if (!atual) throw FalhaDaApi.deResposta(404, { codigo: "nao_encontrado" });
    lista[indice] = { ...atual, ativo: false };
  }

  private async mutavel(): Promise<ServicoDoCatalogo[]> {
    await this.listar();
    return obterOu(this.armazem.servicos, this.estabelecimentoId, () => []);
  }
}
