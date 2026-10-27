import {
  EstabelecimentoNaoEncontradoError,
  FusoHorario,
  ProfissionalNaoEncontradoError,
  ServicoNaoEncontradoError,
  type CalculadoraDeHorariosLivres,
  type DiaCivil,
  type EstabelecimentoId,
  type EstabelecimentoRepositorio,
  type HorarioLivre,
  type Profissional,
  type ProfissionalId,
  type ProfissionalRepositorio,
  type Relogio,
  type Servico,
  type ServicoId,
  type ServicoRepositorio,
} from "@marquei/dominio";
import type { AgendasDoDia } from "./agendas-do-dia";

export interface DependenciasDeConsultarHorariosLivres {
  readonly estabelecimentos: EstabelecimentoRepositorio;
  readonly servicos: ServicoRepositorio;
  readonly profissionais: ProfissionalRepositorio;
  readonly agendas: AgendasDoDia;
  readonly calculadora: CalculadoraDeHorariosLivres;
  readonly relogio: Relogio;
}

export interface EntradaDeConsultarHorariosLivres {
  readonly estabelecimentoId: EstabelecimentoId;
  readonly servicoId: ServicoId;
  /** `null` agrega todos os profissionais que executam o servico. */
  readonly profissionalId: ProfissionalId | null;
  readonly dia: DiaCivil;
}

export interface SaidaDeConsultarHorariosLivres {
  readonly dia: DiaCivil;
  readonly fusoHorario: string;
  readonly horarios: readonly HorarioLivre[];
}

export class ConsultarHorariosLivres {
  constructor(private readonly dependencias: DependenciasDeConsultarHorariosLivres) {}

  async execute(
    entrada: EntradaDeConsultarHorariosLivres,
  ): Promise<SaidaDeConsultarHorariosLivres> {
    const { estabelecimentos, agendas, calculadora, relogio } = this.dependencias;
    const { estabelecimentoId, dia } = entrada;
    const estabelecimento = await estabelecimentos.obterPorId(estabelecimentoId);
    if (!estabelecimento) throw new EstabelecimentoNaoEncontradoError();
    const servico = await this.servicoAtivo(entrada);
    const profissionais = await this.profissionais(entrada, servico);
    const fuso = FusoHorario.de(estabelecimento.fusoHorario);
    const horarios = calculadora.calcular({
      dia,
      fuso,
      servico,
      passoMinutos: estabelecimento.passoDaAgendaMinutos,
      agora: relogio.agora(),
      agendas: await agendas.carregar(estabelecimentoId, profissionais, dia, fuso),
    });
    return { dia, fusoHorario: estabelecimento.fusoHorario, horarios };
  }

  private async servicoAtivo(entrada: EntradaDeConsultarHorariosLivres): Promise<Servico> {
    const servico = await this.dependencias.servicos.obterPorId(
      entrada.estabelecimentoId,
      entrada.servicoId,
    );
    if (!servico?.ativo) throw new ServicoNaoEncontradoError();
    return servico;
  }

  private async profissionais(
    entrada: EntradaDeConsultarHorariosLivres,
    servico: Servico,
  ): Promise<readonly Profissional[]> {
    const { profissionais } = this.dependencias;
    if (entrada.profissionalId === null) {
      return profissionais.listarQueExecutam(entrada.estabelecimentoId, servico.id);
    }
    const profissional = await profissionais.obterPorId(
      entrada.estabelecimentoId,
      entrada.profissionalId,
    );
    if (!profissional) throw new ProfissionalNaoEncontradoError();
    profissional.exigirExecucaoDe(servico.id);
    return [profissional];
  }
}
