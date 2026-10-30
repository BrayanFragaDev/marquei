import type { ClienteDaApi } from "@marquei/api-client";
import type { EstabelecimentoPublico } from "../apresentacao/estabelecimento-na-tela";

/** Lê a marca pública do estabelecimento (`GET /v1/estabelecimentos/{slug}`); `null` se não existe. */
export class CarregadorDoEstabelecimento {
  constructor(private readonly api: ClienteDaApi) {}

  async carregar(slug: string): Promise<EstabelecimentoPublico | null> {
    const { data, response } = await this.api.GET("/v1/estabelecimentos/{slug}", {
      params: { path: { slug } },
    });
    if (data) return data;
    if (response.status === 404 || response.status === 400) return null;
    throw new TypeError(`Falha ao carregar o estabelecimento (HTTP ${response.status}).`);
  }
}
