import {
  Dinheiro,
  ServicoId,
  Servico,
  type EstabelecimentoId,
  type ServicoRepositorio,
} from "@marquei/dominio";
import type { ProvedorDeTransacao } from "../../../nucleo";

interface LinhaDeServico {
  readonly id: string;
  readonly nome: string;
  readonly duracao_minutos: number;
  readonly preco_centavos: number;
  readonly intervalo_apos_minutos: number;
  readonly ativo: boolean;
}

const COLUNAS = "id, nome, duracao_minutos, preco_centavos, intervalo_apos_minutos, ativo";

/** Exige transacao com tenant; o filtro por estabelecimento convive com a RLS do banco. */
export class ServicoRepositorioPostgres implements ServicoRepositorio {
  constructor(private readonly transacao: ProvedorDeTransacao) {}

  async listarAtivos(estabelecimentoId: EstabelecimentoId): Promise<readonly Servico[]> {
    const r = await this.transacao.atual().consultar<LinhaDeServico>(
      `SELECT ${COLUNAS} FROM servico
        WHERE estabelecimento_id = $1 AND ativo ORDER BY nome, id`,
      [estabelecimentoId.valor],
    );
    return r.linhas.map(paraDominio);
  }

  async obterPorId(estabelecimentoId: EstabelecimentoId, id: ServicoId): Promise<Servico | null> {
    const r = await this.transacao
      .atual()
      .consultar<LinhaDeServico>(
        `SELECT ${COLUNAS} FROM servico WHERE estabelecimento_id = $1 AND id = $2`,
        [estabelecimentoId.valor, id.valor],
      );
    const linha = r.linhas[0];
    return linha ? paraDominio(linha) : null;
  }
}

function paraDominio(linha: LinhaDeServico): Servico {
  return Servico.reconstituir({
    id: ServicoId.de(linha.id),
    nome: linha.nome,
    duracaoMinutos: linha.duracao_minutos,
    preco: Dinheiro.deCentavos(linha.preco_centavos),
    intervaloAposMinutos: linha.intervalo_apos_minutos,
    ativo: linha.ativo,
  });
}
