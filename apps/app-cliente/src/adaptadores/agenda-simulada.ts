import type { AgendaDoProfissional, ItemDaAgenda } from "../portas/agenda-do-profissional";

const MS_POR_MINUTO = 60_000;
const DESLOCAMENTO_DO_FUSO_MINUTOS = -180;
const ATENDIMENTOS: readonly (readonly [number, number])[] = [
  [9 * 60, 30],
  [10 * 60 + 30, 60],
  [14 * 60, 30],
];

/** Adaptador SIMULADO com dados de demonstração (o mock não expõe a agenda do dia). */
export class AgendaSimulada implements AgendaDoProfissional {
  private readonly estado = new Map<string, ItemDaAgenda["status"]>();

  constructor(private readonly nomesDeServico: () => Promise<readonly string[]>) {}

  async doDia(dia: string): Promise<readonly ItemDaAgenda[]> {
    const meiaNoite = Date.parse(`${dia}T00:00:00Z`) - DESLOCAMENTO_DO_FUSO_MINUTOS * MS_POR_MINUTO;
    const nomes = await this.nomesDeServico();
    return ATENDIMENTOS.map(([minuto, duracao], i) => {
      const id = `${dia}-${i}`;
      return {
        id,
        inicio: new Date(meiaNoite + minuto * MS_POR_MINUTO).toISOString(),
        fim: new Date(meiaNoite + (minuto + duracao) * MS_POR_MINUTO).toISOString(),
        nomeDoServico: nomes[i % nomes.length] ?? "",
        status: this.estado.get(id) ?? "confirmado",
      };
    });
  }

  async concluir(id: string): Promise<ItemDaAgenda> {
    this.estado.set(id, "concluido");
    const dia = id.slice(0, 10);
    const item = (await this.doDia(dia)).find((a) => a.id === id);
    if (!item) throw new TypeError("Atendimento inexistente na agenda simulada.");
    return item;
  }
}
