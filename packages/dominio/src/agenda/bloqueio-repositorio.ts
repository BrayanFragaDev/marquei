import type { JanelaDeTempo } from "../agendamento/janela-de-tempo";
import type { ProfissionalId } from "../catalogo/profissional-id";
import type { EstabelecimentoId } from "../compartilhado/identificador";
import type { Bloqueio } from "./bloqueio";

export interface BloqueioRepositorio {
  /** Bloqueios do profissional e do estabelecimento todo que tocam a janela. */
  doProfissional(
    estabelecimentoId: EstabelecimentoId,
    profissionalId: ProfissionalId,
    janela: JanelaDeTempo,
  ): Promise<readonly Bloqueio[]>;
}
