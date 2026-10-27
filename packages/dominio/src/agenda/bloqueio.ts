import type { JanelaDeTempo } from "../agendamento/janela-de-tempo";
import type { ProfissionalId } from "../catalogo/profissional-id";
import type { EstabelecimentoId } from "../compartilhado/identificador";
import type { BloqueioId } from "./bloqueio-id";
import type { DiaCivil } from "./dia-civil";
import type { FusoHorario } from "./fuso-horario";

export interface DadosDoBloqueio {
  readonly id: BloqueioId;
  readonly estabelecimentoId: EstabelecimentoId;
  /** `null` bloqueia o estabelecimento todo (ex.: feriado). */
  readonly profissionalId: ProfissionalId | null;
  readonly janela: JanelaDeTempo;
  readonly motivo: string;
}

export interface DadosDeFolga extends Omit<DadosDoBloqueio, "janela"> {
  readonly dia: DiaCivil;
  readonly fuso: FusoHorario;
}

/** Periodo em que ninguem (ou um profissional) atende: folga, ferias, reuniao, feriado. */
export class Bloqueio {
  private constructor(readonly dados: DadosDoBloqueio) {}

  static criar(dados: DadosDoBloqueio): Bloqueio {
    return new Bloqueio({ ...dados, motivo: dados.motivo.trim() });
  }

  /** Folga: o dia local inteiro (23h, 24h ou 25h conforme o fuso). */
  static diaInteiro(dados: DadosDeFolga): Bloqueio {
    const { dia, fuso, ...resto } = dados;
    return Bloqueio.criar({ ...resto, janela: fuso.janelaDoDia(dia) });
  }

  get id(): BloqueioId {
    return this.dados.id;
  }

  get estabelecimentoId(): EstabelecimentoId {
    return this.dados.estabelecimentoId;
  }

  get profissionalId(): ProfissionalId | null {
    return this.dados.profissionalId;
  }

  get janela(): JanelaDeTempo {
    return this.dados.janela;
  }

  get motivo(): string {
    return this.dados.motivo;
  }

  valePara(profissionalId: ProfissionalId): boolean {
    return this.dados.profissionalId === null || this.dados.profissionalId.igual(profissionalId);
  }

  bloqueia(janela: JanelaDeTempo): boolean {
    return this.dados.janela.sobrepoe(janela);
  }
}
