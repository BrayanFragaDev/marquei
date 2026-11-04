/**
 * Escolhas do cliente no fluxo de agendar. Imutável; serializa para a URL, de modo que um
 * desvio pelo login não perca nada e o link possa ser retomado.
 */
interface Dados {
  readonly servicoId: string | null;
  readonly profissionalId: string | null;
  readonly dia: string | null;
  readonly inicio: string | null;
  readonly profissionalDoHorario: string | null;
}

export class SelecaoDeAgendamento {
  readonly servicoId: string | null;
  readonly profissionalId: string | null;
  readonly dia: string | null;
  readonly inicio: string | null;
  readonly profissionalDoHorario: string | null;

  private constructor(dados: Dados) {
    this.servicoId = dados.servicoId;
    this.profissionalId = dados.profissionalId;
    this.dia = dados.dia;
    this.inicio = dados.inicio;
    this.profissionalDoHorario = dados.profissionalDoHorario;
  }

  static vazia(): SelecaoDeAgendamento {
    return new SelecaoDeAgendamento({
      servicoId: null,
      profissionalId: null,
      dia: null,
      inicio: null,
      profissionalDoHorario: null,
    });
  }

  static deConsulta(consulta: URLSearchParams): SelecaoDeAgendamento {
    return new SelecaoDeAgendamento({
      servicoId: consulta.get("servico"),
      profissionalId: consulta.get("profissional"),
      dia: consulta.get("dia"),
      inicio: consulta.get("inicio"),
      profissionalDoHorario: consulta.get("profissionalDoHorario"),
    });
  }

  private com(mudancas: Partial<Dados>): SelecaoDeAgendamento {
    return new SelecaoDeAgendamento({ ...this, ...mudancas });
  }

  comServico(servicoId: string): SelecaoDeAgendamento {
    return this.com({ servicoId, inicio: null, profissionalDoHorario: null });
  }

  /** `null` significa "qualquer profissional". */
  comProfissional(profissionalId: string | null): SelecaoDeAgendamento {
    return this.com({ profissionalId, inicio: null, profissionalDoHorario: null });
  }

  comDia(dia: string): SelecaoDeAgendamento {
    return this.com({ dia, inicio: null, profissionalDoHorario: null });
  }

  comHorario(inicio: string, profissionalDoHorario: string): SelecaoDeAgendamento {
    return this.com({ inicio, profissionalDoHorario });
  }

  estaCompleta(): boolean {
    return this.servicoId !== null && this.inicio !== null && this.profissionalDoHorario !== null;
  }

  paraConsulta(): URLSearchParams {
    const campos: ReadonlyArray<readonly [string, string | null]> = [
      ["servico", this.servicoId],
      ["profissional", this.profissionalId],
      ["dia", this.dia],
      ["inicio", this.inicio],
      ["profissionalDoHorario", this.profissionalDoHorario],
    ];
    const consulta = new URLSearchParams();
    for (const [nome, valor] of campos) if (valor !== null) consulta.set(nome, valor);
    return consulta;
  }
}
