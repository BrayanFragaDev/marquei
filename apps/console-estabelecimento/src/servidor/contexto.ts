import { criarClienteDaApi, type ClienteDaApi } from "@marquei/api-client";
import { cache } from "react";
import { redirect } from "next/navigation";
import { AgendamentosProvisorios } from "../adaptadores/provisorios/agendamentos-provisorios";
import { ArmazemProvisorio } from "../adaptadores/provisorios/armazem-provisorio";
import { EquipeProvisoria } from "../adaptadores/provisorios/equipe-provisoria";
import { HorariosProvisorios } from "../adaptadores/provisorios/horarios-provisorios";
import { ServicosProvisorios } from "../adaptadores/provisorios/servicos-provisorios";
import { FalhaDaApi } from "../api/falha-da-api";
import { FusoDoEstabelecimento } from "../apresentacao/fuso-do-estabelecimento";
import { ServicoDeTema } from "../aplicacao/servico-de-tema";
import { urlDaApi } from "../configuracao/ambiente";
import { Linguagem } from "../i18n/linguagem";
import { VocabularioDaVertical } from "../i18n/vocabulario-da-vertical";
import type { RepositorioDeAgendamentos } from "../portas/repositorio-de-agendamentos";
import type { RepositorioDeEquipe } from "../portas/repositorio-de-equipe";
import type { RepositorioDeHorarios } from "../portas/repositorio-de-horarios";
import type { RepositorioDeServicos } from "../portas/repositorio-de-servicos";
import { PermissoesDoPapel } from "../sessao/permissoes-do-papel";
import { ROTA_DE_LOGIN } from "../sessao/protecao-de-rotas";
import type { SessaoDoConsole } from "../sessao/sessao-do-console";
import { lerSessao } from "./cookie-da-sessao";
import { RelogioDoSistema } from "./relogio-do-sistema";

export interface ContextoDoServidor {
  readonly sessao: SessaoDoConsole;
  readonly permissoes: PermissoesDoPapel;
  readonly linguagem: Linguagem;
  readonly fuso: FusoDoEstabelecimento;
  readonly relogio: RelogioDoSistema;
  readonly temas: ServicoDeTema;
  readonly servicos: RepositorioDeServicos;
  readonly equipe: RepositorioDeEquipe;
  readonly horarios: RepositorioDeHorarios;
  readonly agendamentos: RepositorioDeAgendamentos;
}

export function clienteAutenticado(sessao: SessaoDoConsole): ClienteDaApi {
  return criarClienteDaApi({ urlBase: urlDaApi(), obterToken: () => sessao.tokenParaApi() });
}

/** Sessao invalida na API: volta ao login (o cookie velho e sobrescrito no proximo login). */
export function aoFalharNaSessao(erro: unknown): never {
  if (erro instanceof FalhaDaApi && erro.ehSessaoInvalida()) redirect(ROTA_DE_LOGIN);
  throw erro;
}

async function montar(sessao: SessaoDoConsole): Promise<ContextoDoServidor> {
  const api = clienteAutenticado(sessao);
  const fuso = new FusoDoEstabelecimento();
  const temas = new ServicoDeTema(api);
  const armazem = ArmazemProvisorio.compartilhado();
  const tenant = sessao.estabelecimentoId;
  const publicado = await temas.carregarPublicado().catch(aoFalharNaSessao);
  return {
    sessao,
    permissoes: new PermissoesDoPapel(sessao.papel),
    linguagem: new Linguagem(VocabularioDaVertical.deTema(publicado.tema.vocabulario)),
    fuso,
    relogio: new RelogioDoSistema(),
    temas,
    servicos: new ServicosProvisorios(api, armazem, tenant),
    equipe: new EquipeProvisoria(armazem, tenant),
    horarios: new HorariosProvisorios(armazem, tenant),
    agendamentos: new AgendamentosProvisorios(api, armazem, tenant, fuso),
  };
}

/** Contexto da requisicao (memoizado por render). Sem sessao valida, redireciona ao login. */
export const obterContexto = cache(async (): Promise<ContextoDoServidor> => {
  const sessao = await lerSessao();
  if (!sessao || sessao.expirada(new RelogioDoSistema())) redirect(ROTA_DE_LOGIN);
  return montar(sessao);
});
