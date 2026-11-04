import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { ArmazenamentoEmMemoria } from "../../src/adaptadores/armazenamento-local";
import { EstabelecimentoNaTela } from "../../src/apresentacao/estabelecimento-na-tela";
import { ProvedorDeServicosPronto } from "../../src/composicao/contexto-de-servicos";
import { criarServicos } from "../../src/composicao/servicos";
import {
  AGORA_DOS_TESTES,
  EstadoDoMock,
  criarFetchDoMock,
  estabelecimentoDoMock,
} from "./fetch-do-mock";

interface Opcoes {
  readonly slug?: string;
  readonly estado?: EstadoDoMock;
  readonly armazenamento?: ArmazenamentoEmMemoria;
  readonly fetch?: (pedido: Request) => Promise<Response>;
}

/** Renderiza uma tela contra o mock do api-client (fetch injetado), sem rede e sem Next. */
export function renderizarTela(tela: ReactElement, opcoes: Opcoes = {}) {
  const slug = opcoes.slug ?? "barbearia-do-ze";
  const mock = criarFetchDoMock(opcoes.estado ?? new EstadoDoMock(AGORA_DOS_TESTES));
  const armazenamento = opcoes.armazenamento ?? new ArmazenamentoEmMemoria();
  const servicos = criarServicos({
    estabelecimento: EstabelecimentoNaTela.criar(estabelecimentoDoMock(slug).estabelecimento),
    urlDaApi: "http://api.teste",
    armazenamento,
    agora: () => AGORA_DOS_TESTES,
    fetch: opcoes.fetch ?? mock.fetch,
  });
  const resultado = render(
    <ProvedorDeServicosPronto servicos={servicos}>{tela}</ProvedorDeServicosPronto>,
  );
  return { ...resultado, servicos, armazenamento, chamadas: mock.chamadas };
}
