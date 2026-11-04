import path from "node:path";
import { fileURLToPath } from "node:url";
import { ESLint } from "eslint";
import { describe, expect, it } from "vitest";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const eslint = new ESLint({ cwd: raiz });

async function violacoesDeImport(arquivo: string, codigo: string): Promise<number> {
  const resultados = await eslint.lintText(codigo, { filePath: path.join(raiz, arquivo) });
  const mensagens = resultados.flatMap((resultado) => resultado.messages);
  return mensagens.filter((mensagem) => mensagem.ruleId === "no-restricted-imports").length;
}

describe("regras de fronteira: packages/dominio", () => {
  const arquivo = "packages/dominio/src/exemplo.ts";

  it("proibe importar framework ou biblioteca externa", async () => {
    expect(await violacoesDeImport(arquivo, 'import React from "react";\nexport { React };')).toBe(
      1,
    );
  });

  it("proibe importar outros packages do monorepo", async () => {
    const codigo = 'import { x } from "@marquei/design-tokens";\nexport { x };';
    expect(await violacoesDeImport(arquivo, codigo)).toBe(1);
  });

  it("proibe importar modulos nativos do Node", async () => {
    expect(
      await violacoesDeImport(
        arquivo,
        'import { randomUUID } from "node:crypto";\nexport { randomUUID };',
      ),
    ).toBe(1);
  });

  it("permite importar arquivos do proprio package por caminho relativo", async () => {
    expect(await violacoesDeImport(arquivo, 'import { a } from "./a";\nexport { a };')).toBe(0);
    expect(await violacoesDeImport(arquivo, 'import { b } from "../b";\nexport { b };')).toBe(0);
  });

  it("nao restringe arquivos de teste do dominio", async () => {
    const codigo = 'import { it } from "vitest";\nit("ok", () => {});';
    expect(await violacoesDeImport("packages/dominio/src/exemplo.test.ts", codigo)).toBe(0);
  });
});

describe("regras de fronteira: apps", () => {
  it("proibe um app importar outro app pelo nome do package", async () => {
    const codigo = 'import { x } from "@marquei/console-plataforma";\nexport { x };';
    expect(await violacoesDeImport("apps/api/src/exemplo.ts", codigo)).toBe(1);
  });

  it("proibe importar o interior de outro app", async () => {
    const codigo =
      'import { x } from "@marquei/console-estabelecimento/src/pagina";\nexport { x };';
    expect(await violacoesDeImport("apps/console-plataforma/src/exemplo.ts", codigo)).toBe(1);
  });

  it("proibe importar outro app por caminho relativo", async () => {
    const codigo = 'import { x } from "../../../apps/api/src/principal";\nexport { x };';
    expect(await violacoesDeImport("apps/app-cliente/src/exemplo.ts", codigo)).toBe(1);
  });

  it("permite importar packages compartilhados", async () => {
    const codigo = 'import { x } from "@marquei/dominio";\nexport { x };';
    expect(await violacoesDeImport("apps/api/src/exemplo.ts", codigo)).toBe(0);
  });
});
