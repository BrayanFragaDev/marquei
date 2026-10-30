import { describe, expect, it } from "vitest";
import { VocabularioDoEstabelecimento } from "../src/apresentacao/vocabulario-do-estabelecimento";
import { CATALOGO_PT_BR } from "../src/mensagens/catalogo-pt-br";
import { Mensagens } from "../src/mensagens/mensagens";

const barbearia = new Mensagens(
  VocabularioDoEstabelecimento.criar({ profissional: "barbeiro", servico: "serviço" }),
);

describe("catálogo de mensagens", () => {
  it("aplica o vocabulário do estabelecimento no singular, plural e capitalizado", () => {
    expect(barbearia.t("navegacao.profissionais")).toBe("Barbeiros");
    expect(barbearia.t("navegacao.modoProfissional")).toBe("Sou barbeiro");
    expect(barbearia.t("vitrine.verProfissionais")).toBe("Conhecer barbeiros");
  });

  it("interpola parâmetros e preserva marcadores desconhecidos", () => {
    expect(barbearia.t("duracao.minutos", { minutos: 45 })).toBe("45 min");
    expect(barbearia.t("marca.logoDe", { nome: "Zé" })).toBe("Logo de Zé");
  });

  it("traduz código de erro da API e cai no genérico quando desconhecido", () => {
    expect(barbearia.paraErro("horario_indisponivel")).toContain("ocupado");
    expect(barbearia.paraErro("codigo_que_nao_existe")).toBe(barbearia.t("erro.generico"));
  });

  it("todo marcador do catálogo é resolvível: vocabulário ou parâmetro conhecido", () => {
    const conhecidos = new Set([
      "nome",
      "minutos",
      "horas",
      "numero",
      "telefone",
      "codigo",
      "servico",
      "dia",
      "hora",
      "preco",
    ]);
    for (const texto of Object.values(CATALOGO_PT_BR)) {
      for (const [, marcador] of texto.matchAll(/\{(\w+)\}/g)) {
        const base = (marcador ?? "").replace(/_pl$/, "").toLowerCase();
        expect(
          conhecidos.has(marcador ?? "") ||
            ["profissional", "servico", "agendamento", "cliente", "estabelecimento"].includes(base),
        ).toBe(true);
      }
    }
  });
});
