import type { Dinheiro } from "../compartilhado/dinheiro";
import type { Instante } from "../compartilhado/instante";
import { JanelaDeTempo } from "../agendamento/janela-de-tempo";
import type { ServicoId } from "./servico-id";
import { ServicoInvalidoError } from "./servico-invalido-error";

const MINUTOS_NO_DIA = 24 * 60;

export interface DadosDoServico {
  readonly id: ServicoId;
  readonly nome: string;
  readonly duracaoMinutos: number;
  readonly preco: Dinheiro;
  /** Folga do profissional depois do atendimento. Padrao: nenhuma. */
  readonly intervaloAposMinutos?: number;
  readonly ativo?: boolean;
}

/** O que o estabelecimento vende: nome, duracao, preco e a folga necessaria depois de cada atendimento. */
export class Servico {
  static readonly INTERVALO_MAXIMO_MINUTOS = 240;

  private constructor(private readonly dados: Required<DadosDoServico>) {}

  static criar(dados: DadosDoServico): Servico {
    const nome = dados.nome.trim();
    if (nome === "") throw new ServicoInvalidoError("o nome e obrigatorio");
    exigirDuracao(dados.duracaoMinutos);
    const intervaloAposMinutos = dados.intervaloAposMinutos ?? 0;
    exigirIntervalo(intervaloAposMinutos);
    return new Servico({ ...dados, nome, intervaloAposMinutos, ativo: dados.ativo ?? true });
  }

  static reconstituir(dados: DadosDoServico): Servico {
    return Servico.criar(dados);
  }

  get id(): ServicoId {
    return this.dados.id;
  }

  get nome(): string {
    return this.dados.nome;
  }

  get duracaoMinutos(): number {
    return this.dados.duracaoMinutos;
  }

  get preco(): Dinheiro {
    return this.dados.preco;
  }

  get intervaloAposMinutos(): number {
    return this.dados.intervaloAposMinutos;
  }

  get ativo(): boolean {
    return this.dados.ativo;
  }

  /** O atendimento em si: [inicio, inicio + duracao). */
  janelaEm(inicio: Instante): JanelaDeTempo {
    return JanelaDeTempo.comDuracao(inicio, this.duracaoMinutos);
  }

  /** O atendimento mais a folga final: [inicio, inicio + duracao + intervalo). */
  janelaOcupadaEm(inicio: Instante): JanelaDeTempo {
    return JanelaDeTempo.comDuracao(inicio, this.duracaoMinutos + this.intervaloAposMinutos);
  }

  comPreco(preco: Dinheiro): Servico {
    return this.com({ preco });
  }

  comDuracao(duracaoMinutos: number): Servico {
    return this.com({ duracaoMinutos });
  }

  comIntervaloApos(intervaloAposMinutos: number): Servico {
    return this.com({ intervaloAposMinutos });
  }

  renomear(nome: string): Servico {
    return this.com({ nome });
  }

  desativar(): Servico {
    return this.com({ ativo: false });
  }

  ativar(): Servico {
    return this.com({ ativo: true });
  }

  private com(mudanca: Partial<DadosDoServico>): Servico {
    return Servico.criar({ ...this.dados, ...mudanca });
  }
}

function exigirDuracao(minutos: number): void {
  if (!Number.isSafeInteger(minutos) || minutos < 1 || minutos > MINUTOS_NO_DIA) {
    throw new ServicoInvalidoError("a duracao deve ser de 1 a 1440 minutos inteiros");
  }
}

function exigirIntervalo(minutos: number): void {
  if (!Number.isSafeInteger(minutos) || minutos < 0 || minutos > Servico.INTERVALO_MAXIMO_MINUTOS) {
    throw new ServicoInvalidoError(
      `o intervalo deve ser de 0 a ${Servico.INTERVALO_MAXIMO_MINUTOS} minutos inteiros`,
    );
  }
}
