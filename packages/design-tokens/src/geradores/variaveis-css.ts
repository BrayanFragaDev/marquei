import { CAMPOS_DE_COR, type CampoDeCor } from "../esquema/esquema-do-tema";
import type { TemaDoEstabelecimento } from "../tema/tema-do-estabelecimento";

export interface VariaveisCss {
  /** Mapa `--nome` para valor, na ordem de emissao. */
  readonly variaveis: Readonly<Record<string, string>>;
  /** Bloco CSS pronto: `:root { --cor-primaria: #...; ... }`. */
  readonly css: string;
}

const NOMES_DE_COR: Readonly<Record<CampoDeCor, string>> = {
  primaria: "--cor-primaria",
  textoSobrePrimaria: "--cor-texto-sobre-primaria",
  apoio: "--cor-apoio",
  fundo: "--cor-fundo",
  superficie: "--cor-superficie",
  texto: "--cor-texto",
  textoSuave: "--cor-texto-suave",
};

const px = (n: number): string => `${n}px`;

/** Gera as variaveis CSS do tema (Next.js/web). Mesmos valores de `paraTemaNativo`. */
export function paraVariaveisCss(tema: TemaDoEstabelecimento, seletor = ":root"): VariaveisCss {
  const raio = tema.escalaDeRaio();
  const espaco = tema.escalaDeEspacamento();
  const pares: Array<readonly [string, string]> = [
    ...CAMPOS_DE_COR.map((campo) => [NOMES_DE_COR[campo], tema.cores.obter(campo).valor] as const),
    ["--fonte-familia", tema.familia.pilhaCss()],
    ["--raio-campo", px(raio.campo)],
    ["--raio-botao", px(raio.botao)],
    ["--raio-cartao", px(raio.cartao)],
    ["--espaco-xs", px(espaco.xs)],
    ["--espaco-sm", px(espaco.sm)],
    ["--espaco-md", px(espaco.md)],
    ["--espaco-lg", px(espaco.lg)],
    ["--espaco-xl", px(espaco.xl)],
    ["--altura-campo", px(espaco.alturaDoCampo)],
    ["--preset-cabecalho", tema.cabecalho],
    ["--preset-cartao-servico", tema.cartaoDeServico],
  ];
  const linhas = pares.map(([nome, valor]) => `  ${nome}: ${valor};`);
  return {
    variaveis: Object.fromEntries(pares),
    css: `${seletor} {\n${linhas.join("\n")}\n}\n`,
  };
}
