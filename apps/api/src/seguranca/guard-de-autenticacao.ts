import { Inject, Injectable, type CanActivate, type ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { SessaoInvalidaError, type EmissorDeToken } from "@marquei/dominio";
import { ROTA_PUBLICA } from "./decoradores/publica";
import { ROTA_SOMENTE_OPERADOR } from "./decoradores/somente-operador";
import type { RequisicaoHttp } from "./requisicao-http";
import {
  TOKEN_EMISSOR_ESTABELECIMENTO,
  TOKEN_EMISSOR_PLATAFORMA,
} from "./tokens/tokens-de-injecao";

const PREFIXO = "Bearer ";

function extrairToken(cabecalho: string | string[] | undefined): string {
  if (typeof cabecalho !== "string" || !cabecalho.startsWith(PREFIXO))
    throw new SessaoInvalidaError();
  const token = cabecalho.slice(PREFIXO.length).trim();
  if (!token) throw new SessaoInvalidaError();
  return token;
}

/**
 * Guard GLOBAL (APP_GUARD): nega por padrao. So passa sem token a rota marcada com `@Publica()`.
 * A audiencia exigida vem da rota: `@SomenteOperador()` -> plataforma; senao -> estabelecimento.
 * Token de uma audiencia nunca valida na outra (segredo e `aud` distintos).
 */
@Injectable()
export class GuardDeAutenticacao implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject(TOKEN_EMISSOR_ESTABELECIMENTO) private readonly estabelecimento: EmissorDeToken,
    @Inject(TOKEN_EMISSOR_PLATAFORMA) private readonly plataforma: EmissorDeToken,
  ) {}

  async canActivate(contexto: ExecutionContext): Promise<boolean> {
    const alvos = [contexto.getHandler(), contexto.getClass()];
    if (this.reflector.getAllAndOverride<boolean>(ROTA_PUBLICA, alvos) === true) return true;
    if (contexto.getType() !== "http") throw new SessaoInvalidaError();
    const requisicao = contexto.switchToHttp().getRequest<RequisicaoHttp>();
    const token = extrairToken(requisicao.headers["authorization"]);
    const operador =
      this.reflector.getAllAndOverride<boolean>(ROTA_SOMENTE_OPERADOR, alvos) === true;
    requisicao.sessao = await (operador ? this.plataforma : this.estabelecimento).verificar(token);
    return true;
  }
}
