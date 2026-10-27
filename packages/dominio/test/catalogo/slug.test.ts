import { describe, expect, it } from "vitest";
import { Slug, SlugInvalidoError } from "../../src/index";

describe("Slug", () => {
  it("aceita minusculas, numeros e hifens", () => {
    expect(Slug.de("barbearia-do-ze-2").valor).toBe("barbearia-do-ze-2");
  });

  it.each(["ab", "Maiuscula", "-comeco", "fim-", "com espaco", "dup--hifen", "acentuação"])(
    "recusa %s",
    (texto) => {
      expect(() => Slug.de(texto)).toThrow(SlugInvalidoError);
    },
  );

  it("compara por valor", () => {
    expect(Slug.de("loja-a").igual(Slug.de("loja-a"))).toBe(true);
    expect(Slug.de("loja-a").igual(Slug.de("loja-b"))).toBe(false);
  });
});
