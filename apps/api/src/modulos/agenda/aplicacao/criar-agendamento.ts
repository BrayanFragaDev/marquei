import {
  Agendamento,
  AgendamentoCriado,
  EstabelecimentoNaoEncontradoError,
  FusoHorario,
  HorarioIndisponivelError,
  ProfissionalNaoEncontradoError,
  ServicoNaoEncontradoError,
  type AgendamentoRepositorio,
  type CalculadoraDeHorariosLivres,
  type CanalDeAgendamento,
  type ClienteFinalId,
  type EstabelecimentoId,
  type EstabelecimentoLeitura,
  type EstabelecimentoRepositorio,
  type GeradorDeIdentificador,
  type Instante,
  type Profissional,
  type ProfissionalId,
  type ProfissionalRepositorio,
  type PublicadorDeEventos,
  type Relogio,
  type Servico,
  type ServicoId,
  type ServicoRepositorio,
} from "@marquei/dominio";
import type { AgendasDoDia } from "./agendas-do-dia";

export interface DependenciasDeCriarAgendamento {
  readonly estabelecimentos: EstabelecimentoRepositorio;
  readonly servicos: ServicoRepositorio;
  readonly profissionais: ProfissionalRepositorio;
  readonly agendamentos: AgendamentoRepositorio;
  readonly agendas: AgendasDoDia;
  readonly calculadora: CalculadoraDeHorariosLivres;
  readonly eventos: PublicadorDeEventos;
  readonly identificadores: GeradorDeIdentificador;
  readonly relogio: Relogio;
}

export interface EntradaDeCriarAgendamento {
  readonly estabelecimentoId: EstabelecimentoId;
  readonly clienteId: ClienteFinalId;
  readonly servicoId: ServicoId;
  readonly profissionalId: ProfissionalId;
  readonly inicio: Instante;
  readonly canal: CanalDeAgendamento;
}

export class CriarAgendamento {
  constructor(private readonly dependencias: DependenciasDeCriarAgendamento) {}

  async execute(entrada: EntradaDeCriarAgendamento): Promise<Agendamento> {
    const { estabelecimento, servico, profissional } = await this.carregar(entrada);
    const agora = this.dependencias.relogio.agora();
    const agendamento = this.novo(entrada, servico, agora);
    await this.exigirHorarioLivre(estabelecimento, servico, profissional, entrada.inicio);
    await this.dependencias.agendamentos.salvar(agendamento);
    await this.dependencias.eventos.publicar(
      new AgendamentoCriado({
        estabelecimentoId: entrada.estabelecimentoId,
        ocorridoEm: agora,
        agendamentoId: agendamento.id.valor,
        servicoId: servico.id.valor,
        profissionalId: profissional.id.valor,
        inicio: entrada.inicio,
        canal: entrada.canal,
        precoCentavos: servico.preco.centavos,
      }),
    );
    return agendamento;
  }

  private novo(entrada: EntradaDeCriarAgendamento, servico: Servico, agora: Instante): Agendamento {
    return Agendamento.criar(
      {
        id: this.dependencias.identificadores.novo("agendamento"),
        estabelecimentoId: entrada.estabelecimentoId,
        servicoId: servico.id,
        profissionalId: entrada.profissionalId,
        clienteId: entrada.clienteId,
        janela: servico.janelaEm(entrada.inicio),
        preco: servico.preco,
        intervaloAposMinutos: servico.intervaloAposMinutos,
      },
      agora,
    );
  }

  private async carregar(entrada: EntradaDeCriarAgendamento): Promise<{
    estabelecimento: EstabelecimentoLeitura;
    servico: Servico;
    profissional: Profissional;
  }> {
    const { estabelecimentoId } = entrada;
    const { servicos, profissionais, estabelecimentos } = this.dependencias;
    const estabelecimento = await estabelecimentos.obterPorId(estabelecimentoId);
    if (!estabelecimento) throw new EstabelecimentoNaoEncontradoError();
    const servico = await servicos.obterPorId(estabelecimentoId, entrada.servicoId);
    if (!servico?.ativo) throw new ServicoNaoEncontradoError();
    const profissional = await profissionais.obterPorId(estabelecimentoId, entrada.profissionalId);
    if (!profissional) throw new ProfissionalNaoEncontradoError();
    profissional.exigirExecucaoDe(servico.id);
    return { estabelecimento, servico, profissional };
  }

  private async exigirHorarioLivre(
    estabelecimento: EstabelecimentoLeitura,
    servico: Servico,
    profissional: Profissional,
    inicio: Instante,
  ): Promise<void> {
    const { agendas, calculadora, relogio } = this.dependencias;
    const fuso = FusoHorario.de(estabelecimento.fusoHorario);
    const dia = fuso.diaCivilDe(inicio);
    const livre = calculadora.estaLivre(
      {
        dia,
        fuso,
        servico,
        passoMinutos: estabelecimento.passoDaAgendaMinutos,
        agora: relogio.agora(),
        agendas: await agendas.carregar(estabelecimento.id, [profissional], dia, fuso),
      },
      profissional.id,
      inicio,
    );
    if (!livre) throw new HorarioIndisponivelError();
  }
}
