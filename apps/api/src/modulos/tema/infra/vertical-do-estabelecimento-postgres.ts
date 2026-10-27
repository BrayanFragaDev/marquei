import type { EstabelecimentoId } from "@marquei/dominio";
import {
  verticalOuPadrao,
  type Vertical,
  type VerticalDoEstabelecimento,
} from "@marquei/design-tokens";
import type { ProvedorDeTransacao } from "../../../nucleo";

/** Le a vertical do estabelecimento do tenant corrente (RLS em `estabelecimento`). */
export class VerticalDoEstabelecimentoPostgres implements VerticalDoEstabelecimento {
  constructor(private readonly transacao: ProvedorDeTransacao) {}

  async de(estabelecimento: EstabelecimentoId): Promise<Vertical> {
    const r = await this.transacao.atual().consultar<{ slug: string }>(
      `SELECT v.slug FROM estabelecimento e JOIN vertical v ON v.id = e.vertical_id
        WHERE e.id = $1`,
      [estabelecimento.valor],
    );
    return verticalOuPadrao(r.linhas[0]?.slug ?? "");
  }
}
