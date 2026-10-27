import {
  Profissional,
  ProfissionalId,
  ServicoId,
  type EstabelecimentoId,
  type ProfissionalRepositorio,
} from "@marquei/dominio";
import type { ProvedorDeTransacao } from "../../../nucleo";

interface LinhaDeProfissional {
  readonly id: string;
  readonly nome: string;
  readonly ativo: boolean;
  readonly servicos_ids: readonly string[];
}

const SELECAO = `
  SELECT p.id, p.nome, p.ativo,
         COALESCE(array_agg(ps.servico_id::text) FILTER (WHERE ps.servico_id IS NOT NULL), '{}') AS servicos_ids
    FROM profissional p
    LEFT JOIN profissional_servico ps
           ON ps.profissional_id = p.id AND ps.estabelecimento_id = p.estabelecimento_id
   WHERE p.estabelecimento_id = $1`;
const AGRUPAMENTO = "GROUP BY p.id ORDER BY p.nome, p.id";

/** Exige transacao com tenant; o filtro por estabelecimento convive com a RLS do banco. */
export class ProfissionalRepositorioPostgres implements ProfissionalRepositorio {
  constructor(private readonly transacao: ProvedorDeTransacao) {}

  async listarAtivos(estabelecimentoId: EstabelecimentoId): Promise<readonly Profissional[]> {
    const r = await this.transacao
      .atual()
      .consultar<LinhaDeProfissional>(`${SELECAO} AND p.ativo ${AGRUPAMENTO}`, [
        estabelecimentoId.valor,
      ]);
    return r.linhas.map(paraDominio);
  }

  async listarQueExecutam(
    estabelecimentoId: EstabelecimentoId,
    servicoId: ServicoId,
  ): Promise<readonly Profissional[]> {
    const r = await this.transacao.atual().consultar<LinhaDeProfissional>(
      `${SELECAO} AND p.ativo
         AND EXISTS (SELECT 1 FROM profissional_servico x
                      WHERE x.profissional_id = p.id AND x.servico_id = $2)
       ${AGRUPAMENTO}`,
      [estabelecimentoId.valor, servicoId.valor],
    );
    return r.linhas.map(paraDominio);
  }

  async obterPorId(
    estabelecimentoId: EstabelecimentoId,
    id: ProfissionalId,
  ): Promise<Profissional | null> {
    const r = await this.transacao
      .atual()
      .consultar<LinhaDeProfissional>(`${SELECAO} AND p.id = $2 ${AGRUPAMENTO}`, [
        estabelecimentoId.valor,
        id.valor,
      ]);
    const linha = r.linhas[0];
    return linha ? paraDominio(linha) : null;
  }
}

function paraDominio(linha: LinhaDeProfissional): Profissional {
  return Profissional.reconstituir({
    id: ProfissionalId.de(linha.id),
    nome: linha.nome,
    servicosIds: linha.servicos_ids.map((s) => ServicoId.de(s)),
    ativo: linha.ativo,
  });
}
