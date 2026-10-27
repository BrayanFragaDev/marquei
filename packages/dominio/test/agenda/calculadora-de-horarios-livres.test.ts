import { describe, expect, it } from "vitest";
import {
  Bloqueio,
  BloqueioId,
  CalculadoraDeHorariosLivres,
  DiaCivil,
  FusoHorario,
  Instante,
  StatusAgendamento,
  type EntradaDoCalculo,
} from "../../src/index";
import {
  PROFISSIONAL_A,
  ESTABELECIMENTO,
  PROFISSIONAL_B,
  SP,
  agenda,
  bloqueioParcial,
  expediente,
  h,
  local,
  ocupante,
  profissional,
  profissionalSemServico,
  servico,
  uuid,
} from "./suporte";

const TERCA = "2026-10-27";
const calculadora = new CalculadoraDeHorariosLivres();
const AGORA_CEDO = Instante.deIso("2026-10-26T12:00:00Z");

function entrada(
  partes: Partial<EntradaDoCalculo> & Pick<EntradaDoCalculo, "agendas">,
): EntradaDoCalculo {
  return {
    dia: DiaCivil.deTexto(TERCA),
    fuso: SP,
    servico: servico(30),
    passoMinutos: 30,
    agora: AGORA_CEDO,
    ...partes,
  };
}

/** Horas locais de inicio (HH:MM) dos horarios livres de um profissional. */
function inicios(livres: ReturnType<CalculadoraDeHorariosLivres["calcular"]>): string[] {
  const meiaNoite = SP.instanteDe(DiaCivil.deTexto(TERCA), 0);
  return livres.map((l) => {
    const minutos = meiaNoite.minutosAte(l.inicio);
    return `${String(Math.floor(minutos / 60)).padStart(2, "0")}:${String(minutos % 60).padStart(2, "0")}`;
  });
}

describe("CalculadoraDeHorariosLivres", () => {
  describe("expediente, duracao e passo", () => {
    it("gera um horario a cada passo dentro do expediente", () => {
      const livres = calculadora.calcular(
        entrada({ agendas: [agenda({ horarios: [expediente(2, h(9), h(12))] })] }),
      );
      expect(inicios(livres)).toEqual(["09:00", "09:30", "10:00", "10:30", "11:00", "11:30"]);
      expect(livres[0]?.inicio.paraIso()).toBe("2026-10-27T12:00:00.000Z");
      expect(livres[0]?.fim.paraIso()).toBe("2026-10-27T12:30:00.000Z");
    });

    it("so oferece horario em que o servico inteiro cabe no expediente", () => {
      const livres = calculadora.calcular(
        entrada({
          servico: servico(60),
          agendas: [agenda({ horarios: [expediente(2, h(9), h(12))] })],
        }),
      );
      expect(inicios(livres)).toEqual(["09:00", "09:30", "10:00", "10:30", "11:00"]);
    });

    it("respeita o passo configuravel", () => {
      const livres = calculadora.calcular(
        entrada({
          passoMinutos: 15,
          agendas: [agenda({ horarios: [expediente(2, h(9), h(10))] })],
        }),
      );
      expect(inicios(livres)).toEqual(["09:00", "09:15", "09:30"]);
    });

    it("dia sem expediente nao tem horarios", () => {
      const livres = calculadora.calcular(
        entrada({ agendas: [agenda({ horarios: [expediente(0, h(9), h(12))] })] }),
      );
      expect(livres).toEqual([]);
    });

    it("expediente em dois turnos deixa o almoco de fora", () => {
      const livres = calculadora.calcular(
        entrada({
          agendas: [
            agenda({ horarios: [expediente(2, h(9), h(11)), expediente(2, h(14), h(15))] }),
          ],
        }),
      );
      expect(inicios(livres)).toEqual(["09:00", "09:30", "10:00", "10:30", "14:00", "14:30"]);
    });

    it("turnos sobrepostos nao duplicam horarios", () => {
      const livres = calculadora.calcular(
        entrada({
          agendas: [
            agenda({ horarios: [expediente(2, h(9), h(11)), expediente(2, h(10), h(12))] }),
          ],
        }),
      );
      expect(inicios(livres)).toEqual(["09:00", "09:30", "10:00", "10:30", "11:00", "11:30"]);
    });

    it("recusa passo que nao e inteiro positivo", () => {
      expect(() => calculadora.calcular(entrada({ passoMinutos: 0, agendas: [] }))).toThrow();
    });
  });

  describe("agendamentos existentes e intervalo entre atendimentos", () => {
    const base = [expediente(2, h(9), h(12))];

    it("remove os horarios que colidem com agendamento confirmado", () => {
      const livres = calculadora.calcular(
        entrada({
          agendas: [agenda({ horarios: base, ocupantes: [ocupante(TERCA, [10, 0], 30)] })],
        }),
      );
      expect(inicios(livres)).toEqual(["09:00", "09:30", "10:30", "11:00", "11:30"]);
    });

    it("horarios encostados no agendamento (sem intervalo) continuam livres", () => {
      const livres = calculadora.calcular(
        entrada({
          servico: servico(60),
          agendas: [agenda({ horarios: base, ocupantes: [ocupante(TERCA, [10, 0], 60)] })],
        }),
      );
      expect(inicios(livres)).toEqual(["09:00", "11:00"]);
    });

    it("agendamento cancelado nao ocupa horario", () => {
      const livres = calculadora.calcular(
        entrada({
          agendas: [
            agenda({
              horarios: base,
              ocupantes: [ocupante(TERCA, [10, 0], 30, { status: StatusAgendamento.Cancelado })],
            }),
          ],
        }),
      );
      expect(inicios(livres)).toHaveLength(6);
    });

    it("o intervalo do servico novo afasta o horario do proximo agendamento", () => {
      const livres = calculadora.calcular(
        entrada({
          servico: servico(30, 10),
          agendas: [agenda({ horarios: base, ocupantes: [ocupante(TERCA, [10, 0], 30)] })],
        }),
      );
      // 09:30 ocuparia ate 10:10 e invade o atendimento das 10:00.
      expect(inicios(livres)).toEqual(["09:00", "10:30", "11:00", "11:30"]);
    });

    it("o intervalo do agendamento existente afasta o horario seguinte", () => {
      const livres = calculadora.calcular(
        entrada({
          agendas: [
            agenda({
              horarios: base,
              ocupantes: [ocupante(TERCA, [10, 0], 30, { intervalo: 15 })],
            }),
          ],
        }),
      );
      // O atendimento das 10:00 so libera o profissional as 10:45.
      expect(inicios(livres)).toEqual(["09:00", "09:30", "11:00", "11:30"]);
    });

    it("o intervalo final nao precisa caber no expediente", () => {
      const livres = calculadora.calcular(
        entrada({
          servico: servico(30, 15),
          agendas: [agenda({ horarios: [expediente(2, h(9), h(10))] })],
        }),
      );
      expect(inicios(livres)).toEqual(["09:00", "09:30"]);
    });

    it("agendamento de outro profissional nao afeta o primeiro", () => {
      const livres = calculadora.calcular(
        entrada({
          agendas: [
            agenda({ horarios: base }),
            agenda({
              profissional: profissional(PROFISSIONAL_B),
              horarios: base.map(() => expediente(2, h(9), h(12), PROFISSIONAL_B)),
              ocupantes: [ocupante(TERCA, [9, 0], 180, { profissionalId: PROFISSIONAL_B })],
            }),
          ],
        }),
      );
      expect(livres.filter((l) => l.profissionalId.igual(PROFISSIONAL_A))).toHaveLength(6);
      expect(livres.filter((l) => l.profissionalId.igual(PROFISSIONAL_B))).toHaveLength(0);
    });
  });

  describe("folgas e bloqueios", () => {
    const base = [expediente(2, h(9), h(12))];

    it("bloqueio parcial remove os horarios que o tocam", () => {
      const livres = calculadora.calcular(
        entrada({
          agendas: [
            agenda({ horarios: base, bloqueios: [bloqueioParcial(TERCA, [9, 45], [10, 45])] }),
          ],
        }),
      );
      expect(inicios(livres)).toEqual(["09:00", "11:00", "11:30"]);
    });

    it("folga (bloqueio do dia inteiro) zera o dia", () => {
      const folga = Bloqueio.diaInteiro({
        id: BloqueioId.de(uuid(800)),
        estabelecimentoId: ESTABELECIMENTO,
        profissionalId: PROFISSIONAL_A,
        dia: DiaCivil.deTexto(TERCA),
        fuso: SP,
        motivo: "folga",
      });
      const livres = calculadora.calcular(
        entrada({ agendas: [agenda({ horarios: base, bloqueios: [folga] })] }),
      );
      expect(livres).toEqual([]);
    });

    it("bloqueio do estabelecimento (sem profissional) vale para toda a equipe", () => {
      const feriado = bloqueioParcial(TERCA, [0, 0], [23, 59], null);
      const livres = calculadora.calcular(
        entrada({
          agendas: [
            agenda({ horarios: base, bloqueios: [feriado] }),
            agenda({
              profissional: profissional(PROFISSIONAL_B),
              horarios: [expediente(2, h(9), h(12), PROFISSIONAL_B)],
              bloqueios: [feriado],
            }),
          ],
        }),
      );
      expect(livres).toEqual([]);
    });

    it("bloqueio que termina onde o horario comeca nao o remove", () => {
      const livres = calculadora.calcular(
        entrada({
          agendas: [
            agenda({ horarios: base, bloqueios: [bloqueioParcial(TERCA, [9, 0], [10, 0])] }),
          ],
        }),
      );
      expect(inicios(livres)[0]).toBe("10:00");
    });
  });

  describe("agora, fuso e virada de dia", () => {
    it("nao oferece horario que ja comecou ou passou", () => {
      const livres = calculadora.calcular(
        entrada({
          agora: local(TERCA, 10, 15),
          agendas: [agenda({ horarios: [expediente(2, h(9), h(12))] })],
        }),
      );
      expect(inicios(livres)).toEqual(["10:30", "11:00", "11:30"]);
    });

    it("oferece o horario que comeca exatamente agora", () => {
      const livres = calculadora.calcular(
        entrada({
          agora: local(TERCA, 10, 0),
          agendas: [agenda({ horarios: [expediente(2, h(9), h(11))] })],
        }),
      );
      expect(inicios(livres)).toEqual(["10:00", "10:30"]);
    });

    it("horario no fim da noite local cai no dia UTC seguinte, mas pertence ao dia local pedido", () => {
      const livres = calculadora.calcular(
        entrada({ agendas: [agenda({ horarios: [expediente(2, h(22), h(24))] })] }),
      );
      expect(inicios(livres)).toEqual(["22:00", "22:30", "23:00", "23:30"]);
      expect(livres.at(-1)?.inicio.paraIso()).toBe("2026-10-28T02:30:00.000Z");
      expect(livres.at(-1)?.fim.paraIso()).toBe("2026-10-28T03:00:00.000Z");
    });

    it("o dia seguinte nao herda os horarios da noite anterior", () => {
      const livres = calculadora.calcular(
        entrada({
          dia: DiaCivil.deTexto("2026-10-28"),
          agendas: [agenda({ horarios: [expediente(2, h(22), h(24))] })],
        }),
      );
      expect(livres).toEqual([]);
    });

    it("agendamento da noite anterior com intervalo invade o comeco do dia e o bloqueia", () => {
      const livres = calculadora.calcular(
        entrada({
          dia: DiaCivil.deTexto("2026-10-28"),
          agendas: [
            agenda({
              horarios: [expediente(3, h(0), h(2))],
              ocupantes: [ocupante(TERCA, [23, 30], 30, { intervalo: 30 })],
            }),
          ],
        }),
      );
      expect(livres.map((l) => l.inicio.paraIso())).toEqual([
        "2026-10-28T03:30:00.000Z",
        "2026-10-28T04:00:00.000Z",
        "2026-10-28T04:30:00.000Z",
      ]);
    });

    it("em dia de horario de verao (04/11/2018, 23h) usa o deslocamento correto", () => {
      const livres = calculadora.calcular(
        entrada({
          dia: DiaCivil.deTexto("2018-11-04"),
          agora: Instante.deIso("2018-11-01T00:00:00Z"),
          agendas: [agenda({ horarios: [expediente(0, h(8), h(9))] })],
        }),
      );
      // 08:00 local ja era UTC-2 neste dia.
      expect(livres.map((l) => l.inicio.paraIso())).toEqual([
        "2018-11-04T10:00:00.000Z",
        "2018-11-04T10:30:00.000Z",
      ]);
    });

    it("em dia de 25h (16/02/2019) o expediente da noite usa o tempo real decorrido", () => {
      const livres = calculadora.calcular(
        entrada({
          dia: DiaCivil.deTexto("2019-02-16"),
          agora: Instante.deIso("2019-02-01T00:00:00Z"),
          fuso: FusoHorario.de("America/Sao_Paulo"),
          agendas: [agenda({ horarios: [expediente(6, h(23), h(24))] })],
        }),
      );
      // 23:00 local = 01:00Z (UTC-2, primeira ocorrencia); o dia so acaba as 03:00Z.
      expect(livres[0]?.inicio.paraIso()).toBe("2019-02-17T01:00:00.000Z");
      expect(livres.at(-1)?.fim.paraIso()).toBe("2019-02-17T03:00:00.000Z");
    });
  });

  describe("quem pode atender", () => {
    it("profissional inativo nao oferece horarios", () => {
      const livres = calculadora.calcular(
        entrada({
          agendas: [
            agenda({
              profissional: profissional(PROFISSIONAL_A, false),
              horarios: [expediente(2, h(9), h(12))],
            }),
          ],
        }),
      );
      expect(livres).toEqual([]);
    });

    it("profissional que nao executa o servico nao oferece horarios", () => {
      const livres = calculadora.calcular(
        entrada({
          agendas: [
            agenda({
              profissional: profissionalSemServico(),
              horarios: [expediente(2, h(9), h(12))],
            }),
          ],
        }),
      );
      expect(livres).toEqual([]);
    });

    it("equipe: ordena por horario e depois por profissional", () => {
      const livres = calculadora.calcular(
        entrada({
          agendas: [
            agenda({
              profissional: profissional(PROFISSIONAL_B),
              horarios: [expediente(2, h(9), h(10), PROFISSIONAL_B)],
            }),
            agenda({ horarios: [expediente(2, h(9), h(10))] }),
          ],
        }),
      );
      expect(
        livres.map((l) => `${l.inicio.paraIso()}|${l.profissionalId.valor.slice(-2)}`),
      ).toEqual([
        "2026-10-27T12:00:00.000Z|10",
        "2026-10-27T12:00:00.000Z|11",
        "2026-10-27T12:30:00.000Z|10",
        "2026-10-27T12:30:00.000Z|11",
      ]);
    });
  });

  describe("estaLivre e janela de consulta", () => {
    const comOcupante = entrada({
      agendas: [
        agenda({
          horarios: [expediente(2, h(9), h(12))],
          ocupantes: [ocupante(TERCA, [10, 0], 30)],
        }),
      ],
    });

    it("confirma horario livre e recusa ocupado, fora do passo ou fora do expediente", () => {
      expect(calculadora.estaLivre(comOcupante, PROFISSIONAL_A, local(TERCA, 9, 0))).toBe(true);
      expect(calculadora.estaLivre(comOcupante, PROFISSIONAL_A, local(TERCA, 10, 0))).toBe(false);
      expect(calculadora.estaLivre(comOcupante, PROFISSIONAL_A, local(TERCA, 9, 10))).toBe(false);
      expect(calculadora.estaLivre(comOcupante, PROFISSIONAL_A, local(TERCA, 12, 0))).toBe(false);
      expect(calculadora.estaLivre(comOcupante, PROFISSIONAL_B, local(TERCA, 9, 0))).toBe(false);
    });

    it("a janela de consulta cobre o dia local e a folga final do maior intervalo", () => {
      const janela = calculadora.janelaDeConsulta(DiaCivil.deTexto(TERCA), SP);
      expect(janela.inicio.paraIso()).toBe("2026-10-27T03:00:00.000Z");
      expect(janela.fim.paraIso()).toBe("2026-10-28T07:00:00.000Z");
    });
  });

  describe("propriedade: nenhum horario devolvido colide com algo", () => {
    it("para 200 agendas pseudoaleatorias reprodutiveis", () => {
      let semente = 12345;
      const proximo = (limite: number): number => {
        semente = (semente * 1103515245 + 12345) % 2147483648;
        return semente % limite;
      };
      for (let i = 0; i < 200; i++) {
        const duracao = 15 + proximo(4) * 15;
        const intervalo = proximo(3) * 10;
        const ocupantes = Array.from({ length: proximo(5) }, () =>
          ocupante(TERCA, [9 + proximo(8), proximo(2) * 30], 15 + proximo(3) * 15, {
            intervalo: proximo(3) * 10,
          }),
        );
        const bloqueios = proximo(2) === 0 ? [] : [bloqueioParcial(TERCA, [12, 0], [13, 0])];
        const livres = calculadora.calcular(
          entrada({
            servico: servico(duracao, intervalo),
            passoMinutos: 15,
            agendas: [agenda({ horarios: [expediente(2, h(8), h(18))], ocupantes, bloqueios })],
          }),
        );
        for (const livre of livres) {
          const ocupacao = livre.inicio.maisMinutos(duracao + intervalo);
          for (const o of ocupantes) {
            const colide =
              livre.inicio.antesDe(o.janelaOcupada().fim) &&
              o.janelaOcupada().inicio.antesDe(ocupacao);
            expect(colide).toBe(false);
          }
          for (const b of bloqueios) expect(b.janela.sobrepoe(livre.janela)).toBe(false);
          expect(livre.fim.minutosAte(local(TERCA, 18, 0))).toBeGreaterThanOrEqual(0);
        }
      }
    });
  });
});
