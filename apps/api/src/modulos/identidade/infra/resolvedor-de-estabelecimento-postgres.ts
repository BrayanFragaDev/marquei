import { EstabelecimentoId, type Slug } from "@marquei/dominio";
import type { ExecutorTransacional, ProvedorDeTransacao } from "../../../nucleo";
import type { ResolvedorDeEstabelecimento } from "../aplicacao/resolvedor-de-estabelecimento";

/**
 * Consulta controlada: o login precisa achar o tenant ANTES de conhece-lo, e `app_usuario`
 * nao enxerga `estabelecimento` sem tenant (RLS). Por isso esta unica projecao
 * (apenas `id`, so estabelecimentos ativos) roda com `app_plataforma`. Nenhum outro dado e lido.
 */
export class ResolvedorDeEstabelecimentoPostgres implements ResolvedorDeEstabelecimento {
  constructor(
    private readonly executor: ExecutorTransacional,
    private readonly transacao: ProvedorDeTransacao,
  ) {}

  idPorSlug(slug: Slug): Promise<EstabelecimentoId | null> {
    return this.executor.executar({ papel: "app_plataforma" }, async () => {
      const r = await this.transacao
        .atual()
        .consultar<{ id: string }>(
          "SELECT id FROM estabelecimento WHERE slug = $1 AND status = 'ativo'",
          [slug.valor],
        );
      const linha = r.linhas[0];
      return linha ? EstabelecimentoId.de(linha.id) : null;
    });
  }
}
