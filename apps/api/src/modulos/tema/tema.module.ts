import { Module } from "@nestjs/common";
import {
  LeitorDeTemas,
  RegistradorDeRascunho,
  ValidadorDeContraste,
  type TemaRepositorio,
  type VerticalDoEstabelecimento,
} from "@marquei/design-tokens";
import type { PublicadorDeEventos, Relogio } from "@marquei/dominio";
import { PUBLICADOR_DE_EVENTOS, ProvedorDeTransacao } from "../../nucleo";
import { RelogioDoSistema } from "../../seguranca/relogio-do-sistema";
import { SegurancaModule } from "../../seguranca/seguranca.module";
import { ObterRascunho } from "./aplicacao/obter-rascunho";
import { ObterTemaPublicado } from "./aplicacao/obter-tema-publicado";
import { PublicarTema } from "./aplicacao/publicar-tema";
import { RestaurarTemaPadraoDaVertical } from "./aplicacao/restaurar-tema-padrao-da-vertical";
import { SalvarRascunhoDoTema } from "./aplicacao/salvar-rascunho-do-tema";
import { TemaRepositorioPostgres } from "./infra/tema-repositorio-postgres";
import { VerticalDoEstabelecimentoPostgres } from "./infra/vertical-do-estabelecimento-postgres";
import { EdicaoDeTemaController } from "./interface/edicao-de-tema.controller";
import { TemaController } from "./interface/tema.controller";

const TEMAS = Symbol("TEMAS");
const VERTICAIS = Symbol("VERTICAIS_DO_ESTABELECIMENTO");

/** Tema rascunho/publicado por estabelecimento: salvar, publicar (AA), ler e restaurar o padrao. */
@Module({
  imports: [SegurancaModule],
  controllers: [TemaController, EdicaoDeTemaController],
  providers: [
    {
      provide: TEMAS,
      inject: [ProvedorDeTransacao],
      useFactory: (t: ProvedorDeTransacao): TemaRepositorio => new TemaRepositorioPostgres(t),
    },
    {
      provide: VERTICAIS,
      inject: [ProvedorDeTransacao],
      useFactory: (t: ProvedorDeTransacao): VerticalDoEstabelecimento =>
        new VerticalDoEstabelecimentoPostgres(t),
    },
    {
      provide: LeitorDeTemas,
      inject: [TEMAS, VERTICAIS],
      useFactory: (temas: TemaRepositorio, verticais: VerticalDoEstabelecimento) =>
        new LeitorDeTemas(temas, verticais),
    },
    {
      provide: RegistradorDeRascunho,
      inject: [TEMAS, PUBLICADOR_DE_EVENTOS, RelogioDoSistema],
      useFactory: (temas: TemaRepositorio, eventos: PublicadorDeEventos, relogio: Relogio) =>
        new RegistradorDeRascunho(temas, eventos, relogio),
    },
    {
      provide: ObterTemaPublicado,
      inject: [LeitorDeTemas],
      useFactory: (leitor: LeitorDeTemas) => new ObterTemaPublicado(leitor),
    },
    {
      provide: ObterRascunho,
      inject: [LeitorDeTemas],
      useFactory: (leitor: LeitorDeTemas) => new ObterRascunho(leitor),
    },
    {
      provide: SalvarRascunhoDoTema,
      inject: [RegistradorDeRascunho],
      useFactory: (registrador: RegistradorDeRascunho) => new SalvarRascunhoDoTema(registrador),
    },
    {
      provide: RestaurarTemaPadraoDaVertical,
      inject: [LeitorDeTemas, RegistradorDeRascunho],
      useFactory: (leitor: LeitorDeTemas, registrador: RegistradorDeRascunho) =>
        new RestaurarTemaPadraoDaVertical(leitor, registrador),
    },
    {
      provide: PublicarTema,
      inject: [TEMAS, PUBLICADOR_DE_EVENTOS, RelogioDoSistema],
      useFactory: (temas: TemaRepositorio, eventos: PublicadorDeEventos, relogio: Relogio) =>
        new PublicarTema({ temas, validador: new ValidadorDeContraste(), eventos, relogio }),
    },
  ],
})
export class TemaModule {}
