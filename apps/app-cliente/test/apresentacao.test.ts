import { describe, expect, it } from "vitest";
import { CodigoDeAcesso } from "../src/apresentacao/codigo-de-acesso";
import { destinoSeguro } from "../src/apresentacao/destino-seguro";
import { EstabelecimentoNaTela } from "../src/apresentacao/estabelecimento-na-tela";
import {
  CalendarioDoEstabelecimento,
  FormatadorDeDuracao,
  formatarPreco,
} from "../src/apresentacao/formatadores";
import { HorariosParaSelecao } from "../src/apresentacao/horarios-para-selecao";
import { montarIconeSvg, montarManifesto } from "../src/apresentacao/manifesto-pwa";
import { SelecaoDeAgendamento } from "../src/apresentacao/selecao-de-agendamento";
import { TelefoneBrasileiro } from "../src/apresentacao/telefone-brasileiro";
import { VocabularioDoEstabelecimento } from "../src/apresentacao/vocabulario-do-estabelecimento";
import { Mensagens } from "../src/mensagens/mensagens";
import { estabelecimentoDoMock } from "./suporte/fetch-do-mock";

const mensagensPadrao = new Mensagens(VocabularioDoEstabelecimento.criar({}));

describe("formatação", () => {
  it("formata centavos inteiros como reais sem passar por ponto flutuante", () => {
    expect(formatarPreco(4500)).toBe("R$ 45,00");
    expect(formatarPreco(5)).toBe("R$ 0,05");
    expect(formatarPreco(123456)).toBe("R$ 1.234,56");
  });

  it("formata duração em minutos, horas e horas com minutos", () => {
    const f = new FormatadorDeDuracao(mensagensPadrao);
    expect([f.formatar(30), f.formatar(120), f.formatar(90)]).toEqual([
      "30 min",
      "2 h",
      "1 h 30 min",
    ]);
  });

  it("converte instantes UTC para o fuso do estabelecimento, inclusive na virada do dia", () => {
    const calendario = new CalendarioDoEstabelecimento("America/Sao_Paulo");
    expect(calendario.hora("2026-10-27T13:00:00.000Z")).toBe("10:00");
    expect(calendario.diaCivil("2026-10-27T02:30:00.000Z")).toBe("2026-10-26");
    expect(calendario.proximosDias(new Date("2026-10-27T02:30:00.000Z"), 3)).toEqual([
      "2026-10-26",
      "2026-10-27",
      "2026-10-28",
    ]);
  });
});

describe("entradas do cliente", () => {
  it("aceita celular com DDD e mascara o número", () => {
    expect(TelefoneBrasileiro.criar("(11) 91234-4321")?.mascarado()).toBe("(11) ****-4321");
    expect(TelefoneBrasileiro.criar("12345")).toBeNull();
  });

  it("normaliza o código de acesso e recusa formato inválido", () => {
    expect(CodigoDeAcesso.criar("  Studio-Aurora ")?.valor).toBe("studio-aurora");
    expect(CodigoDeAcesso.criar("a b")).toBeNull();
  });

  it("só volta para caminhos internos do estabelecimento depois do login", () => {
    expect(destinoSeguro("x-y", "/x-y/agendar?servico=1")).toBe("/x-y/agendar?servico=1");
    expect(destinoSeguro("x-y", "https://malicioso.test")).toBe("/x-y");
    expect(destinoSeguro("x-y", "//malicioso.test")).toBe("/x-y");
    expect(destinoSeguro("x-y", "/outro/agendar")).toBe("/x-y");
    expect(destinoSeguro("x-y", null)).toBe("/x-y");
  });
});

describe("SelecaoDeAgendamento", () => {
  it("vai e volta pela URL sem perder campos", () => {
    const original = SelecaoDeAgendamento.vazia()
      .comServico("s1")
      .comDia("2026-10-27")
      .comHorario("2026-10-27T13:00:00.000Z", "p1");
    const volta = SelecaoDeAgendamento.deConsulta(original.paraConsulta());
    expect(volta).toEqual(original);
    expect(volta.estaCompleta()).toBe(true);
  });

  it("trocar serviço, profissional ou dia descarta o horário já escolhido", () => {
    const completa = SelecaoDeAgendamento.vazia().comServico("s1").comHorario("i", "p1");
    expect(completa.comServico("s2").inicio).toBeNull();
    expect(completa.comProfissional("p2").estaCompleta()).toBe(false);
    expect(completa.comDia("2026-10-28").inicio).toBeNull();
  });
});

describe("HorariosParaSelecao", () => {
  it("mostra cada instante uma vez e lembra quem atende", () => {
    const calendario = new CalendarioDoEstabelecimento("America/Sao_Paulo");
    const itens = [
      { profissionalId: "a", inicio: "2026-10-27T12:00:00.000Z", fim: "2026-10-27T12:30:00.000Z" },
      { profissionalId: "b", inicio: "2026-10-27T12:00:00.000Z", fim: "2026-10-27T12:30:00.000Z" },
      { profissionalId: "b", inicio: "2026-10-27T12:30:00.000Z", fim: "2026-10-27T13:00:00.000Z" },
    ];
    const selecao = new HorariosParaSelecao(itens, calendario);
    expect(selecao.opcoes().map((o) => o.rotulo)).toEqual(["09:00", "09:30"]);
    expect(selecao.profissionalDe("2026-10-27T12:00:00.000Z")).toBe("a");
  });
});

describe("vocabulário e marca", () => {
  it("usa o vocabulário da vertical e o plural do tema", () => {
    const aurora = EstabelecimentoNaTela.criar(
      estabelecimentoDoMock("studio-aurora").estabelecimento,
    );
    expect(aurora.vocabulario.singular("profissional")).toBe("cabeleireira");
    expect(aurora.vocabulario.plural("servico")).toBe("procedimentos");
  });

  it("monta o manifesto e o ícone com a marca do tema", () => {
    const aurora = EstabelecimentoNaTela.criar(
      estabelecimentoDoMock("studio-aurora").estabelecimento,
    );
    const manifesto = montarManifesto(aurora);
    expect(manifesto).toMatchObject({
      name: "Studio Aurora",
      theme_color: "#7a2e5c",
      start_url: expect.stringContaining("/studio-aurora"),
      scope: "/studio-aurora/",
      display: "standalone",
    });
    expect(manifesto.icons.length).toBeGreaterThan(0);
    expect(montarIconeSvg(aurora)).toContain('fill="#7a2e5c"');
  });

  it("sem tema publicado cai no padrão da vertical", () => {
    const base = estabelecimentoDoMock("barbearia-do-ze").estabelecimento;
    const sem = EstabelecimentoNaTela.criar({ ...base, tema: null });
    expect(sem.variaveisCss["--cor-primaria"]).toMatch(/^#[0-9a-f]{6}$/i);
  });
});
