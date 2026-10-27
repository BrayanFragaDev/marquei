import { describe, expect, it } from "vitest";
import {
  EstabelecimentoId,
  GeradorSequencialDeIdentificador,
  Identificador,
  IdentificadorInvalidoError,
} from "../../src/index";

const UUID = "3f2b8c1e-9a4d-4e7b-8c2a-1d5e6f7a8b9c";

describe("Identificador", () => {
  it("aceita UUID e normaliza para minusculas", () => {
    expect(EstabelecimentoId.de(UUID.toUpperCase()).valor).toBe(UUID);
  });

  it("recusa texto que nao e UUID", () => {
    expect(() => EstabelecimentoId.de("abc")).toThrow(IdentificadorInvalidoError);
    expect(() => EstabelecimentoId.de("")).toThrow(IdentificadorInvalidoError);
    expect(() => EstabelecimentoId.de(`${UUID}; drop table`)).toThrow(IdentificadorInvalidoError);
  });

  it("considera iguais ids com o mesmo valor", () => {
    expect(EstabelecimentoId.de(UUID).igual(EstabelecimentoId.de(UUID))).toBe(true);
  });

  it("nao mistura marcas diferentes em tempo de compilacao", () => {
    const servico = Identificador.de(UUID, "servico");
    const aceitaEstabelecimento = (id: EstabelecimentoId): string => id.valor;
    // @ts-expect-error id de servico nao pode ser usado como id de estabelecimento
    aceitaEstabelecimento(servico);
    expect(servico.valor).toBe(UUID);
  });
});

describe("GeradorSequencialDeIdentificador", () => {
  it("gera ids validos, unicos e deterministicos", () => {
    const gerador = new GeradorSequencialDeIdentificador();
    const a = gerador.novo("agendamento");
    const b = gerador.novo("agendamento");
    expect(a.valor).toBe("00000000-0000-4000-8000-000000000001");
    expect(b.valor).toBe("00000000-0000-4000-8000-000000000002");
    expect(a.igual(b)).toBe(false);
  });
});
