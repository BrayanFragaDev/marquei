import type { AgendamentoDaAgenda } from "../../contratos/agenda";
import type { MembroDaEquipe } from "../../contratos/catalogo";

/**
 * Dados iniciais alinhados com os ids do mock da API (`packages/api-client/mock/dados.ts`).
 * Estabelecimentos desconhecidos comecam vazios.
 */
const uuid = (bloco: string, n: number): string =>
  `${bloco}-0000-4000-8000-${String(n).padStart(12, "0")}`;

interface Semente {
  readonly equipe: readonly MembroDaEquipe[];
  readonly agendamentos: readonly AgendamentoDaAgenda[];
}

const SEMENTES: Readonly<Record<string, Semente>> = {
  [uuid("e1000000", 1)]: {
    equipe: [
      { id: uuid("d1000000", 1), nome: "Zé", papel: "dono", ativo: true },
      { id: uuid("b1000000", 1), nome: "Zé", papel: "profissional", ativo: true },
      { id: uuid("b1000000", 2), nome: "Beto", papel: "profissional", ativo: true },
    ],
    agendamentos: [
      {
        id: uuid("a1000000", 1),
        servicoId: uuid("51000000", 1),
        profissionalId: uuid("b1000000", 1),
        inicio: "2026-10-27T13:00:00.000Z",
        fim: "2026-10-27T13:30:00.000Z",
        status: "confirmado",
        precoCentavos: 4500,
      },
    ],
  },
  [uuid("e2000000", 1)]: {
    equipe: [
      { id: uuid("d2000000", 1), nome: "Aurora", papel: "dono", ativo: true },
      { id: uuid("b2000000", 1), nome: "Aurora", papel: "profissional", ativo: true },
      { id: uuid("b2000000", 2), nome: "Lia", papel: "profissional", ativo: true },
    ],
    agendamentos: [
      {
        id: uuid("a2000000", 1),
        servicoId: uuid("52000000", 1),
        profissionalId: uuid("b2000000", 1),
        inicio: "2026-10-27T13:00:00.000Z",
        fim: "2026-10-27T14:00:00.000Z",
        status: "confirmado",
        precoCentavos: 9000,
      },
    ],
  },
};

const VAZIA: Semente = { equipe: [], agendamentos: [] };

export const sementeDoEstabelecimento = (estabelecimentoId: string): Semente =>
  SEMENTES[estabelecimentoId] ?? VAZIA;
