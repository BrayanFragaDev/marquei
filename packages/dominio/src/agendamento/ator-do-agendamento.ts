import type { ClienteFinalId } from "./cliente-final-id";

export type TipoDeAtor = "cliente_final" | "profissional" | "gestor";

/**
 * Quem pratica uma acao sobre o agendamento. O cliente so enxerga os proprios agendamentos e
 * esta sujeito a politica de cancelamento; a equipe do estabelecimento nao.
 */
export class AtorDoAgendamento {
  private constructor(
    readonly tipo: TipoDeAtor,
    private readonly clienteId: ClienteFinalId | null,
  ) {}

  static cliente(clienteId: ClienteFinalId): AtorDoAgendamento {
    return new AtorDoAgendamento("cliente_final", clienteId);
  }

  static equipe(tipo: "profissional" | "gestor"): AtorDoAgendamento {
    return new AtorDoAgendamento(tipo, null);
  }

  enxerga(donoDoAgendamento: ClienteFinalId): boolean {
    return this.clienteId === null || this.clienteId.igual(donoDoAgendamento);
  }

  sujeitoAPolitica(): boolean {
    return this.clienteId !== null;
  }
}
