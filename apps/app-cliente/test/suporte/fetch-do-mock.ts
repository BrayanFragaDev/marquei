import { EstadoDoMock } from "../../../../packages/api-client/mock/rotas.ts";
import { TENANTS } from "../../../../packages/api-client/mock/dados.ts";

export { EstadoDoMock, TENANTS };

/** Instante fixo do mock (segunda 09:00 em São Paulo): os testes ficam determinísticos. */
export const AGORA_DOS_TESTES = new Date("2026-10-26T12:00:00.000Z");

function tokenDe(pedido: Request): string | null {
  const cabecalho = pedido.headers.get("authorization");
  return cabecalho?.startsWith("Bearer ") ? cabecalho.slice("Bearer ".length).trim() || null : null;
}

async function corpoDe(pedido: Request): Promise<unknown> {
  const texto = await pedido.text();
  return texto === "" ? undefined : (JSON.parse(texto) as unknown);
}

/** `fetch` injetável para `criarClienteDaApi`: responde com o mesmo mock de `pnpm mock:api`, sem rede. */
export function criarFetchDoMock(estado = new EstadoDoMock(AGORA_DOS_TESTES)) {
  const chamadas: string[] = [];
  const fetch = async (pedido: Request): Promise<Response> => {
    const url = new URL(pedido.url);
    chamadas.push(`${pedido.method} ${url.pathname}${url.search}`);
    const resposta = estado.tratar({
      metodo: pedido.method,
      caminho: url.pathname,
      consulta: url.searchParams,
      corpo: await corpoDe(pedido),
      token: tokenDe(pedido),
    });
    return new Response(JSON.stringify(resposta.corpo), {
      status: resposta.status,
      headers: { "content-type": "application/json" },
    });
  };
  return { fetch, chamadas, estado };
}

export function estabelecimentoDoMock(slug: string) {
  const tenant = TENANTS.find((t) => t.estabelecimento.slug === slug);
  if (!tenant) throw new TypeError(`Estabelecimento ${slug} não existe no mock.`);
  return tenant;
}
