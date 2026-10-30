import type { ClienteDaApi } from "@marquei/api-client";
import { desembrulhar } from "../../api/falha-da-api";
import type { AgendamentoDaAgenda, FiltroDoDia } from "../../contratos/agenda";
import type { FusoDoEstabelecimento } from "../../apresentacao/fuso-do-estabelecimento";
import type { RepositorioDeAgendamentos } from "../../portas/repositorio-de-agendamentos";
import { Instante } from "@marquei/dominio";
import { obterOu, type ArmazemProvisorio } from "./armazem-provisorio";
import { sementeDoEstabelecimento } from "./sementes-do-mock";

/**
 * Listagem do dia em memoria (a API ainda nao lista agendamentos); o cancelamento usa a API
 * real (`POST /v1/agendamentos/{id}/cancelar`) e reflete o resultado na lista local.
 */
export class AgendamentosProvisorios implements RepositorioDeAgendamentos {
  constructor(
    private readonly api: ClienteDaApi,
    private readonly armazem: ArmazemProvisorio,
    private readonly estabelecimentoId: string,
    private readonly fuso: FusoDoEstabelecimento,
  ) {}

  async listarDoDia(filtro: FiltroDoDia): Promise<readonly AgendamentoDaAgenda[]> {
    return this.todos()
      .filter((a) => this.fuso.diaCivil(Instante.deIso(a.inicio)) === filtro.dia)
      .filter((a) => filtro.profissionalId === undefined || a.profissionalId === filtro.profissionalId)
      .sort((a, b) => a.inicio.localeCompare(b.inicio));
  }

  async cancelar(id: string): Promise<AgendamentoDaAgenda> {
    const cancelado = desembrulhar(
      await this.api.POST("/v1/agendamentos/{id}/cancelar", { params: { path: { id } } }),
    );
    const lista = this.todos();
    const indice = lista.findIndex((a) => a.id === id);
    if (indice >= 0) lista[indice] = cancelado;
    return cancelado;
  }

  private todos(): AgendamentoDaAgenda[] {
    return obterOu(this.armazem.agendamentos, this.estabelecimentoId, () => [
      ...sementeDoEstabelecimento(this.estabelecimentoId).agendamentos,
    ]);
  }
}
