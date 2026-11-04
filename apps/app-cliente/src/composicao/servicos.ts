import { criarClienteDaApi, type OpcoesDoCliente } from "@marquei/api-client";
import { AgendaSimulada } from "../adaptadores/agenda-simulada";
import { AgendamentosLocais } from "../adaptadores/agendamentos-locais";
import { AutenticadorSimulado } from "../adaptadores/autenticador-simulado";
import { ProfissionaisPelosHorarios } from "../adaptadores/profissionais-pelos-horarios";
import { GatewayDaApi } from "../api/gateway-da-api";
import { CalendarioDoEstabelecimento, FormatadorDeDuracao } from "../apresentacao/formatadores";
import type { EstabelecimentoNaTela } from "../apresentacao/estabelecimento-na-tela";
import { Mensagens } from "../mensagens/mensagens";
import type { AgendaDoProfissional } from "../portas/agenda-do-profissional";
import type { AgendamentosDoCliente } from "../portas/agendamentos-do-cliente";
import type { ArmazenamentoDeChaves } from "../portas/armazenamento-de-chaves";
import type { AutenticadorDoCliente } from "../portas/autenticador-do-cliente";
import type { CatalogoDeProfissionais } from "../portas/catalogo-de-profissionais";
import { RepositorioDeSessaoDoProfissional } from "../portas/sessao-do-profissional";

/** Tudo que as telas precisam, já ligado (injeção por construtor na raiz da aplicação). */
export interface Servicos {
  readonly estabelecimento: EstabelecimentoNaTela;
  readonly mensagens: Mensagens;
  readonly calendario: CalendarioDoEstabelecimento;
  readonly duracoes: FormatadorDeDuracao;
  readonly agora: () => Date;
  readonly gatewayDoCliente: GatewayDaApi;
  readonly gatewayDoProfissional: GatewayDaApi;
  readonly autenticador: AutenticadorDoCliente;
  readonly sessaoDoProfissional: RepositorioDeSessaoDoProfissional;
  readonly agendamentosDoCliente: AgendamentosDoCliente;
  readonly catalogoDeProfissionais: CatalogoDeProfissionais;
  readonly agendaDoProfissional: AgendaDoProfissional;
}

export interface EntradaDaComposicao {
  readonly estabelecimento: EstabelecimentoNaTela;
  readonly urlDaApi: string;
  readonly armazenamento: ArmazenamentoDeChaves;
  readonly agora?: () => Date;
  readonly fetch?: OpcoesDoCliente["fetch"];
}

function criarGateways(
  entrada: EntradaDaComposicao,
  autenticador: AutenticadorDoCliente,
  sessaoDoProfissional: RepositorioDeSessaoDoProfissional,
) {
  const { slug } = entrada.estabelecimento;
  const opcoes = { urlBase: entrada.urlDaApi, ...(entrada.fetch ? { fetch: entrada.fetch } : {}) };
  return {
    cliente: new GatewayDaApi(
      criarClienteDaApi({ ...opcoes, obterToken: () => autenticador.tokenDeAcesso(slug) }),
    ),
    profissional: new GatewayDaApi(
      criarClienteDaApi({
        ...opcoes,
        obterToken: () => sessaoDoProfissional.ler(slug)?.token ?? null,
      }),
    ),
  };
}

export function criarServicos(entrada: EntradaDaComposicao): Servicos {
  const { estabelecimento, armazenamento } = entrada;
  const agora = entrada.agora ?? ((): Date => new Date());
  const autenticador = new AutenticadorSimulado(armazenamento);
  const sessaoDoProfissional = new RepositorioDeSessaoDoProfissional(armazenamento);
  const gateways = criarGateways(entrada, autenticador, sessaoDoProfissional);
  const mensagens = new Mensagens(estabelecimento.vocabulario);
  const calendario = new CalendarioDoEstabelecimento(estabelecimento.fusoHorario);
  const nomear = (numero: number): string => mensagens.t("profissionais.nomePadrao", { numero });
  const nomesDeServico = async (): Promise<readonly string[]> =>
    (await gateways.profissional.listarServicos()).map((s) => s.nome);
  return {
    estabelecimento,
    mensagens,
    calendario,
    duracoes: new FormatadorDeDuracao(mensagens),
    agora,
    gatewayDoCliente: gateways.cliente,
    gatewayDoProfissional: gateways.profissional,
    autenticador,
    sessaoDoProfissional,
    agendamentosDoCliente: new AgendamentosLocais(armazenamento),
    catalogoDeProfissionais: new ProfissionaisPelosHorarios(
      gateways.cliente,
      calendario,
      agora,
      nomear,
    ),
    agendaDoProfissional: new AgendaSimulada(nomesDeServico),
  };
}
