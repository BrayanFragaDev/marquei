import {
  Papel,
  SegundoFatorObrigatorioError,
  Sessao,
  type EmissorDeToken,
  type Relogio,
  type TokenEmitido,
  type UsuarioId,
  type VerificadorDeSegundoFator,
} from "@marquei/dominio";

export const VALIDADE_DA_SESSAO_DO_OPERADOR_EM_MINUTOS = 15;

export interface DependenciasDoEmissorDoOperador {
  readonly segundoFator: VerificadorDeSegundoFator;
  /** Emissor da audiencia console-plataforma (segredo proprio). */
  readonly emissor: EmissorDeToken;
  readonly relogio: Relogio;
}

/**
 * Esqueleto do emissor de sessao do operador (a autenticacao primaria e do CP). Operador sem
 * 2FA ativo nao recebe sessao. Sessao curta, sem tenant, audiencia separada.
 */
export class EmitirSessaoDoOperador {
  constructor(private readonly dep: DependenciasDoEmissorDoOperador) {}

  async execute(entrada: { readonly operadorId: UsuarioId }): Promise<TokenEmitido> {
    if (!(await this.dep.segundoFator.ativoPara(entrada.operadorId))) {
      throw new SegundoFatorObrigatorioError();
    }
    const sessao = Sessao.criar({
      usuarioId: entrada.operadorId,
      papel: Papel.OperadorPlataforma,
      tenant: null,
      emitidaEm: this.dep.relogio.agora(),
      validadeEmMinutos: VALIDADE_DA_SESSAO_DO_OPERADOR_EM_MINUTOS,
    });
    return this.dep.emissor.emitir(sessao);
  }
}
