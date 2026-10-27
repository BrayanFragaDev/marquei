import { EstabelecimentoId, Instante } from "@marquei/dominio";
import { describe, expect, it } from "vitest";
import {
  LeitorDeTemas,
  TemaRepositorioEmMemoria,
  TemaVersionado,
  VerticalDoEstabelecimentoFixa,
  VersaoDeTemaInvalidaError,
  temaPadraoDaVertical,
} from "../src";

const A = EstabelecimentoId.de("00000000-0000-4000-8000-0000000000a1");
const B = EstabelecimentoId.de("00000000-0000-4000-8000-0000000000b2");
const AGORA = Instante.deIso("2030-01-10T12:00:00Z");

function cenario() {
  const temas = new TemaRepositorioEmMemoria();
  const verticais = new VerticalDoEstabelecimentoFixa()
    .comVertical(A, "barbearia")
    .comVertical(B, "manicure");
  return { temas, leitor: new LeitorDeTemas(temas, verticais) };
}

describe("leitura do tema", () => {
  it("cliente ve o padrao da vertical enquanto nada foi publicado, mesmo havendo rascunho", async () => {
    const { temas, leitor } = cenario();
    await temas.salvarRascunho(A, temaPadraoDaVertical("outro").comRaio("reto"), AGORA);
    const lido = await leitor.publicadoOuPadrao(A);
    expect(lido.origem).toBe("padrao");
    expect(lido.versionado.ehPadrao).toBe(true);
    expect(lido.versionado.tema.paraDados()).toEqual(temaPadraoDaVertical("barbearia").paraDados());
  });

  it("cliente ve o publicado, nunca o rascunho mais novo", async () => {
    const { temas, leitor } = cenario();
    const publicado = temaPadraoDaVertical("outro").comRaio("suave");
    await temas.publicar(A, publicado, AGORA);
    await temas.salvarRascunho(A, publicado.comRaio("reto"), AGORA);
    const lido = await leitor.publicadoOuPadrao(A);
    expect(lido.origem).toBe("publicado");
    expect(lido.versionado.tema.raio).toBe("suave");
  });

  it("o editor parte do rascunho, depois do publicado, depois do padrao", async () => {
    const { temas, leitor } = cenario();
    expect((await leitor.paraEdicao(A)).origem).toBe("padrao");
    await temas.publicar(A, temaPadraoDaVertical("outro"), AGORA);
    expect((await leitor.paraEdicao(A)).origem).toBe("publicado");
    await temas.salvarRascunho(A, temaPadraoDaVertical("outro"), AGORA);
    expect((await leitor.paraEdicao(A)).origem).toBe("rascunho");
  });

  it("cada estabelecimento recebe o padrao da propria vertical e os dados nao se misturam", async () => {
    const { temas, leitor } = cenario();
    await temas.salvarRascunho(A, temaPadraoDaVertical("outro"), AGORA);
    expect((await leitor.paraEdicao(B)).origem).toBe("padrao");
    expect((await leitor.paraEdicao(B)).versionado.tema.paraDados()).toEqual(
      temaPadraoDaVertical("manicure").paraDados(),
    );
  });
});

describe("tema versionado", () => {
  it("a versao do repositorio em memoria cresce a cada gravacao do mesmo estado", async () => {
    const { temas } = cenario();
    const um = await temas.salvarRascunho(A, temaPadraoDaVertical("outro"), AGORA);
    const dois = await temas.salvarRascunho(A, temaPadraoDaVertical("outro"), AGORA);
    expect([um.versao, dois.versao]).toEqual([1, 2]);
  });

  it("recusa versao negativa ou fracionaria", () => {
    const tema = temaPadraoDaVertical("outro");
    for (const versao of [-1, 1.5, Number.NaN]) {
      expect(() => TemaVersionado.reconstituir({ tema, versao, atualizadoEm: null })).toThrow(
        VersaoDeTemaInvalidaError,
      );
    }
  });
});
