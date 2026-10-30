import { ErroDeDominio } from "@marquei/dominio";

/** Somente dono e gestor alteram o tema do estabelecimento. */
export class SemPermissaoParaAlterarTemaError extends ErroDeDominio {
  readonly codigo = "sem_permissao_para_alterar_tema";

  constructor() {
    super("Somente dono ou gestor do estabelecimento podem alterar o tema.");
  }
}
