/** Contratos PROPOSTOS ao BN (ainda fora do OpenAPI). Dinheiro em centavos; datas em ISO 8601 UTC. */
export interface ServicoDoCatalogo {
  readonly id: string;
  readonly nome: string;
  readonly duracaoMinutos: number;
  readonly precoCentavos: number;
  readonly ativo: boolean;
}

export interface DadosDoServico {
  readonly nome: string;
  readonly duracaoMinutos: number;
  readonly precoCentavos: number;
}

export interface MembroDaEquipe {
  readonly id: string;
  readonly nome: string;
  readonly papel: "profissional" | "gestor" | "dono";
  readonly ativo: boolean;
}

export interface DadosDoMembro {
  readonly nome: string;
  readonly papel: "profissional" | "gestor";
}

/** Dia da semana: 0 = domingo ... 6 = sabado. Minutos desde 00:00 no fuso do estabelecimento. */
export interface JanelaSemanal {
  readonly id: string;
  readonly profissionalId: string;
  readonly diaDaSemana: number;
  readonly inicioMinutos: number;
  readonly fimMinutos: number;
}

export interface Folga {
  readonly id: string;
  readonly profissionalId: string;
  /** Dia civil `YYYY-MM-DD` no fuso do estabelecimento. */
  readonly dia: string;
  readonly motivo: string;
}

export interface Bloqueio {
  readonly id: string;
  readonly profissionalId: string;
  readonly inicio: string;
  readonly fim: string;
  readonly motivo: string;
}

export interface AgendaDoProfissional {
  readonly janelas: readonly JanelaSemanal[];
  readonly folgas: readonly Folga[];
  readonly bloqueios: readonly Bloqueio[];
}
