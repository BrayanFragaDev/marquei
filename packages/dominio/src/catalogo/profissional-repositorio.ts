import type { EstabelecimentoId } from "../compartilhado/identificador";
import type { Profissional } from "./profissional";
import type { ProfissionalId } from "./profissional-id";
import type { ServicoId } from "./servico-id";

/** Porta de persistencia da equipe. Sempre escopada por estabelecimento. */
export interface ProfissionalRepositorio {
  listarAtivos(estabelecimentoId: EstabelecimentoId): Promise<readonly Profissional[]>;
  /** Profissionais ativos habilitados no servico. */
  listarQueExecutam(
    estabelecimentoId: EstabelecimentoId,
    servicoId: ServicoId,
  ): Promise<readonly Profissional[]>;
  /** Devolve `null` se nao existir no estabelecimento (inclusive se pertencer a outro). */
  obterPorId(
    estabelecimentoId: EstabelecimentoId,
    id: ProfissionalId,
  ): Promise<Profissional | null>;
}
