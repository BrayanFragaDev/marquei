import { describe, expect, it } from "vitest";
import { SenhaEmTexto } from "@marquei/dominio";
import { HashDeSenhaArgon2 } from "../../src/modulos/identidade/infra/hash-de-senha-argon2";

describe("HashDeSenhaArgon2", () => {
  const hasher = new HashDeSenhaArgon2();
  const senha = SenhaEmTexto.nova("cavalo-bateria-grampo-7");

  it("gera hash argon2id com sal (dois hashes da mesma senha diferem)", async () => {
    const a = await hasher.hash(senha);
    const b = await hasher.hash(senha);
    expect(a.startsWith("$argon2id$")).toBe(true);
    expect(a).not.toBe(b);
    expect(a).not.toContain("cavalo");
  });

  it("verifica senha certa, recusa errada e trata hash malformado como falso", async () => {
    const hash = await hasher.hash(senha);
    expect(await hasher.verificar(senha, hash)).toBe(true);
    expect(await hasher.verificar(SenhaEmTexto.deTentativa("outra-senha-qualquer"), hash)).toBe(
      false,
    );
    expect(await hasher.verificar(senha, "hash-de-teste")).toBe(false);
  });
});
