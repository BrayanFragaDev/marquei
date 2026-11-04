import { FalhaDaApi } from "../../api/falha-da-api";
import type { AgendaDoProfissional, Bloqueio, Folga, JanelaSemanal } from "../../contratos/catalogo";
import type { RepositorioDeHorarios } from "../../portas/repositorio-de-horarios";
import { obterOu, type AgendaMutavel, type ArmazemProvisorio } from "./armazem-provisorio";

/** Horarios, folgas e bloqueios em memoria (a API ainda nao os expoe). */
export class HorariosProvisorios implements RepositorioDeHorarios {
  constructor(
    private readonly armazem: ArmazemProvisorio,
    private readonly estabelecimentoId: string,
  ) {}

  async obter(profissionalId: string): Promise<AgendaDoProfissional> {
    const { janelas, folgas, bloqueios } = this.agenda();
    const doProfissional = <T extends { profissionalId: string }>(l: readonly T[]) =>
      l.filter((i) => i.profissionalId === profissionalId);
    return {
      janelas: doProfissional(janelas),
      folgas: doProfissional(folgas),
      bloqueios: doProfissional(bloqueios),
    };
  }

  async adicionarJanela(janela: Omit<JanelaSemanal, "id">): Promise<void> {
    this.agenda().janelas.push({ id: crypto.randomUUID(), ...janela });
  }

  async adicionarFolga(folga: Omit<Folga, "id">): Promise<void> {
    this.agenda().folgas.push({ id: crypto.randomUUID(), ...folga });
  }

  async adicionarBloqueio(bloqueio: Omit<Bloqueio, "id">): Promise<void> {
    this.agenda().bloqueios.push({ id: crypto.randomUUID(), ...bloqueio });
  }

  async removerJanela(profissionalId: string, id: string): Promise<void> {
    this.remover(this.agenda().janelas, profissionalId, id);
  }

  async removerFolga(profissionalId: string, id: string): Promise<void> {
    this.remover(this.agenda().folgas, profissionalId, id);
  }

  async removerBloqueio(profissionalId: string, id: string): Promise<void> {
    this.remover(this.agenda().bloqueios, profissionalId, id);
  }

  private remover(
    lista: { id: string; profissionalId: string }[],
    profissionalId: string,
    id: string,
  ): void {
    const indice = lista.findIndex((i) => i.id === id && i.profissionalId === profissionalId);
    if (indice < 0) throw FalhaDaApi.deResposta(404, { codigo: "nao_encontrado" });
    lista.splice(indice, 1);
  }

  private agenda(): AgendaMutavel {
    return obterOu(this.armazem.agendas, this.estabelecimentoId, () => ({
      janelas: [],
      folgas: [],
      bloqueios: [],
    }));
  }
}
