import { Module } from "@nestjs/common";
import type {
  EstabelecimentoPublicoRepositorio,
  EstabelecimentoRepositorio,
  ProfissionalRepositorio,
  ServicoRepositorio,
} from "@marquei/dominio";
import { ExecutorTransacional, ProvedorDeTransacao } from "../../nucleo";
import { SegurancaModule } from "../../seguranca/seguranca.module";
import { ListarServicos } from "./aplicacao/listar-servicos";
import { ObterEstabelecimentoPorSlug } from "./aplicacao/obter-estabelecimento-por-slug";
import { EstabelecimentoPublicoRepositorioPostgres } from "./infra/estabelecimento-publico-repositorio-postgres";
import { EstabelecimentoRepositorioPostgres } from "./infra/estabelecimento-repositorio-postgres";
import { ProfissionalRepositorioPostgres } from "./infra/profissional-repositorio-postgres";
import { ServicoRepositorioPostgres } from "./infra/servico-repositorio-postgres";
import { EstabelecimentoController } from "./interface/estabelecimento.controller";
import { ServicosController } from "./interface/servicos.controller";

export const SERVICOS = Symbol("SERVICOS");
export const PROFISSIONAIS = Symbol("PROFISSIONAIS");
export const ESTABELECIMENTOS = Symbol("ESTABELECIMENTOS");
const VITRINE_PUBLICA = Symbol("VITRINE_PUBLICA");

/** Catalogo: servicos, equipe e a vitrine publica do estabelecimento. */
@Module({
  imports: [SegurancaModule],
  controllers: [EstabelecimentoController, ServicosController],
  providers: [
    {
      provide: SERVICOS,
      inject: [ProvedorDeTransacao],
      useFactory: (t: ProvedorDeTransacao): ServicoRepositorio => new ServicoRepositorioPostgres(t),
    },
    {
      provide: PROFISSIONAIS,
      inject: [ProvedorDeTransacao],
      useFactory: (t: ProvedorDeTransacao): ProfissionalRepositorio =>
        new ProfissionalRepositorioPostgres(t),
    },
    {
      provide: ESTABELECIMENTOS,
      inject: [ProvedorDeTransacao],
      useFactory: (t: ProvedorDeTransacao): EstabelecimentoRepositorio =>
        new EstabelecimentoRepositorioPostgres(t),
    },
    {
      provide: VITRINE_PUBLICA,
      inject: [ExecutorTransacional, ProvedorDeTransacao],
      useFactory: (
        e: ExecutorTransacional,
        t: ProvedorDeTransacao,
      ): EstabelecimentoPublicoRepositorio => new EstabelecimentoPublicoRepositorioPostgres(e, t),
    },
    {
      provide: ListarServicos,
      inject: [SERVICOS],
      useFactory: (servicos: ServicoRepositorio) => new ListarServicos({ servicos }),
    },
    {
      provide: ObterEstabelecimentoPorSlug,
      inject: [VITRINE_PUBLICA],
      useFactory: (estabelecimentos: EstabelecimentoPublicoRepositorio) =>
        new ObterEstabelecimentoPorSlug({ estabelecimentos }),
    },
  ],
  exports: [SERVICOS, PROFISSIONAIS, ESTABELECIMENTOS],
})
export class CatalogoModule {}
