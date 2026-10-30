import { describe, expect, it } from "vitest";
import {
  EstabelecimentoId,
  EstabelecimentoNaoEncontradoError,
  Slug,
  type EstabelecimentoPublico,
  type EstabelecimentoPublicoRepositorio,
} from "@marquei/dominio";
import { ListarServicos } from "../../src/modulos/catalogo/aplicacao/listar-servicos";
import { ObterEstabelecimentoPorSlug } from "../../src/modulos/catalogo/aplicacao/obter-estabelecimento-por-slug";
import {
  ESTAB_A,
  ESTAB_B,
  SERVICO_BARBA,
  SERVICO_CORTE,
  SERVICO_DE_B,
  montarCenario,
  uuid,
} from "./suporte";

describe("ListarServicos", () => {
  it("devolve so os servicos ativos do estabelecimento da sessao", async () => {
    const { servicos } = montarCenario();
    const a = await new ListarServicos({ servicos }).execute({ estabelecimentoId: ESTAB_A });
    const b = await new ListarServicos({ servicos }).execute({ estabelecimentoId: ESTAB_B });
    expect(a.map((s) => s.id.valor).sort()).toEqual(
      [SERVICO_CORTE.valor, SERVICO_BARBA.valor].sort(),
    );
    expect(b.map((s) => s.id.valor)).toEqual([SERVICO_DE_B.valor]);
  });
});

describe("ObterEstabelecimentoPorSlug", () => {
  const publico: EstabelecimentoPublico = {
    id: EstabelecimentoId.de(uuid(1)),
    slug: Slug.de("barbearia-a"),
    nome: "Barbearia A",
    vertical: "barbearia",
    vocabulario: { profissional: "barbeiro" },
    fusoHorario: "America/Sao_Paulo",
    tema: null,
  };
  const repositorio: EstabelecimentoPublicoRepositorio = {
    obterPorSlug: (slug) => Promise.resolve(slug.igual(publico.slug) ? publico : null),
  };

  it("devolve a vitrine publica do slug", async () => {
    const r = await new ObterEstabelecimentoPorSlug({ estabelecimentos: repositorio }).execute({
      slug: Slug.de("barbearia-a"),
    });
    expect(r).toBe(publico);
  });

  it("slug desconhecido falha com erro de dominio", async () => {
    await expect(
      new ObterEstabelecimentoPorSlug({ estabelecimentos: repositorio }).execute({
        slug: Slug.de("nao-existe"),
      }),
    ).rejects.toBeInstanceOf(EstabelecimentoNaoEncontradoError);
  });
});
