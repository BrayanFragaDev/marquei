import {
  Agendamento,
  AgendamentoId,
  AgendamentoRepositorioEmMemoria,
  BloqueioRepositorioEmMemoria,
  CalculadoraDeHorariosLivres,
  ClienteFinalId,
  Dinheiro,
  EstabelecimentoId,
  EstabelecimentoRepositorioEmMemoria,
  GeradorSequencialDeIdentificador,
  HorarioDeTrabalho,
  HorarioDeTrabalhoRepositorioEmMemoria,
  Instante,
  JanelaDeTempo,
  Profissional,
  ProfissionalId,
  ProfissionalRepositorioEmMemoria,
  PublicadorDeEventosEmMemoria,
  RelogioFixo,
  Servico,
  ServicoId,
  ServicoRepositorioEmMemoria,
  Slug,
  StatusAgendamento,
  type EstabelecimentoLeitura,
} from "@marquei/dominio";
import { AgendasDoDia } from "../../src/modulos/agenda/aplicacao/agendas-do-dia";
import { CancelarAgendamento } from "../../src/modulos/agenda/aplicacao/cancelar-agendamento";
import { ConsultarHorariosLivres } from "../../src/modulos/agenda/aplicacao/consultar-horarios-livres";
import { CriarAgendamento } from "../../src/modulos/agenda/aplicacao/criar-agendamento";

export const uuid = (n: number): string => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;

export const ESTAB_A = EstabelecimentoId.de(uuid(1));
export const ESTAB_B = EstabelecimentoId.de(uuid(2));
export const SERVICO_CORTE = ServicoId.de(uuid(10));
export const SERVICO_BARBA = ServicoId.de(uuid(11));
export const SERVICO_INATIVO = ServicoId.de(uuid(12));
export const SERVICO_DE_B = ServicoId.de(uuid(13));
export const JOAO = ProfissionalId.de(uuid(20));
export const BETO = ProfissionalId.de(uuid(21));
export const PROFISSIONAL_DE_B = ProfissionalId.de(uuid(22));
export const CLIENTE_1 = ClienteFinalId.de(uuid(30));
export const CLIENTE_2 = ClienteFinalId.de(uuid(31));

/** Segunda-feira, 09:00 em Sao Paulo. */
export const AGORA = Instante.deIso("2026-10-26T12:00:00Z");
export const TERCA = "2026-10-27";

const hora = (h: number): number => h * 60;

function estabelecimento(id: EstabelecimentoId, slug: string): EstabelecimentoLeitura {
  return {
    id,
    slug: Slug.de(slug),
    nome: slug,
    fusoHorario: "America/Sao_Paulo",
    vertical: "barbearia",
    passoDaAgendaMinutos: 30,
    antecedenciaDeCancelamentoMinutos: 120,
  };
}

function expediente(profissionalId: ProfissionalId): HorarioDeTrabalho[] {
  return [2, 3].map((dia) =>
    HorarioDeTrabalho.criar({
      profissionalId,
      diaDaSemana: dia as 2,
      inicioMinutos: hora(9),
      fimMinutos: hora(12),
    }),
  );
}

export function montarCenario() {
  const servico = (id: ServicoId, nome: string, minutos: number, extra = {}): Servico =>
    Servico.criar({
      id,
      nome,
      duracaoMinutos: minutos,
      preco: Dinheiro.deCentavos(4500),
      ...extra,
    });
  const servicos = new ServicoRepositorioEmMemoria(
    new Map([
      [
        ESTAB_A.valor,
        [
          servico(SERVICO_CORTE, "Corte", 30, { intervaloAposMinutos: 10 }),
          servico(SERVICO_BARBA, "Barba", 30),
          servico(SERVICO_INATIVO, "Antigo", 30, { ativo: false }),
        ],
      ],
      [ESTAB_B.valor, [servico(SERVICO_DE_B, "Corte de B", 30)]],
    ]),
  );
  const profissionais = new ProfissionalRepositorioEmMemoria(
    new Map([
      [
        ESTAB_A.valor,
        [
          Profissional.criar({
            id: JOAO,
            nome: "Joao",
            servicosIds: [SERVICO_CORTE, SERVICO_INATIVO],
          }),
          Profissional.criar({
            id: BETO,
            nome: "Beto",
            servicosIds: [SERVICO_CORTE, SERVICO_BARBA],
          }),
        ],
      ],
      [
        ESTAB_B.valor,
        [Profissional.criar({ id: PROFISSIONAL_DE_B, nome: "Zeca", servicosIds: [SERVICO_DE_B] })],
      ],
    ]),
  );
  const horarios = new HorarioDeTrabalhoRepositorioEmMemoria(
    new Map([
      [ESTAB_A.valor, [...expediente(JOAO), ...expediente(BETO)]],
      [ESTAB_B.valor, expediente(PROFISSIONAL_DE_B)],
    ]),
  );
  const estabelecimentos = new EstabelecimentoRepositorioEmMemoria([
    estabelecimento(ESTAB_A, "barbearia-a"),
    estabelecimento(ESTAB_B, "barbearia-b"),
  ]);
  const agendamentos = new AgendamentoRepositorioEmMemoria();
  const eventos = new PublicadorDeEventosEmMemoria();
  const relogio = new RelogioFixo(AGORA);
  const calculadora = new CalculadoraDeHorariosLivres();
  const agendas = new AgendasDoDia({
    horarios,
    bloqueios: new BloqueioRepositorioEmMemoria(),
    agendamentos,
    calculadora,
  });
  const base = { estabelecimentos, servicos, profissionais, agendas, calculadora, relogio };
  return {
    agendamentos,
    eventos,
    consultar: new ConsultarHorariosLivres(base),
    criar: new CriarAgendamento({
      ...base,
      agendamentos,
      eventos,
      identificadores: new GeradorSequencialDeIdentificador(1000),
    }),
    cancelar: new CancelarAgendamento({ estabelecimentos, agendamentos, eventos, relogio }),
    servicos,
  };
}

/** Atendimento do CLIENTE_1 que comeca 90 min depois de AGORA: dentro dos 120 min da politica de A. */
export function prestesAComecar(): Agendamento {
  return Agendamento.reconstituir(
    {
      id: AgendamentoId.de(uuid(999)),
      estabelecimentoId: ESTAB_A,
      servicoId: SERVICO_CORTE,
      profissionalId: JOAO,
      clienteId: CLIENTE_1,
      janela: JanelaDeTempo.comDuracao(AGORA.maisMinutos(90), 30),
      preco: Dinheiro.deCentavos(4500),
      intervaloAposMinutos: 0,
    },
    StatusAgendamento.Confirmado,
  );
}
