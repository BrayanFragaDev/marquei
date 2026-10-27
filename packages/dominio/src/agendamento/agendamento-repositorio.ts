import type { EstabelecimentoId } from "../compartilhado/identificador";
import type { ProfissionalId } from "../catalogo/profissional-id";
import type { Agendamento } from "./agendamento";
import type { AgendamentoId } from "./agendamento-id";
import type { JanelaDeTempo } from "./janela-de-tempo";

/** Porta de persistencia de agendamentos. Sempre escopada por estabelecimento. */
export interface AgendamentoRepositorio {
  /** Lanca `AgendamentoNaoEncontradoError` se nao existir naquele estabelecimento. */
  obterPorId(estabelecimentoId: EstabelecimentoId, id: AgendamentoId): Promise<Agendamento>;

  /**
   * Agendamentos que ocupam horario (confirmados) do profissional que tocam a janela.
   * Base do calculo de horarios livres.
   */
  listarOcupantes(
    estabelecimentoId: EstabelecimentoId,
    profissionalId: ProfissionalId,
    janela: JanelaDeTempo,
  ): Promise<readonly Agendamento[]>;

  /** Insere ou atualiza. Sobreposicao do mesmo profissional deve falhar (restricao no banco). */
  salvar(agendamento: Agendamento): Promise<void>;
}
