import {
  Agendamento,
  AgendamentoId,
  AgendamentoNaoEncontradoError,
  ClienteFinalId,
  Dinheiro,
  EstabelecimentoId,
  HorarioIndisponivelError,
  Instante,
  JanelaDeTempo,
  ProfissionalId,
  ServicoId,
  StatusAgendamento,
  type AgendamentoRepositorio,
} from "@marquei/dominio";
import type { ProvedorDeTransacao } from "../../../nucleo";

interface LinhaDeAgendamento {
  readonly id: string;
  readonly estabelecimento_id: string;
  readonly profissional_id: string;
  readonly servico_id: string;
  readonly cliente_id: string;
  readonly inicio: Date;
  readonly fim: Date;
  readonly status: string;
  readonly preco_centavos: number;
  readonly intervalo_apos_minutos: number;
}

const COLUNAS = `id, estabelecimento_id, profissional_id, servico_id, cliente_id, inicio, fim,
  status, preco_centavos, intervalo_apos_minutos`;
const EXCLUSAO_VIOLADA = "23P01";

/**
 * Exige transacao com tenant. A garantia final contra dois agendamentos no mesmo horario e a
 * restricao de exclusao do banco (`agendamento_sem_sobreposicao`), traduzida aqui em
 * `HorarioIndisponivelError`.
 */
export class AgendamentoRepositorioPostgres implements AgendamentoRepositorio {
  constructor(private readonly transacao: ProvedorDeTransacao) {}

  async obterPorId(estabelecimentoId: EstabelecimentoId, id: AgendamentoId): Promise<Agendamento> {
    const r = await this.transacao
      .atual()
      .consultar<LinhaDeAgendamento>(
        `SELECT ${COLUNAS} FROM agendamento WHERE estabelecimento_id = $1 AND id = $2`,
        [estabelecimentoId.valor, id.valor],
      );
    const linha = r.linhas[0];
    if (!linha) throw new AgendamentoNaoEncontradoError();
    return paraDominio(linha);
  }

  async listarOcupantes(
    estabelecimentoId: EstabelecimentoId,
    profissionalId: ProfissionalId,
    janela: JanelaDeTempo,
  ): Promise<readonly Agendamento[]> {
    const r = await this.transacao.atual().consultar<LinhaDeAgendamento>(
      `SELECT ${COLUNAS} FROM agendamento
        WHERE estabelecimento_id = $1 AND profissional_id = $2 AND status = 'confirmado'
          AND inicio < $4 AND GREATEST(fim, ocupa_ate) > $3
        ORDER BY inicio, id`,
      [
        estabelecimentoId.valor,
        profissionalId.valor,
        janela.inicio.paraIso(),
        janela.fim.paraIso(),
      ],
    );
    return r.linhas.map(paraDominio);
  }

  async salvar(agendamento: Agendamento): Promise<void> {
    try {
      const r = await this.transacao.atual().consultar(
        `INSERT INTO agendamento
           (id, estabelecimento_id, profissional_id, servico_id, cliente_id, inicio, fim, ocupa_ate,
            status, preco_centavos, intervalo_apos_minutos)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         ON CONFLICT (id) DO UPDATE
            SET inicio = EXCLUDED.inicio, fim = EXCLUDED.fim, ocupa_ate = EXCLUDED.ocupa_ate,
                status = EXCLUDED.status
          WHERE agendamento.estabelecimento_id = EXCLUDED.estabelecimento_id`,
        valoresDe(agendamento),
      );
      // 0 linhas: o id existe, mas em outro estabelecimento (invisivel para este tenant).
      if (r.quantidade === 0) throw new AgendamentoNaoEncontradoError();
    } catch (erro) {
      if (codigoDoBanco(erro) === EXCLUSAO_VIOLADA) throw new HorarioIndisponivelError();
      throw erro;
    }
  }
}

function valoresDe(agendamento: Agendamento): unknown[] {
  return [
    agendamento.id.valor,
    agendamento.estabelecimentoId.valor,
    agendamento.profissionalId.valor,
    agendamento.servicoId.valor,
    agendamento.clienteId.valor,
    agendamento.janela.inicio.paraIso(),
    agendamento.janela.fim.paraIso(),
    agendamento.janelaOcupada().fim.paraIso(),
    agendamento.status,
    agendamento.preco.centavos,
    agendamento.intervaloAposMinutos,
  ];
}

function codigoDoBanco(erro: unknown): string | undefined {
  if (typeof erro !== "object" || erro === null || !("code" in erro)) return undefined;
  return typeof erro.code === "string" ? erro.code : undefined;
}

function paraStatus(texto: string): StatusAgendamento {
  const achado = Object.values(StatusAgendamento).find((s) => s === texto);
  if (!achado) throw new TypeError(`Status de agendamento desconhecido no banco: ${texto}`);
  return achado;
}

function paraDominio(l: LinhaDeAgendamento): Agendamento {
  return Agendamento.reconstituir(
    {
      id: AgendamentoId.de(l.id),
      estabelecimentoId: EstabelecimentoId.de(l.estabelecimento_id),
      servicoId: ServicoId.de(l.servico_id),
      profissionalId: ProfissionalId.de(l.profissional_id),
      clienteId: ClienteFinalId.de(l.cliente_id),
      janela: JanelaDeTempo.criar(
        Instante.deEpochMs(l.inicio.getTime()),
        Instante.deEpochMs(l.fim.getTime()),
      ),
      preco: Dinheiro.deCentavos(l.preco_centavos),
      intervaloAposMinutos: l.intervalo_apos_minutos,
    },
    paraStatus(l.status),
  );
}
