import {
  Agendamento,
  AgendamentoId,
  Bloqueio,
  BloqueioId,
  ClienteFinalId,
  DiaCivil,
  Dinheiro,
  EstabelecimentoId,
  FusoHorario,
  HorarioDeTrabalho,
  Instante,
  JanelaDeTempo,
  Profissional,
  ProfissionalId,
  Servico,
  ServicoId,
  StatusAgendamento,
  type AgendaDoProfissional,
  type DiaDaSemana,
} from "../../src/index";

export const uuid = (n: number): string => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;

export const ESTABELECIMENTO = EstabelecimentoId.de(uuid(1));
export const SERVICO_ID = ServicoId.de(uuid(2));
export const PROFISSIONAL_A = ProfissionalId.de(uuid(10));
export const PROFISSIONAL_B = ProfissionalId.de(uuid(11));
export const SP = FusoHorario.de("America/Sao_Paulo");

/** Minutos desde a meia-noite local. */
export const h = (horas: number, minutos = 0): number => horas * 60 + minutos;

/** Instante a partir de uma hora local de Sao Paulo no dia civil (sem verao). */
export const local = (dia: string, horas: number, minutos = 0): Instante =>
  SP.instanteDe(DiaCivil.deTexto(dia), h(horas, minutos));

export function servico(duracaoMinutos: number, intervaloAposMinutos = 0): Servico {
  return Servico.criar({
    id: SERVICO_ID,
    nome: "Corte",
    duracaoMinutos,
    preco: Dinheiro.deCentavos(4500),
    intervaloAposMinutos,
  });
}

export function profissional(id: ProfissionalId = PROFISSIONAL_A, ativo = true): Profissional {
  return Profissional.reconstituir({ id, nome: "Joao", servicosIds: [SERVICO_ID], ativo });
}

export function profissionalSemServico(): Profissional {
  return Profissional.reconstituir({
    id: PROFISSIONAL_A,
    nome: "Joao",
    servicosIds: [],
    ativo: true,
  });
}

export function expediente(
  diaDaSemana: DiaDaSemana,
  inicio: number,
  fim: number,
  profissionalId: ProfissionalId = PROFISSIONAL_A,
): HorarioDeTrabalho {
  return HorarioDeTrabalho.criar({
    profissionalId,
    diaDaSemana,
    inicioMinutos: inicio,
    fimMinutos: fim,
  });
}

export function ocupante(
  dia: string,
  inicio: [number, number],
  minutos: number,
  opcoes: { intervalo?: number; status?: StatusAgendamento; profissionalId?: ProfissionalId } = {},
): Agendamento {
  return Agendamento.reconstituir(
    {
      id: AgendamentoId.de(uuid(100 + inicio[0] * 60 + inicio[1])),
      estabelecimentoId: ESTABELECIMENTO,
      servicoId: SERVICO_ID,
      profissionalId: opcoes.profissionalId ?? PROFISSIONAL_A,
      clienteId: ClienteFinalId.de(uuid(5)),
      janela: JanelaDeTempo.comDuracao(local(dia, inicio[0], inicio[1]), minutos),
      preco: Dinheiro.deCentavos(4500),
      intervaloAposMinutos: opcoes.intervalo ?? 0,
    },
    opcoes.status ?? StatusAgendamento.Confirmado,
  );
}

export function bloqueioParcial(
  dia: string,
  de: [number, number],
  ate: [number, number],
  profissionalId: ProfissionalId | null = PROFISSIONAL_A,
): Bloqueio {
  return Bloqueio.criar({
    id: BloqueioId.de(uuid(900 + de[0])),
    estabelecimentoId: ESTABELECIMENTO,
    profissionalId,
    janela: JanelaDeTempo.criar(local(dia, de[0], de[1]), local(dia, ate[0], ate[1])),
    motivo: "teste",
  });
}

export function agenda(
  partes: Partial<Omit<AgendaDoProfissional, "profissional">> & { profissional?: Profissional },
): AgendaDoProfissional {
  return {
    profissional: partes.profissional ?? profissional(),
    horarios: partes.horarios ?? [],
    bloqueios: partes.bloqueios ?? [],
    ocupantes: partes.ocupantes ?? [],
  };
}
