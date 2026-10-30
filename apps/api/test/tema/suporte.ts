import {
  EstabelecimentoId,
  Instante,
  Papel,
  RelogioFixo,
  Sessao,
  UsuarioId,
  type EventoDeDominio,
  type PublicadorDeEventos,
} from "@marquei/dominio";
import {
  AutorDaAlteracao,
  LeitorDeTemas,
  RegistradorDeRascunho,
  TemaRepositorioEmMemoria,
  ValidadorDeContraste,
  VerticalDoEstabelecimentoFixa,
} from "@marquei/design-tokens";
import { ObterRascunho } from "../../src/modulos/tema/aplicacao/obter-rascunho";
import { ObterTemaPublicado } from "../../src/modulos/tema/aplicacao/obter-tema-publicado";
import { PublicarTema } from "../../src/modulos/tema/aplicacao/publicar-tema";
import { RestaurarTemaPadraoDaVertical } from "../../src/modulos/tema/aplicacao/restaurar-tema-padrao-da-vertical";
import { SalvarRascunhoDoTema } from "../../src/modulos/tema/aplicacao/salvar-rascunho-do-tema";

export const TENANT_A = EstabelecimentoId.de("00000000-0000-4000-8000-0000000000a1");
export const TENANT_B = EstabelecimentoId.de("00000000-0000-4000-8000-0000000000b2");
export const AGORA = Instante.deIso("2030-01-10T12:00:00Z");

export class PublicadorDeEventosEmMemoria implements PublicadorDeEventos {
  readonly publicados: EventoDeDominio[] = [];

  publicar(evento: EventoDeDominio): Promise<void> {
    this.publicados.push(evento);
    return Promise.resolve();
  }

  nomes(): string[] {
    return this.publicados.map((e) => e.nome);
  }
}

export function sessaoDe(papel: Papel, tenant: EstabelecimentoId = TENANT_A): Sessao {
  return Sessao.criar({
    usuarioId: UsuarioId.de("00000000-0000-4000-8000-000000000001"),
    papel,
    tenant,
    emitidaEm: AGORA,
    validadeEmMinutos: 15,
  });
}

export const autorDe = (tenant: EstabelecimentoId = TENANT_A): AutorDaAlteracao =>
  AutorDaAlteracao.deSessao(sessaoDe(Papel.Dono, tenant));

/** Casos de uso de tema ligados a fakes em memoria. */
export function montarCenario() {
  const temas = new TemaRepositorioEmMemoria();
  const eventos = new PublicadorDeEventosEmMemoria();
  const relogio = new RelogioFixo(AGORA);
  const verticais = new VerticalDoEstabelecimentoFixa()
    .comVertical(TENANT_A, "barbearia")
    .comVertical(TENANT_B, "manicure");
  const leitor = new LeitorDeTemas(temas, verticais);
  const registrador = new RegistradorDeRascunho(temas, eventos, relogio);
  const validador = new ValidadorDeContraste();
  return {
    temas,
    eventos,
    salvar: new SalvarRascunhoDoTema(registrador),
    restaurar: new RestaurarTemaPadraoDaVertical(leitor, registrador),
    publicar: new PublicarTema({ temas, validador, eventos, relogio }),
    obterPublicado: new ObterTemaPublicado(leitor),
    obterRascunho: new ObterRascunho(leitor),
  };
}
