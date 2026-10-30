import type { JanelaDeTempo } from "../agendamento/janela-de-tempo";
import type { ProfissionalId } from "../catalogo/profissional-id";
import type { Instante } from "../compartilhado/instante";

/** Um horario que o cliente pode escolher: quem atende e o atendimento propriamente dito. */
export class HorarioLivre {
  constructor(
    readonly profissionalId: ProfissionalId,
    readonly janela: JanelaDeTempo,
  ) {}

  get inicio(): Instante {
    return this.janela.inicio;
  }

  get fim(): Instante {
    return this.janela.fim;
  }
}
