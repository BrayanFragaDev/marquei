import { Module, type OnModuleInit } from "@nestjs/common";
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { Audiencia, type Relogio } from "@marquei/dominio";
import { FiltroDeErrosDeDominio } from "./filtro-de-erros-de-dominio";
import { GuardDeAutenticacao } from "./guard-de-autenticacao";
import { InterceptorDeTenant } from "./interceptor-de-tenant";
import { RelogioDoSistema } from "./relogio-do-sistema";
import { EmissorDeTokenJose } from "./tokens/emissor-de-token-jose";
import { SegredosJwt } from "./tokens/segredos-jwt";
import {
  TOKEN_EMISSOR_ESTABELECIMENTO,
  TOKEN_EMISSOR_PLATAFORMA,
} from "./tokens/tokens-de-injecao";

class ValidadorDeSegredosNaSubida implements OnModuleInit {
  constructor(private readonly segredos: SegredosJwt) {}

  onModuleInit(): void {
    if (process.env["NODE_ENV"] === "production") this.segredos.validar();
  }
}

/**
 * Autenticacao, tenant e erros: guard global (nega por padrao), interceptor de tenant,
 * filtro de ErroDeDominio e um emissor de token por audiencia. Importado por IdentidadeModule.
 */
@Module({
  providers: [
    { provide: SegredosJwt, useFactory: () => new SegredosJwt(process.env) },
    { provide: RelogioDoSistema, useClass: RelogioDoSistema },
    {
      provide: TOKEN_EMISSOR_ESTABELECIMENTO,
      inject: [SegredosJwt, RelogioDoSistema],
      useFactory: (s: SegredosJwt, relogio: Relogio) =>
        new EmissorDeTokenJose({
          audiencia: Audiencia.ConsoleEstabelecimento,
          segredo: () => s.estabelecimento(),
          relogio,
        }),
    },
    {
      provide: TOKEN_EMISSOR_PLATAFORMA,
      inject: [SegredosJwt, RelogioDoSistema],
      useFactory: (s: SegredosJwt, relogio: Relogio) =>
        new EmissorDeTokenJose({
          audiencia: Audiencia.ConsolePlataforma,
          segredo: () => s.plataforma(),
          relogio,
        }),
    },
    {
      provide: ValidadorDeSegredosNaSubida,
      inject: [SegredosJwt],
      useFactory: (s: SegredosJwt) => new ValidadorDeSegredosNaSubida(s),
    },
    { provide: APP_GUARD, useClass: GuardDeAutenticacao },
    { provide: APP_INTERCEPTOR, useClass: InterceptorDeTenant },
    { provide: APP_FILTER, useClass: FiltroDeErrosDeDominio },
  ],
  exports: [RelogioDoSistema, TOKEN_EMISSOR_ESTABELECIMENTO, TOKEN_EMISSOR_PLATAFORMA],
})
export class SegurancaModule {}
