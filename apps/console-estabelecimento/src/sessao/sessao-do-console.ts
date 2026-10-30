import { ErroDeDominio, Instante, Papel } from "@marquei/dominio";
import type { Relogio } from "@marquei/dominio";

/** Dados de sessao que podem ir ao navegador: NUNCA inclui o token. */
export interface SessaoPublica {
  readonly usuarioId: string;
  readonly papel: string;
  readonly estabelecimentoId: string;
}

export interface DadosDaSessao {
  readonly token: string;
  readonly expiraEm: string;
  readonly usuarioId: string;
  readonly papel: string;
  readonly estabelecimentoId: string;
}

/** Papel que nao pertence a este console (ex.: operador da plataforma ou cliente final). */
export class PapelForaDoConsoleError extends ErroDeDominio {
  readonly codigo = "papel_fora_do_console";

  constructor() {
    super("Papel nao pertence ao console do estabelecimento.");
  }
}

const ehTexto = (valor: unknown): valor is string => typeof valor === "string" && valor.length > 0;

/** Sessao autenticada do console do estabelecimento. O token fica so no servidor. */
export class SessaoDoConsole {
  private constructor(
    private readonly _token: string,
    readonly expiraEm: Instante,
    readonly usuarioId: string,
    readonly papel: Papel,
    readonly estabelecimentoId: string,
  ) {}

  /** Cria a partir da resposta do login. Falha se o papel nao pertence a este console. */
  static criar(dados: DadosDaSessao): SessaoDoConsole {
    const papel = Papel.de(dados.papel);
    if (!papel.pertenceAoConsoleDoEstabelecimento()) {
      throw new PapelForaDoConsoleError();
    }
    return new SessaoDoConsole(
      dados.token,
      Instante.deIso(dados.expiraEm),
      dados.usuarioId,
      papel,
      dados.estabelecimentoId,
    );
  }

  /** Reconstitui a partir do valor do cookie; `null` se ausente, adulterado ou invalido. */
  static deCookie(valor: string | undefined): SessaoDoConsole | null {
    if (!valor) return null;
    try {
      const dados: unknown = JSON.parse(decodeURIComponent(valor));
      if (typeof dados !== "object" || dados === null) return null;
      const campos: Record<string, unknown> = Object.fromEntries(Object.entries(dados));
      const { token, expiraEm, usuarioId, papel, estabelecimentoId } = campos;
      if (!ehTexto(token) || !ehTexto(expiraEm) || !ehTexto(usuarioId)) return null;
      if (!ehTexto(papel) || !ehTexto(estabelecimentoId)) return null;
      return SessaoDoConsole.criar({ token, expiraEm, usuarioId, papel, estabelecimentoId });
    } catch {
      return null;
    }
  }

  paraCookie(): string {
    return encodeURIComponent(
      JSON.stringify({
        token: this._token,
        expiraEm: this.expiraEm.paraIso(),
        usuarioId: this.usuarioId,
        papel: this.papel.nome,
        estabelecimentoId: this.estabelecimentoId,
      }),
    );
  }

  /** Token bearer para chamar a API. Use apenas em codigo de servidor. */
  tokenParaApi(): string {
    return this._token;
  }

  expirada(relogio: Relogio): boolean {
    return !this.expiraEm.depoisDe(relogio.agora());
  }

  segundosRestantes(relogio: Relogio): number {
    return Math.max(0, Math.floor(relogio.agora().minutosAte(this.expiraEm) * 60));
  }

  paraCliente(): SessaoPublica {
    return {
      usuarioId: this.usuarioId,
      papel: this.papel.nome,
      estabelecimentoId: this.estabelecimentoId,
    };
  }
}
