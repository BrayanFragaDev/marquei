import { describe, expect, it } from "vitest";
import {
  ContrasteInsuficienteError,
  CorHex,
  RequisitoDeContraste,
  ValidadorDeContraste,
  VERTICAIS,
  temaPadraoDaVertical,
} from "../src";

const branco = CorHex.criar("#ffffff");
const preto = CorHex.criar("#000000");

describe("razao de contraste", () => {
  it("preto sobre branco vale 21 para 1", () => {
    expect(preto.razaoDeContraste(branco)).toBeCloseTo(21, 5);
  });

  it("e simetrica: a ordem das cores nao muda a razao", () => {
    const cinza = CorHex.criar("#777777");
    expect(cinza.razaoDeContraste(branco)).toBe(branco.razaoDeContraste(cinza));
  });

  it("cor igual a ela mesma vale 1 para 1", () => {
    expect(branco.razaoDeContraste(branco)).toBe(1);
  });

  it("cinza claro sobre branco reprova no minimo de texto normal", () => {
    const razao = CorHex.criar("#cccccc").razaoDeContraste(branco);
    expect(RequisitoDeContraste.TEXTO_NORMAL.atendidoPor(razao)).toBe(false);
  });

  it("#767676 sobre branco passa em texto normal e #777777 reprova (fronteira real de 4,5)", () => {
    const passa = CorHex.criar("#767676").razaoDeContraste(branco);
    const reprova = CorHex.criar("#777777").razaoDeContraste(branco);
    expect(RequisitoDeContraste.TEXTO_NORMAL.atendidoPor(passa)).toBe(true);
    expect(RequisitoDeContraste.TEXTO_NORMAL.atendidoPor(reprova)).toBe(false);
  });

  it("#949494 sobre branco passa em 3 para 1 e #959595 reprova (fronteira real de 3)", () => {
    const passa = CorHex.criar("#949494").razaoDeContraste(branco);
    const reprova = CorHex.criar("#959595").razaoDeContraste(branco);
    expect(RequisitoDeContraste.TEXTO_GRANDE_OU_COMPONENTE.atendidoPor(passa)).toBe(true);
    expect(RequisitoDeContraste.TEXTO_GRANDE_OU_COMPONENTE.atendidoPor(reprova)).toBe(false);
  });

  it("os limiares valem exatamente 4,5 e 3 (igual passa, abaixo reprova)", () => {
    expect(RequisitoDeContraste.TEXTO_NORMAL.atendidoPor(4.5)).toBe(true);
    expect(RequisitoDeContraste.TEXTO_NORMAL.atendidoPor(4.4999)).toBe(false);
    expect(RequisitoDeContraste.TEXTO_GRANDE_OU_COMPONENTE.atendidoPor(3)).toBe(true);
    expect(RequisitoDeContraste.TEXTO_GRANDE_OU_COMPONENTE.atendidoPor(2.9999)).toBe(false);
  });
});

describe("correcao sugerida", () => {
  const validador = new ValidadorDeContraste();
  const base = temaPadraoDaVertical("outro");

  it("a cor sugerida realmente atinge a razao exigida", () => {
    const ruim = base
      .comCores(
        base.cores
          .comCor("texto", CorHex.criar("#bbbbbb"))
          .comCor("primaria", CorHex.criar("#ffe9a0")),
      )
      .comCorPrimaria(CorHex.criar("#ffe9a0"));
    const problemas = validador.validar(ruim);
    expect(problemas.length).toBeGreaterThan(0);
    for (const p of problemas) {
      const fixa = p.campoAjustado === p.primeiroPlano ? p.fundo : p.primeiroPlano;
      const razao = p.corSugerida.razaoDeContraste(ruim.cores.obter(fixa));
      expect(razao).toBeGreaterThanOrEqual(p.razaoExigida);
    }
  });

  it("corrigir aplica as sugestoes em sequencia e deixa o tema aprovado", () => {
    const ruim = base.comCores(
      base.cores
        .comCor("texto", CorHex.criar("#bbbbbb"))
        .comCor("textoSobrePrimaria", CorHex.criar("#aaaaaa")),
    );
    expect(validador.aprova(ruim)).toBe(false);
    const corrigido = validador.corrigir(ruim);
    expect(validador.validar(corrigido).map((p) => p.mensagem())).toEqual([]);
    expect(corrigido.cores.obter("fundo").valor).toBe(ruim.cores.obter("fundo").valor);
  });

  it("e deterministica e preserva o matiz da cor original", () => {
    const original = CorHex.criar("#ffe9a0");
    const a = original.comContrasteMinimoSobre(branco, 3);
    const b = original.comContrasteMinimoSobre(branco, 3);
    expect(a.valor).toBe(b.valor);
    expect(a.razaoDeContraste(branco)).toBeGreaterThanOrEqual(3);
    expect(a.luminosidade()).toBeLessThan(original.luminosidade());
  });

  it("nao altera uma cor que ja atende", () => {
    expect(preto.comContrasteMinimoSobre(branco, 4.5)).toBe(preto);
  });

  it("em fundo escuro a sugestao clareia o texto", () => {
    const escuro = CorHex.criar("#14161a");
    const sugerida = CorHex.criar("#444444").comContrasteMinimoSobre(escuro, 4.5);
    expect(sugerida.luminosidade()).toBeGreaterThan(CorHex.criar("#444444").luminosidade());
    expect(sugerida.razaoDeContraste(escuro)).toBeGreaterThanOrEqual(4.5);
  });
});

describe("publicacao", () => {
  const validador = new ValidadorDeContraste();

  it("rascunho com contraste ruim pode existir, mas publicar falha com erro tipado e sugestoes", () => {
    const base = temaPadraoDaVertical("outro");
    const rascunho = base.comCores(base.cores.comCor("textoSuave", CorHex.criar("#dddddd")));
    expect(() => rascunho.validarParaPublicacao(validador)).toThrow(ContrasteInsuficienteError);
    try {
      rascunho.validarParaPublicacao(validador);
    } catch (erro) {
      expect(erro).toBeInstanceOf(ContrasteInsuficienteError);
      if (erro instanceof ContrasteInsuficienteError) {
        expect(erro.codigo).toBe("contraste_insuficiente");
        expect(erro.problemas[0]?.corSugerida.valor).toMatch(/^#[0-9a-f]{6}$/);
        expect(erro.message).toContain("Sugestao");
      }
    }
  });

  it.each(VERTICAIS)("o tema padrao da vertical %s passa em AA", (vertical) => {
    const tema = temaPadraoDaVertical(vertical);
    expect(validador.validar(tema).map((p) => p.mensagem())).toEqual([]);
    expect(() => tema.validarParaPublicacao(validador)).not.toThrow();
  });

  it("cada vertical tem paleta e vocabulario proprios", () => {
    const temas = VERTICAIS.map((v) => temaPadraoDaVertical(v));
    expect(new Set(temas.map((t) => t.cores.obter("primaria").valor)).size).toBe(VERTICAIS.length);
    expect(new Set(temas.map((t) => t.vocabulario.termo("profissional"))).size).toBe(
      VERTICAIS.length,
    );
  });
});
