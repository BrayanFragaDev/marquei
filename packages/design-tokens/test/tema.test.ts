import { describe, expect, it } from "vitest";
import {
  CorHex,
  FamiliaTipografica,
  IDS_DE_CABECALHO,
  IDS_DE_CARTAO_DE_SERVICO,
  IDS_DE_DENSIDADE,
  IDS_DE_FAMILIA,
  IDS_DE_RAIO,
  TemaDoEstabelecimento,
  TemaInvalidoError,
  CorInvalidaError,
  paraVariaveisCss,
  temaPadraoDaVertical,
} from "../src";

const base = temaPadraoDaVertical("outro");

describe("tema do estabelecimento", () => {
  it("e imutavel: alterar devolve nova instancia e preserva a original", () => {
    const novo = base.comRaio("reto").comCorPrimaria(CorHex.criar("#112233"));
    expect(novo).not.toBe(base);
    expect(base.raio).toBe("suave");
    expect(base.cores.obter("primaria").valor).toBe("#2457c5");
    expect(novo.raio).toBe("reto");
    expect(novo.cores.obter("primaria").valor).toBe("#112233");
  });

  it("ida e volta: paraDados e reconstituir reproduzem o mesmo tema", () => {
    expect(TemaDoEstabelecimento.reconstituir(base.paraDados()).paraDados()).toEqual(
      base.paraDados(),
    );
  });

  it("normaliza cores para minusculas", () => {
    const dados = { ...base.paraDados(), cores: { ...base.paraDados().cores, fundo: "#F7F8FA" } };
    expect(TemaDoEstabelecimento.criar(dados).cores.obter("fundo").valor).toBe("#f7f8fa");
  });

  it("vocabulario troca o termo sem mutar o anterior", () => {
    const novo = base.vocabulario.comTermo("profissional", {
      singular: "barbeiro",
      plural: "barbeiros",
    });
    expect(novo.termo("profissional", "plural")).toBe("barbeiros");
    expect(base.vocabulario.termo("profissional")).toBe("profissional");
  });

  it("textos validam tamanho ao alterar", () => {
    expect(() => base.textos.comBoasVindas("x".repeat(121))).toThrow(TemaInvalidoError);
    expect(base.textos.comBoasVindas("Oi!").boasVindas).toBe("Oi!");
  });
});

describe("rejeicao de entrada invalida", () => {
  const dados = base.paraDados();

  it("cor mal formada", () => {
    for (const ruim of ["azul", "#fff", "#12345g", "123456", "#1234567"]) {
      const entrada = { ...dados, cores: { ...dados.cores, primaria: ruim } };
      expect(() => TemaDoEstabelecimento.criar(entrada)).toThrow(TemaInvalidoError);
    }
    expect(() => CorHex.criar("azul")).toThrow(CorInvalidaError);
  });

  it("opcao fora da lista curada (fonte, raio, densidade, presets)", () => {
    const invalidos = [
      { familia: "comic-sans" },
      { raio: "10px" },
      { densidade: "enorme" },
      { cabecalho: "gigante" },
      { cartaoDeServico: "mosaico" },
    ];
    for (const parcial of invalidos) {
      expect(() => TemaDoEstabelecimento.criar({ ...dados, ...parcial })).toThrow(
        TemaInvalidoError,
      );
    }
  });

  it("campo desconhecido e campo faltando", () => {
    expect(() => TemaDoEstabelecimento.criar({ ...dados, fonteLivre: "Arial" })).toThrow(
      TemaInvalidoError,
    );
    const semTextos = { cores: dados.cores, familia: dados.familia };
    expect(() => TemaDoEstabelecimento.criar(semTextos)).toThrow(TemaInvalidoError);
    expect(() => TemaDoEstabelecimento.criar(null)).toThrow(TemaInvalidoError);
  });

  it("erro informa codigo estavel e caminho do campo", () => {
    try {
      TemaDoEstabelecimento.criar({ ...dados, raio: "x" });
      expect.unreachable();
    } catch (erro) {
      expect(erro).toBeInstanceOf(TemaInvalidoError);
      if (erro instanceof TemaInvalidoError) {
        expect(erro.codigo).toBe("tema_invalido");
        expect(erro.problemas[0]?.caminho).toBe("raio");
      }
    }
  });
});

describe("geradores", () => {
  it("combinatorio: cabecalho x cartao x familia x raio x densidade geram tema e CSS", () => {
    let total = 0;
    for (const cabecalho of IDS_DE_CABECALHO)
      for (const cartao of IDS_DE_CARTAO_DE_SERVICO)
        for (const familia of IDS_DE_FAMILIA)
          for (const raio of IDS_DE_RAIO)
            for (const densidade of IDS_DE_DENSIDADE) {
              const tema = TemaDoEstabelecimento.criar(
                base
                  .comCabecalho(cabecalho)
                  .comCartaoDeServico(cartao)
                  .comFamilia(FamiliaTipografica.de(familia))
                  .comRaio(raio)
                  .comDensidade(densidade)
                  .paraDados(),
              );
              const css = paraVariaveisCss(tema);
              expect(css.css).toContain(`--preset-cabecalho: ${cabecalho};`);
              expect(css.variaveis["--fonte-familia"]).toContain(
                FamiliaTipografica.de(familia).nome,
              );
              expect(css.css).toContain(`--preset-cartao-servico: ${cartao};`);
              total++;
            }
    expect(total).toBe(3 * 3 * 5 * 3 * 2);
  });

  it("toda familia tem fallback generico na pilha CSS", () => {
    for (const familia of FamiliaTipografica.todas()) {
      expect(familia.pilhaCss()).toMatch(/(sans-serif|serif)$/);
    }
    expect(IDS_DE_FAMILIA.length).toBeGreaterThanOrEqual(4);
    expect(IDS_DE_FAMILIA.length).toBeLessThanOrEqual(6);
  });

  it("snapshot do CSS de dois temas diferentes", () => {
    const barbearia = temaPadraoDaVertical("barbearia");
    const estetica = temaPadraoDaVertical("estetica");
    expect(paraVariaveisCss(barbearia).css).toMatchSnapshot("css-barbearia");
    expect(paraVariaveisCss(estetica).css).toMatchSnapshot("css-estetica");
  });
});
