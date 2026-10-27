import { inspect } from "node:util";
import { describe, expect, it } from "vitest";
import {
  Credencial,
  HashDeSenhaFake,
  SenhaEmTexto,
  SenhaForaDaPoliticaError,
} from "../../src/index";

describe("SenhaEmTexto.nova (politica de senha)", () => {
  it("aceita senha longa e variada", () => {
    expect(() => SenhaEmTexto.nova("cavalo-bateria-grampo-7")).not.toThrow();
  });

  it("recusa menos de 10 caracteres", () => {
    expect(() => SenhaEmTexto.nova("Abc123xyz")).toThrow(SenhaForaDaPoliticaError);
  });

  it.each(["1234567890", "99887766554433"])("recusa senha so de numeros (%s)", (s) => {
    expect(() => SenhaEmTexto.nova(s)).toThrow(SenhaForaDaPoliticaError);
  });

  it.each(["senha12345", "Password123", "QWERTYUIOP", "1q2w3e4r5t"])(
    "recusa senha trivial comum (%s)",
    (s) => {
      expect(() => SenhaEmTexto.nova(s)).toThrow(SenhaForaDaPoliticaError);
    },
  );

  it.each(["aaaaaaaaaaaa", "abcdefghijkl", "9876543210"])(
    "recusa repeticao e sequencia (%s)",
    (s) => {
      expect(() => SenhaEmTexto.nova(s)).toThrow(SenhaForaDaPoliticaError);
    },
  );

  it("recusa senha gigante (protege o hash contra abuso)", () => {
    expect(() => SenhaEmTexto.nova("a1".repeat(100) + "xyz")).toThrow(SenhaForaDaPoliticaError);
  });

  it("o erro informa o motivo estavel", () => {
    try {
      SenhaEmTexto.nova("curta");
      expect.unreachable();
    } catch (e) {
      expect((e as SenhaForaDaPoliticaError).motivo).toBe("muito_curta");
      expect((e as SenhaForaDaPoliticaError).codigo).toBe("senha_fora_da_politica");
    }
  });
});

describe("SenhaEmTexto nunca vaza em log", () => {
  const senha = SenhaEmTexto.nova("cavalo-bateria-grampo-7");

  it("toString, JSON e inspect ocultam o valor", () => {
    expect(String(senha)).not.toContain("cavalo");
    expect(JSON.stringify({ senha })).not.toContain("cavalo");
    expect(inspect(senha)).not.toContain("cavalo");
  });

  it("revelar devolve o valor para quem precisa dele (hash)", () => {
    expect(senha.revelar()).toBe("cavalo-bateria-grampo-7");
  });
});

describe("SenhaEmTexto.deTentativa (login)", () => {
  it("nao aplica a politica: so exige algo digitado e limitado", () => {
    expect(() => SenhaEmTexto.deTentativa("123")).not.toThrow();
    expect(() => SenhaEmTexto.deTentativa("")).toThrow();
    expect(() => SenhaEmTexto.deTentativa("x".repeat(2000))).toThrow();
  });
});

describe("Credencial", () => {
  const hasher = new HashDeSenhaFake();

  it("verifica a senha correta e recusa a errada", async () => {
    const credencial = await Credencial.criar(SenhaEmTexto.nova("cavalo-bateria-grampo-7"), hasher);
    expect(
      await credencial.verificar(SenhaEmTexto.deTentativa("cavalo-bateria-grampo-7"), hasher),
    ).toBe(true);
    expect(
      await credencial.verificar(SenhaEmTexto.deTentativa("outra-coisa-qualquer"), hasher),
    ).toBe(false);
  });

  it("nao guarda a senha em texto e oculta o hash na serializacao", async () => {
    const credencial = await Credencial.criar(SenhaEmTexto.nova("cavalo-bateria-grampo-7"), hasher);
    expect(credencial.paraArmazenar()).not.toContain("cavalo-bateria-grampo-7");
    expect(JSON.stringify(credencial)).not.toContain(credencial.paraArmazenar());
  });

  it("reconstitui a partir do hash armazenado", async () => {
    const original = await Credencial.criar(SenhaEmTexto.nova("cavalo-bateria-grampo-7"), hasher);
    const volta = Credencial.reconstituir(original.paraArmazenar());
    expect(await volta.verificar(SenhaEmTexto.deTentativa("cavalo-bateria-grampo-7"), hasher)).toBe(
      true,
    );
  });
});
