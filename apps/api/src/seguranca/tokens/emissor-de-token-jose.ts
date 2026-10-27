import { SignJWT, errors, jwtVerify } from "jose";
import {
  EstabelecimentoId,
  Instante,
  Papel,
  Sessao,
  SessaoExpiradaError,
  SessaoInvalidaError,
  UsuarioId,
  type Audiencia,
  type EmissorDeToken,
  type Relogio,
  type TokenEmitido,
} from "@marquei/dominio";

const EMISSOR = "marquei-api";
const ALGORITMO = "HS256";
const MIL = 1000;

export interface OpcoesDoEmissor {
  /** Audiencia unica atendida por esta instancia. */
  readonly audiencia: Audiencia;
  /** Lido sob demanda para falhar com mensagem clara somente quando de fato usado. */
  readonly segredo: () => string;
  readonly relogio: Relogio;
}

/**
 * JWT HS256 com `jose`. Claims: sub (usuario), papel, tenant (ausente para o operador),
 * aud (audiencia), iss, iat, exp. Cada audiencia usa segredo proprio: um token do console do
 * estabelecimento nao valida no da plataforma nem por assinatura nem por `aud`.
 */
export class EmissorDeTokenJose implements EmissorDeToken {
  private chave: Uint8Array | undefined;

  constructor(private readonly opcoes: OpcoesDoEmissor) {}

  async emitir(sessao: Sessao): Promise<TokenEmitido> {
    if (sessao.audiencia !== this.opcoes.audiencia) {
      throw new SessaoInvalidaError("Sessao de outra audiencia.");
    }
    const tenant = sessao.tenant;
    const token = await new SignJWT({
      papel: sessao.papel.nome,
      ...(tenant ? { tenant: tenant.valor } : {}),
    })
      .setProtectedHeader({ alg: ALGORITMO })
      .setSubject(sessao.usuarioId.valor)
      .setAudience(sessao.audiencia)
      .setIssuer(EMISSOR)
      .setIssuedAt(Math.floor(sessao.emitidaEm.epochMs / MIL))
      .setExpirationTime(Math.floor(sessao.expiraEm.epochMs / MIL))
      .sign(this.obterChave());
    return { token, expiraEm: sessao.expiraEm };
  }

  async verificar(token: string): Promise<Sessao> {
    try {
      const { payload } = await jwtVerify(token, this.obterChave(), {
        algorithms: [ALGORITMO],
        audience: this.opcoes.audiencia,
        issuer: EMISSOR,
        requiredClaims: ["sub", "exp", "iat", "aud", "iss"],
        currentDate: new Date(this.opcoes.relogio.agora().epochMs),
      });
      return this.paraSessao(payload);
    } catch (erro) {
      if (erro instanceof errors.JWTExpired) throw new SessaoExpiradaError();
      throw new SessaoInvalidaError();
    }
  }

  private paraSessao(payload: Record<string, unknown>): Sessao {
    const { sub, papel, tenant, iat, exp } = payload;
    if (typeof sub !== "string" || typeof papel !== "string") throw new SessaoInvalidaError();
    if (typeof iat !== "number" || typeof exp !== "number") throw new SessaoInvalidaError();
    if (tenant !== undefined && typeof tenant !== "string") throw new SessaoInvalidaError();
    return Sessao.reconstituir({
      usuarioId: UsuarioId.de(sub),
      papel: Papel.de(papel),
      tenant: tenant === undefined ? null : EstabelecimentoId.de(tenant),
      audiencia: this.opcoes.audiencia,
      emitidaEm: Instante.deEpochMs(iat * MIL),
      expiraEm: Instante.deEpochMs(exp * MIL),
    });
  }

  private obterChave(): Uint8Array {
    this.chave ??= new TextEncoder().encode(this.opcoes.segredo());
    return this.chave;
  }
}
