import createClient, { type Client, type ClientOptions } from "openapi-fetch";
import type { paths } from "./gerado/schema";

export type ClienteDaApi = Client<paths>;

export interface OpcoesDoCliente {
  /** URL base da API, sem barra final. */
  readonly urlBase: string;
  /** Devolve o token bearer atual (ou `null` sem sessao). Lido a cada requisicao. */
  readonly obterToken?: () => string | null | Promise<string | null>;
  readonly fetch?: ClientOptions["fetch"];
}

/**
 * Cliente tipado da API. Nao aceita estabelecimento: o tenant vem sempre do token
 * (CLAUDE.md, secao 5).
 */
export function criarClienteDaApi(opcoes: OpcoesDoCliente): ClienteDaApi {
  const cliente = createClient<paths>({
    baseUrl: opcoes.urlBase,
    ...(opcoes.fetch ? { fetch: opcoes.fetch } : {}),
  });
  const { obterToken } = opcoes;
  if (obterToken) {
    cliente.use({
      async onRequest({ request }) {
        const token = await obterToken();
        if (token) request.headers.set("Authorization", `Bearer ${token}`);
        return request;
      },
    });
  }
  return cliente;
}
