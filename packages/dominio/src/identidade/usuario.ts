import type { EstabelecimentoId } from "../compartilhado/identificador";
import type { Instante } from "../compartilhado/instante";
import type { Credencial } from "./credencial";
import type { Email } from "./email";
import type { Papel } from "./papel";
import { Sessao } from "./sessao";
import type { UsuarioId } from "./usuario-id";

export interface DadosDoUsuario {
  readonly id: UsuarioId;
  readonly estabelecimentoId: EstabelecimentoId;
  readonly email: Email;
  readonly nome: string;
  readonly papel: Papel;
  readonly credencial: Credencial;
  readonly ativo: boolean;
}

/** Usuario do console do estabelecimento (dono, gestor, profissional) que entra com e-mail e senha. */
export class Usuario {
  private constructor(private readonly dados: DadosDoUsuario) {}

  static reconstituir(dados: DadosDoUsuario): Usuario {
    return new Usuario(dados);
  }

  get id(): UsuarioId {
    return this.dados.id;
  }

  get estabelecimentoId(): EstabelecimentoId {
    return this.dados.estabelecimentoId;
  }

  get email(): Email {
    return this.dados.email;
  }

  get papel(): Papel {
    return this.dados.papel;
  }

  get credencial(): Credencial {
    return this.dados.credencial;
  }

  podeEntrar(): boolean {
    return this.dados.ativo && this.dados.papel.pertenceAoConsoleDoEstabelecimento();
  }

  iniciarSessao(agora: Instante, validadeEmMinutos: number): Sessao {
    return Sessao.criar({
      usuarioId: this.dados.id,
      papel: this.dados.papel,
      tenant: this.dados.estabelecimentoId,
      emitidaEm: agora,
      validadeEmMinutos,
    });
  }
}
