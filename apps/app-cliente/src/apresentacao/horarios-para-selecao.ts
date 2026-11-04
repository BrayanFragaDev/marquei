import type { components } from "@marquei/api-client";
import type { OpcaoDeHorario } from "@marquei/ui";
import type { CalendarioDoEstabelecimento } from "./formatadores";

export type HorarioLivre = components["schemas"]["HorarioLivre"];

/**
 * Transforma os horários livres da API em opções de tela. Com "qualquer profissional" o mesmo
 * instante pode vir de várias pessoas: mostra uma vez e guarda quem atende (o servidor confirma).
 */
export class HorariosParaSelecao {
  private readonly porInicio: ReadonlyMap<string, HorarioLivre>;

  constructor(
    itens: readonly HorarioLivre[],
    private readonly calendario: CalendarioDoEstabelecimento,
  ) {
    const mapa = new Map<string, HorarioLivre>();
    for (const item of itens) if (!mapa.has(item.inicio)) mapa.set(item.inicio, item);
    this.porInicio = mapa;
  }

  opcoes(): readonly OpcaoDeHorario[] {
    return [...this.porInicio.values()].map((h) => ({
      valor: h.inicio,
      rotulo: this.calendario.hora(h.inicio),
    }));
  }

  profissionalDe(inicio: string): string | null {
    return this.porInicio.get(inicio)?.profissionalId ?? null;
  }
}
