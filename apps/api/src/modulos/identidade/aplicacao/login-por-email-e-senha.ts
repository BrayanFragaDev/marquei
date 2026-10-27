import {
  ContaBloqueadaPorTentativasError,
  CredenciaisInvalidasError,
  type Credencial,
  type Email,
  type EmissorDeToken,
  type EstabelecimentoId,
  type HashDeSenha,
  type Papel,
  type RegistroDeTentativas,
  type Relogio,
  type SenhaEmTexto,
  type Slug,
  type Usuario,
  type UsuarioId,
  type UsuarioRepositorio,
  type Instante,
} from "@marquei/dominio";
import type { EscopoDeTenant } from "./escopo-de-tenant";
import type { ResolvedorDeEstabelecimento } from "./resolvedor-de-estabelecimento";

export const VALIDADE_DA_SESSAO_DO_ESTABELECIMENTO_EM_MINUTOS = 30;

export interface DependenciasDoLogin {
  readonly resolvedor: ResolvedorDeEstabelecimento;
  readonly escopo: EscopoDeTenant;
  readonly usuarios: UsuarioRepositorio;
  readonly hasher: HashDeSenha;
  /** Hash descartavel verificado quando a conta nao existe, para igualar o tempo de resposta. */
  readonly credencialDeEngano: Credencial;
  readonly tentativas: RegistroDeTentativas;
  readonly emissor: EmissorDeToken;
  readonly relogio: Relogio;
  readonly validadeEmMinutos?: number;
}

export interface EntradaDeLogin {
  readonly slug: Slug;
  readonly email: Email;
  readonly senha: SenhaEmTexto;
}

export interface SaidaDeLogin {
  readonly token: string;
  readonly expiraEm: Instante;
  readonly usuarioId: UsuarioId;
  readonly papel: Papel;
  readonly estabelecimentoId: EstabelecimentoId;
}

/**
 * Login de dono, gestor e profissional. O tenant e resolvido no servidor a partir do slug;
 * e-mail inexistente, senha errada, conta inativa e slug desconhecido produzem o mesmo erro
 * e o mesmo custo (sempre ha uma verificacao de hash). Falhas contam por (slug, e-mail).
 */
export class LoginPorEmailESenha {
  constructor(private readonly dep: DependenciasDoLogin) {}

  async execute(entrada: EntradaDeLogin): Promise<SaidaDeLogin> {
    const chave = `${entrada.slug.valor}|${entrada.email.valor}`;
    await this.exigirNaoBloqueado(chave);
    const usuario = await this.localizar(entrada);
    const credencial = usuario?.credencial ?? this.dep.credencialDeEngano;
    const senhaConfere = await credencial.verificar(entrada.senha, this.dep.hasher);
    if (!usuario || !senhaConfere || !usuario.podeEntrar()) {
      await this.dep.tentativas.registrarFalha(chave, this.dep.relogio.agora());
      throw new CredenciaisInvalidasError();
    }
    await this.dep.tentativas.zerar(chave);
    return this.abrirSessao(usuario);
  }

  private async exigirNaoBloqueado(chave: string): Promise<void> {
    const agora = this.dep.relogio.agora();
    const contador = await this.dep.tentativas.obter(chave);
    if (contador.bloqueadoAte && contador.bloqueado(agora)) {
      throw new ContaBloqueadaPorTentativasError(contador.bloqueadoAte);
    }
  }

  private async localizar(entrada: EntradaDeLogin): Promise<Usuario | null> {
    const tenant = await this.dep.resolvedor.idPorSlug(entrada.slug);
    if (!tenant) return null;
    return this.dep.escopo.noTenant(tenant, () =>
      this.dep.usuarios.obterPorEmail(tenant, entrada.email),
    );
  }

  private async abrirSessao(usuario: Usuario): Promise<SaidaDeLogin> {
    const validade = this.dep.validadeEmMinutos ?? VALIDADE_DA_SESSAO_DO_ESTABELECIMENTO_EM_MINUTOS;
    const sessao = usuario.iniciarSessao(this.dep.relogio.agora(), validade);
    const emitido = await this.dep.emissor.emitir(sessao);
    return {
      token: emitido.token,
      expiraEm: emitido.expiraEm,
      usuarioId: usuario.id,
      papel: usuario.papel,
      estabelecimentoId: usuario.estabelecimentoId,
    };
  }
}
