import { describe, expect, it } from "vitest";
import {
  CorHex,
  FamiliaTipografica,
  IDS_DE_CABECALHO,
  IDS_DE_CARTAO_DE_SERVICO,
  IDS_DE_DENSIDADE,
  IDS_DE_FAMILIA,
  IDS_DE_RAIO,
  ValidadorDeContraste,
  VERTICAIS,
  catalogoDeOpcoes,
  temaPadraoDaVertical,
  verticalOuPadrao,
} from "../src";

const base = temaPadraoDaVertical("barbearia");

describe("campos alterados entre dois temas", () => {
  it("sem tema anterior, todos os campos contam como alterados", () => {
    const campos = base.camposAlteradosEm(null);
    expect(campos).toContain("cores.primaria");
    expect(campos).toContain("raio");
    expect(campos).toContain("textos.boasVindas");
    expect(campos).toContain("vocabulario.profissional.singular");
  });

  it("tema identico ao anterior nao altera campo nenhum", () => {
    expect(base.camposAlteradosEm(base)).toEqual([]);
  });

  it("lista apenas os campos que mudaram, em caminho pontuado e ordem estavel", () => {
    const outroRaio = base.raio === "reto" ? "suave" : "reto";
    const novo = base.comRaio(outroRaio).comCorPrimaria(CorHex.criar("#112233"));
    expect(novo.camposAlteradosEm(base)).toEqual(["cores.primaria", "raio"]);
  });

  it("detecta troca de familia, densidade e presets", () => {
    const novo = base
      .comFamilia(FamiliaTipografica.de("inter"))
      .comDensidade("compacta")
      .comCabecalho("capa")
      .comCartaoDeServico("grade");
    expect(
      novo.camposAlteradosEm(temaPadraoDaVertical("outro").comCabecalho("simples")).length,
    ).toBeGreaterThan(0);
    expect(novo.camposAlteradosEm(novo.comDensidade("confortavel"))).toEqual(["densidade"]);
  });
});

describe("menor razao de contraste", () => {
  const validador = new ValidadorDeContraste();

  it.each(VERTICAIS)("o tema padrao %s tem menor razao a partir de 3 (AA de componente)", (v) => {
    expect(validador.menorRazao(temaPadraoDaVertical(v))).toBeGreaterThanOrEqual(3);
  });

  it("reflete o pior par: texto suave quase igual ao fundo derruba a menor razao", () => {
    const claro = temaPadraoDaVertical("outro");
    const ruim = claro.comCores(claro.cores.comCor("textoSuave", CorHex.criar("#dddddd")));
    expect(validador.menorRazao(ruim)).toBeLessThan(1.5);
    expect(validador.menorRazao(ruim)).toBeLessThan(validador.menorRazao(claro));
  });
});

describe("catalogo de opcoes curadas", () => {
  const catalogo = catalogoDeOpcoes();

  it("expoe exatamente as opcoes aceitas pelo esquema", () => {
    expect(catalogo.familias.map((f) => f.id)).toEqual([...IDS_DE_FAMILIA]);
    expect(catalogo.raios.map((r) => r.id)).toEqual([...IDS_DE_RAIO]);
    expect(catalogo.densidades.map((d) => d.id)).toEqual([...IDS_DE_DENSIDADE]);
    expect(catalogo.cabecalhos).toEqual([...IDS_DE_CABECALHO]);
    expect(catalogo.cartoesDeServico).toEqual([...IDS_DE_CARTAO_DE_SERVICO]);
    expect(catalogo.verticais).toEqual([...VERTICAIS]);
  });

  it("cada familia traz nome e pilha de fallback; cada raio traz sua escala em pixels", () => {
    const inter = catalogo.familias.find((f) => f.id === "inter");
    expect(inter).toMatchObject({ nome: "Inter" });
    expect(inter?.pilhaCss).toContain("sans-serif");
    expect(catalogo.raios.find((r) => r.id === "reto")?.escala.cartao).toBe(0);
  });

  it("informa os campos de cor editaveis e os requisitos minimos de contraste", () => {
    expect(catalogo.camposDeCor).toContain("primaria");
    expect(catalogo.contrasteMinimo).toEqual({ textoNormal: 4.5, componente: 3 });
  });
});

describe("vertical do estabelecimento", () => {
  it("reconhece verticais conhecidas e cai em 'outro' para o resto", () => {
    expect(verticalOuPadrao("manicure")).toBe("manicure");
    expect(verticalOuPadrao("pet-shop")).toBe("outro");
  });
});
