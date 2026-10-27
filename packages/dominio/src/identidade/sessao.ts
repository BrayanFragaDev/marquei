import type { EstabelecimentoId } from "../compartilhado/identificador";
import type { Instante } from "../compartilhado/instante";
import type { Audiencia } from "./audiencia";
import type { Papel } from "./papel";
import { SessaoInvalidaError } from "./sessao-invalida-error";
import type { UsuarioId } from "./usuario-id";

export interface DadosDaSessao {
  readonly usuarioId: UsuarioId;
  readonly papel: Papel;
  /** `null` somente para o operador da plataforma. */
  readonly tenant: EstabelecimentoId | null;
  readonly audiencia: Audiencia;
  readonly emitidaEm: Instante;
  readonly expiraEm: Instante;
}

export interface NovaSessao {
  readonly usuarioId: UsuarioId;
  readonly papel: Papel;
  readonly tenant: EstabelecimentoId | null;
  readonly emitidaEm: Instante;
  readonly validadeEmMinutos: number;
}

/** Quem esta autenticado, com qual papel e em qual tenant. Imutavel e sempre coerente. */
export class Sessao {
  private constructor(private readonly dados: DadosDaSessao) {}

  static criar(nova: NovaSessao): Sessao {
    if (!(nova.validadeEmMinutos > 0)) throw new SessaoInvalidaError("Validade deve ser positiva.");
    return Sessao.reconstituir({
      usuarioId: nova.usuarioId,
      papel: nova.papel,
      tenant: nova.tenant,
      audiencia: nova.papel.audiencia(),
      emitidaEm: nova.emitidaEm,
      expiraEm: nova.emitidaEm.maisMinutos(nova.validadeEmMinutos),
    });
  }

  static reconstituir(dados: DadosDaSessao): Sessao {
    if (dados.audiencia !== dados.papel.audiencia()) {
      throw new SessaoInvalidaError("Audiencia incompativel com o papel.");
    }
    if (dados.papel.exigeTenant() !== (dados.tenant !== null)) {
      throw new SessaoInvalidaError("Tenant incompativel com o papel.");
    }
    if (!dados.expiraEm.depoisDe(dados.emitidaEm)) {
      throw new SessaoInvalidaError("Expiracao deve ser posterior a emissao.");
    }
    return new Sessao(dados);
  }

  get usuarioId(): UsuarioId {
    return this.dados.usuarioId;
  }

  get papel(): Papel {
    return this.dados.papel;
  }

  get tenant(): EstabelecimentoId | null {
    return this.dados.tenant;
  }

  get audiencia(): Audiencia {
    return this.dados.audiencia;
  }

  get emitidaEm(): Instante {
    return this.dados.emitidaEm;
  }

  get expiraEm(): Instante {
    return this.dados.expiraEm;
  }

  expirada(agora: Instante): boolean {
    return !agora.antesDe(this.dados.expiraEm);
  }

  pertenceAoTenant(tenant: EstabelecimentoId): boolean {
    return this.dados.tenant !== null && this.dados.tenant.igual(tenant);
  }

  tenantObrigatorio(): EstabelecimentoId {
    if (this.dados.tenant === null) throw new SessaoInvalidaError("Sessao sem tenant.");
    return this.dados.tenant;
  }
}
