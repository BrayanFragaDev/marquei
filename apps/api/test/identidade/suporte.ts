import {
  Credencial,
  Email,
  EstabelecimentoId,
  HashDeSenhaFake,
  Instante,
  Papel,
  SenhaEmTexto,
  Slug,
  Usuario,
  UsuarioId,
  UsuarioRepositorioEmMemoria,
  type Relogio,
} from "@marquei/dominio";
import type { EscopoDeTenant } from "../../src/modulos/identidade/aplicacao/escopo-de-tenant";
import type { ResolvedorDeEstabelecimento } from "../../src/modulos/identidade/aplicacao/resolvedor-de-estabelecimento";
import { LoginPorEmailESenha } from "../../src/modulos/identidade/aplicacao/login-por-email-e-senha";
import { RegistroDeTentativasEmMemoria } from "../../src/modulos/identidade/infra/registro-de-tentativas-em-memoria";
import { EmissorDeTokenJose } from "../../src/seguranca/tokens/emissor-de-token-jose";

export const SEGREDO_ESTABELECIMENTO = "segredo-de-teste-do-estabelecimento-0123456789";
export const SEGREDO_PLATAFORMA = "segredo-de-teste-da-plataforma-9876543210";
export const SENHA_CORRETA = "cavalo-bateria-grampo-7";

export const TENANT_A = EstabelecimentoId.de("00000000-0000-4000-8000-0000000000a1");
export const TENANT_B = EstabelecimentoId.de("00000000-0000-4000-8000-0000000000b2");

export class RelogioMutavel implements Relogio {
  constructor(private instante: Instante) {}
  agora(): Instante {
    return this.instante;
  }
  avancar(minutos: number): void {
    this.instante = this.instante.maisMinutos(minutos);
  }
}

class ResolvedorEmMemoria implements ResolvedorDeEstabelecimento {
  constructor(private readonly mapa: ReadonlyMap<string, EstabelecimentoId>) {}
  idPorSlug(slug: Slug): Promise<EstabelecimentoId | null> {
    return Promise.resolve(this.mapa.get(slug.valor) ?? null);
  }
}

const escopoDireto: EscopoDeTenant = { noTenant: (_tenant, acao) => acao() };

export class HasherEspiao extends HashDeSenhaFake {
  verificacoes = 0;
  override verificar(...args: Parameters<HashDeSenhaFake["verificar"]>): Promise<boolean> {
    this.verificacoes++;
    return super.verificar(...args);
  }
}

export async function montarCenario(): Promise<{
  login: LoginPorEmailESenha;
  relogio: RelogioMutavel;
  hasher: HasherEspiao;
  emissor: EmissorDeTokenJose;
  usuarios: UsuarioRepositorioEmMemoria;
}> {
  const relogio = new RelogioMutavel(Instante.deIso("2030-01-10T12:00:00Z"));
  const hasher = new HasherEspiao();
  const usuarios = new UsuarioRepositorioEmMemoria();
  const credencial = await Credencial.criar(SenhaEmTexto.nova(SENHA_CORRETA), hasher);
  const base = { nome: "Dono", credencial, ativo: true };
  usuarios.adicionar(
    Usuario.reconstituir({
      ...base,
      id: UsuarioId.de("00000000-0000-4000-8000-000000000001"),
      estabelecimentoId: TENANT_A,
      email: Email.de("dono@a.test"),
      papel: Papel.Dono,
    }),
  );
  usuarios.adicionar(
    Usuario.reconstituir({
      ...base,
      id: UsuarioId.de("00000000-0000-4000-8000-000000000002"),
      estabelecimentoId: TENANT_A,
      email: Email.de("inativo@a.test"),
      papel: Papel.Gestor,
      ativo: false,
    }),
  );
  const emissor = new EmissorDeTokenJose({
    audiencia: "console-estabelecimento",
    segredo: () => SEGREDO_ESTABELECIMENTO,
    relogio,
  });
  const login = new LoginPorEmailESenha({
    resolvedor: new ResolvedorEmMemoria(
      new Map([
        ["loja-a", TENANT_A],
        ["loja-b", TENANT_B],
      ]),
    ),
    escopo: escopoDireto,
    usuarios,
    hasher,
    credencialDeEngano: await Credencial.criar(
      SenhaEmTexto.deTentativa("engano-nunca-usado"),
      hasher,
    ),
    tentativas: new RegistroDeTentativasEmMemoria(),
    emissor,
    relogio,
  });
  return { login, relogio, hasher, emissor, usuarios };
}

export const entrada = (slug: string, email: string, senha: string) => ({
  slug: Slug.de(slug),
  email: Email.de(email),
  senha: SenhaEmTexto.deTentativa(senha),
});
