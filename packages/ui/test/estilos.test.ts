import { describe, expect, it } from "vitest";
import { ESTILOS_DA_UI } from "../src/index";

describe("folha de estilos da UI", () => {
  it("nao contem cor literal: tudo vem das variaveis do tema", () => {
    expect(ESTILOS_DA_UI).not.toMatch(/#[0-9a-fA-F]{3,8}\b/);
    expect(ESTILOS_DA_UI).not.toMatch(/\b(rgb|rgba|hsl|hsla)\(/);
    expect(ESTILOS_DA_UI).not.toMatch(/:\s*(white|black|red|blue|green|gray|grey)\b/);
  });

  it("nao fixa familia de fonte, sombra nem raio em pixels", () => {
    expect(ESTILOS_DA_UI).not.toMatch(/font-family:\s*(?!\s|var\()/);
    expect(ESTILOS_DA_UI).not.toMatch(/box-shadow/);
    expect(ESTILOS_DA_UI).not.toMatch(/border-radius:\s*[1-9]/);
  });

  it("garante alvo de toque minimo de 44px nos controles", () => {
    expect(ESTILOS_DA_UI).toContain("--mq-alvo-toque: 44px");
    const regras = ESTILOS_DA_UI.split("}").filter((r) =>
      /min-height: max\(var\(--mq-alvo-toque\)/.test(r),
    );
    expect(regras.length).toBeGreaterThanOrEqual(3);
  });
});
