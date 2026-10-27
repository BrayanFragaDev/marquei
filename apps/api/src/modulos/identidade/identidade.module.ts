import { Module } from "@nestjs/common";
import {
  Credencial,
  SenhaEmTexto,
  VerificadorDeSegundoFatorEmMemoria,
  type EmissorDeToken,
  type HashDeSenha,
  type RegistroDeTentativas,
  type Relogio,
  type UsuarioRepositorio,
  type VerificadorDeSegundoFator,
} from "@marquei/dominio";
import { randomBytes } from "node:crypto";
import { ExecutorTransacional, ProvedorDeTransacao } from "../../nucleo";
import { RelogioDoSistema } from "../../seguranca/relogio-do-sistema";
import { SegurancaModule } from "../../seguranca/seguranca.module";
import {
  TOKEN_EMISSOR_ESTABELECIMENTO,
  TOKEN_EMISSOR_PLATAFORMA,
} from "../../seguranca/tokens/tokens-de-injecao";
import { EmitirSessaoDoOperador } from "./aplicacao/emitir-sessao-do-operador";
import { LoginPorEmailESenha } from "./aplicacao/login-por-email-e-senha";
import { EscopoDeTenantTransacional } from "./infra/escopo-de-tenant-transacional";
import { HashDeSenhaArgon2 } from "./infra/hash-de-senha-argon2";
import { RegistroDeTentativasEmMemoria } from "./infra/registro-de-tentativas-em-memoria";
import { ResolvedorDeEstabelecimentoPostgres } from "./infra/resolvedor-de-estabelecimento-postgres";
import { UsuarioRepositorioPostgres } from "./infra/usuario-repositorio-postgres";
import { AuthController } from "./interface/auth.controller";

const HASH_DE_SENHA = Symbol("HASH_DE_SENHA");
const REGISTRO_DE_TENTATIVAS = Symbol("REGISTRO_DE_TENTATIVAS");
const USUARIOS = Symbol("USUARIOS");
const SEGUNDO_FATOR = Symbol("SEGUNDO_FATOR");

/** Identidade do console do estabelecimento (login por e-mail/senha) e esqueleto do operador. */
@Module({
  imports: [SegurancaModule],
  controllers: [AuthController],
  providers: [
    { provide: HASH_DE_SENHA, useFactory: (): HashDeSenha => new HashDeSenhaArgon2() },
    {
      provide: REGISTRO_DE_TENTATIVAS,
      useFactory: (): RegistroDeTentativas => new RegistroDeTentativasEmMemoria(),
    },
    {
      provide: USUARIOS,
      inject: [ProvedorDeTransacao],
      useFactory: (t: ProvedorDeTransacao): UsuarioRepositorio => new UsuarioRepositorioPostgres(t),
    },
    {
      provide: SEGUNDO_FATOR,
      useFactory: (): VerificadorDeSegundoFator => new VerificadorDeSegundoFatorEmMemoria(),
    },
    {
      provide: LoginPorEmailESenha,
      inject: [
        ExecutorTransacional,
        ProvedorDeTransacao,
        USUARIOS,
        HASH_DE_SENHA,
        REGISTRO_DE_TENTATIVAS,
        TOKEN_EMISSOR_ESTABELECIMENTO,
        RelogioDoSistema,
      ],
      // Rest com tupla: o Nest injeta na ordem de `inject`; sao 7 colaboradores.
      useFactory: async (
        ...[executor, transacao, usuarios, hasher, tentativas, emissor, relogio]: [
          ExecutorTransacional,
          ProvedorDeTransacao,
          UsuarioRepositorio,
          HashDeSenha,
          RegistroDeTentativas,
          EmissorDeToken,
          Relogio,
        ]
      ) =>
        new LoginPorEmailESenha({
          resolvedor: new ResolvedorDeEstabelecimentoPostgres(executor, transacao),
          escopo: new EscopoDeTenantTransacional(executor),
          usuarios,
          hasher,
          credencialDeEngano: await Credencial.criar(
            SenhaEmTexto.deTentativa(randomBytes(24).toString("hex")),
            hasher,
          ),
          tentativas,
          emissor,
          relogio,
        }),
    },
    {
      provide: EmitirSessaoDoOperador,
      inject: [SEGUNDO_FATOR, TOKEN_EMISSOR_PLATAFORMA, RelogioDoSistema],
      useFactory: (
        segundoFator: VerificadorDeSegundoFator,
        emissor: EmissorDeToken,
        relogio: Relogio,
      ) => new EmitirSessaoDoOperador({ segundoFator, emissor, relogio }),
    },
  ],
  exports: [EmitirSessaoDoOperador],
})
export class IdentidadeModule {}
