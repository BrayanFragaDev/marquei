import type { EstabelecimentoId, Sessao, UsuarioId } from "@marquei/dominio";
import { SemPermissaoParaAlterarTemaError } from "./sem-permissao-para-alterar-tema-error";

/**
 * Quem esta autorizado a alterar o tema e em qual estabelecimento. So existe a partir de uma
 * sessao de dono ou gestor: o tenant vem do token, nunca de entrada do cliente.
 */
export class AutorDaAlteracao {
  /** Tipo de ator no catalogo de eventos (plano.md, secao 7): dono e gestor contam como `gestor`. */
  readonly tipoDeAtor = "gestor";

  private constructor(
    readonly estabelecimentoId: EstabelecimentoId,
    readonly usuarioId: UsuarioId,
  ) {}

  /** Falha com `SemPermissaoParaAlterarTemaError` para qualquer outro papel. */
  static deSessao(sessao: Sessao): AutorDaAlteracao {
    if (!sessao.papel.gerenciaEstabelecimento()) throw new SemPermissaoParaAlterarTemaError();
    return new AutorDaAlteracao(sessao.tenantObrigatorio(), sessao.usuarioId);
  }
}
