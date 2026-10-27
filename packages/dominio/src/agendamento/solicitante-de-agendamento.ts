import { Papel } from "../identidade/papel";
import type { UsuarioId } from "../identidade/usuario-id";
import { AcaoNaoPermitidaError } from "./acao-nao-permitida-error";
import { AtorDoAgendamento } from "./ator-do-agendamento";
import { ClienteFinalId } from "./cliente-final-id";

/** Traduz quem esta autenticado (papel + id da sessao) no papel que ele tem sobre agendamentos. */
export class SolicitanteDeAgendamento {
  private constructor(
    private readonly papel: Papel,
    private readonly usuarioId: UsuarioId,
  ) {}

  static de(papel: Papel, usuarioId: UsuarioId): SolicitanteDeAgendamento {
    return new SolicitanteDeAgendamento(papel, usuarioId);
  }

  /** Quem agenda e sempre o proprio cliente final autenticado. */
  clienteQueAgenda(): ClienteFinalId {
    if (this.papel !== Papel.ClienteFinal) throw new AcaoNaoPermitidaError();
    return ClienteFinalId.de(this.usuarioId.valor);
  }

  ator(): AtorDoAgendamento {
    switch (this.papel) {
      case Papel.ClienteFinal:
        return AtorDoAgendamento.cliente(this.clienteQueAgenda());
      case Papel.Dono:
      case Papel.Gestor:
        return AtorDoAgendamento.equipe("gestor");
      case Papel.Profissional:
        return AtorDoAgendamento.equipe("profissional");
      default:
        throw new AcaoNaoPermitidaError();
    }
  }
}
