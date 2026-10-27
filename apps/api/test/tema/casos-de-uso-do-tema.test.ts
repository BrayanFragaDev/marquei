import { Papel } from "@marquei/dominio";
import {
  AutorDaAlteracao,
  ContrasteInsuficienteError,
  CorHex,
  RascunhoDeTemaNaoEncontradoError,
  SemPermissaoParaAlterarTemaError,
  temaPadraoDaVertical,
} from "@marquei/design-tokens";
import { describe, expect, it } from "vitest";
import { TENANT_A, TENANT_B, autorDe, montarCenario, sessaoDe } from "./suporte";

const claro = temaPadraoDaVertical("outro");
const comTextoSuaveIlegivel = claro.comCores(
  claro.cores.comCor("textoSuave", CorHex.criar("#dddddd")),
);

describe("salvar rascunho do tema", () => {
  it("grava o rascunho, devolve a versao 1 e emite tema_rascunho_salvo com os campos alterados", async () => {
    const c = montarCenario();
    const novo = claro.comRaio("reto");
    const salvo = await c.salvar.execute({ autor: autorDe(), tema: novo });
    expect(salvo.versao).toBe(1);
    expect((await c.temas.obterRascunho(TENANT_A))?.tema.raio).toBe("reto");
    const [evento] = c.eventos.publicados;
    expect(evento?.nome).toBe("tema_rascunho_salvo");
    expect(evento?.estabelecimentoId.igual(TENANT_A)).toBe(true);
    expect(evento?.propriedades["versao"]).toBe(1);
    expect(String(evento?.propriedades["campos_alterados"])).toContain("raio");
  });

  it("a segunda gravacao compara com o rascunho anterior e sobe a versao", async () => {
    const c = montarCenario();
    await c.salvar.execute({ autor: autorDe(), tema: claro });
    const salvo = await c.salvar.execute({
      autor: autorDe(),
      tema: claro.comDensidade("compacta"),
    });
    expect(salvo.versao).toBe(2);
    expect(c.eventos.publicados[1]?.propriedades["campos_alterados"]).toBe("densidade");
  });

  it("aceita rascunho com contraste ruim (so a publicacao exige AA)", async () => {
    const c = montarCenario();
    await expect(
      c.salvar.execute({ autor: autorDe(), tema: comTextoSuaveIlegivel }),
    ).resolves.toBeDefined();
  });

  it("nunca altera o tema publicado, que o cliente continua vendo", async () => {
    const c = montarCenario();
    await c.temas.publicar(TENANT_A, claro, sessaoAgora());
    await c.salvar.execute({ autor: autorDe(), tema: claro.comRaio("reto") });
    const visto = await c.obterPublicado.execute({ estabelecimentoId: TENANT_A });
    expect(visto.versionado.tema.raio).toBe(claro.raio);
    expect(visto.origem).toBe("publicado");
  });
});

describe("permissao para alterar o tema", () => {
  it.each([Papel.Profissional, Papel.ClienteFinal])("%s nao vira autor da alteracao", (papel) => {
    expect(() => AutorDaAlteracao.deSessao(sessaoDe(papel))).toThrow(
      SemPermissaoParaAlterarTemaError,
    );
  });
});

describe("publicar tema", () => {
  it("copia o rascunho para o publicado e emite tema_publicado com versao e contraste minimo", async () => {
    const c = montarCenario();
    await c.salvar.execute({ autor: autorDe(), tema: claro.comRaio("reto") });
    const publicado = await c.publicar.execute({ autor: autorDe() });
    expect(publicado.versao).toBe(1);
    expect((await c.temas.obterPublicado(TENANT_A))?.tema.paraDados()).toEqual(
      claro.comRaio("reto").paraDados(),
    );
    const evento = c.eventos.publicados.at(-1);
    expect(evento?.nome).toBe("tema_publicado");
    expect(evento?.propriedades["versao"]).toBe(1);
    expect(Number(evento?.propriedades["contraste_minimo"])).toBeGreaterThanOrEqual(3);
  });

  it("contraste abaixo de AA e recusado com erro de dominio e sugestao, sem alterar o publicado nem emitir evento", async () => {
    const c = montarCenario();
    await c.salvar.execute({ autor: autorDe(), tema: claro });
    await c.publicar.execute({ autor: autorDe() });
    await c.salvar.execute({ autor: autorDe(), tema: comTextoSuaveIlegivel });
    const eventosAntes = c.eventos.publicados.length;

    const erro = await c.publicar.execute({ autor: autorDe() }).catch((e: unknown) => e);

    expect(erro).toBeInstanceOf(ContrasteInsuficienteError);
    expect(erro).toMatchObject({ codigo: "contraste_insuficiente" });
    if (erro instanceof ContrasteInsuficienteError) {
      expect(erro.problemas[0]?.corSugerida.valor).toMatch(/^#[0-9a-f]{6}$/);
    }
    expect((await c.temas.obterPublicado(TENANT_A))?.tema.paraDados()).toEqual(claro.paraDados());
    expect((await c.temas.obterPublicado(TENANT_A))?.versao).toBe(1);
    expect(c.eventos.publicados).toHaveLength(eventosAntes);
  });

  it("sem rascunho salvo nao ha o que publicar", async () => {
    const c = montarCenario();
    await expect(c.publicar.execute({ autor: autorDe() })).rejects.toBeInstanceOf(
      RascunhoDeTemaNaoEncontradoError,
    );
  });

  it("publicar de novo sobe a versao publicada", async () => {
    const c = montarCenario();
    await c.salvar.execute({ autor: autorDe(), tema: claro });
    await c.publicar.execute({ autor: autorDe() });
    expect((await c.publicar.execute({ autor: autorDe() })).versao).toBe(2);
  });

  it("o estabelecimento B nao publica o rascunho do A: publica so o proprio", async () => {
    const c = montarCenario();
    await c.salvar.execute({ autor: autorDe(TENANT_A), tema: claro.comRaio("reto") });
    await expect(c.publicar.execute({ autor: autorDe(TENANT_B) })).rejects.toBeInstanceOf(
      RascunhoDeTemaNaoEncontradoError,
    );
    expect(await c.temas.obterPublicado(TENANT_A)).toBeNull();
    expect(await c.temas.obterPublicado(TENANT_B)).toBeNull();
  });
});

describe("leitura e restauracao do padrao", () => {
  it("cliente sem tema publicado ve o padrao da vertical, nunca o rascunho", async () => {
    const c = montarCenario();
    await c.salvar.execute({ autor: autorDe(), tema: claro.comRaio("reto") });
    const visto = await c.obterPublicado.execute({ estabelecimentoId: TENANT_A });
    expect(visto.origem).toBe("padrao");
    expect(visto.versionado.tema.paraDados()).toEqual(
      temaPadraoDaVertical("barbearia").paraDados(),
    );
  });

  it("o editor recebe o rascunho; sem ele, o publicado; sem ambos, o padrao da vertical do tenant", async () => {
    const c = montarCenario();
    expect(
      (await c.obterRascunho.execute({ autor: autorDe(TENANT_B) })).versionado.tema.paraDados(),
    ).toEqual(temaPadraoDaVertical("manicure").paraDados());
    await c.salvar.execute({ autor: autorDe(), tema: claro });
    expect((await c.obterRascunho.execute({ autor: autorDe() })).origem).toBe("rascunho");
    expect((await c.obterRascunho.execute({ autor: autorDe(TENANT_B) })).origem).toBe("padrao");
  });

  it("restaurar volta o rascunho ao padrao da vertical, emite evento e preserva o publicado", async () => {
    const c = montarCenario();
    await c.temas.publicar(TENANT_A, claro, sessaoAgora());
    await c.salvar.execute({ autor: autorDe(), tema: claro.comRaio("reto") });
    const restaurado = await c.restaurar.execute({ autor: autorDe() });
    expect(restaurado.tema.paraDados()).toEqual(temaPadraoDaVertical("barbearia").paraDados());
    expect(c.eventos.nomes()).toEqual(["tema_rascunho_salvo", "tema_rascunho_salvo"]);
    expect((await c.temas.obterPublicado(TENANT_A))?.tema.paraDados()).toEqual(claro.paraDados());
  });
});

function sessaoAgora() {
  return sessaoDe(Papel.Dono).emitidaEm;
}
