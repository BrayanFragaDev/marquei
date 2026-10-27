import { Global, Module, type OnApplicationShutdown } from "@nestjs/common";
import { Pool } from "pg";
import type { PublicadorDeEventos } from "@marquei/dominio";
import { carregarEnv } from "@marquei/config/env";
import { PublicadorDeEventosOutbox } from "./eventos/publicador-de-eventos-outbox";
import { ExecutorTransacional } from "./transacao/executor-transacional";
import { ProvedorDeTransacao } from "./transacao/provedor-de-transacao";

export const POOL_DE_CONEXOES = Symbol("POOL_DE_CONEXOES");
export const PUBLICADOR_DE_EVENTOS = Symbol("PUBLICADOR_DE_EVENTOS");

class EncerradorDoPool implements OnApplicationShutdown {
  constructor(private readonly pool: Pool) {}

  async onApplicationShutdown(): Promise<void> {
    await this.pool.end();
  }
}

/**
 * Infraestrutura compartilhada: pool, transacao com tenant e publicador de eventos (outbox).
 * Modulos de negocio injetam `ExecutorTransacional`, `ProvedorDeTransacao` e, por token,
 * `PUBLICADOR_DE_EVENTOS` (interface do dominio).
 */
@Global()
@Module({
  providers: [
    {
      provide: POOL_DE_CONEXOES,
      useFactory: (): Pool => new Pool({ connectionString: carregarEnv(process.env).DATABASE_URL }),
    },
    { provide: ProvedorDeTransacao, useFactory: () => new ProvedorDeTransacao() },
    {
      provide: ExecutorTransacional,
      inject: [POOL_DE_CONEXOES, ProvedorDeTransacao],
      useFactory: (pool: Pool, p: ProvedorDeTransacao) => new ExecutorTransacional(pool, p),
    },
    {
      provide: PUBLICADOR_DE_EVENTOS,
      inject: [ProvedorDeTransacao],
      useFactory: (p: ProvedorDeTransacao): PublicadorDeEventos => new PublicadorDeEventosOutbox(p),
    },
    {
      provide: EncerradorDoPool,
      inject: [POOL_DE_CONEXOES],
      useFactory: (pool: Pool) => new EncerradorDoPool(pool),
    },
  ],
  exports: [POOL_DE_CONEXOES, ProvedorDeTransacao, ExecutorTransacional, PUBLICADOR_DE_EVENTOS],
})
export class NucleoModule {}
