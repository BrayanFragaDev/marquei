import js from "@eslint/js";
import tseslint from "typescript-eslint";

/** Nomes dos apps do monorepo. Um app nunca importa outro (CLAUDE.md, secao 3). */
export const APPS = ["api", "mobile-cliente", "console-estabelecimento", "console-plataforma"];

const arquivosDeTeste = ["**/*.test.{ts,tsx}", "**/*.spec.{ts,tsx}", "**/test/**", "testes/**"];

export const ignores = {
  ignores: [
    "**/node_modules/**",
    "**/dist/**",
    "**/.next/**",
    "**/.expo/**",
    "**/.turbo/**",
    "**/coverage/**",
    "**/playwright-report/**",
    "**/test-results/**",
  ],
};

/** Regras gerais de qualidade e tamanho (CLAUDE.md, secao 7). */
export const base = [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/ban-ts-comment": [
        "error",
        {
          "ts-ignore": "allow-with-description",
          "ts-expect-error": "allow-with-description",
          minimumDescriptionLength: 10,
        },
      ],
      "max-lines": ["error", { max: 300, skipBlankLines: true, skipComments: true }],
      "max-params": ["warn", 4],
      "max-lines-per-function": ["warn", { max: 30, skipBlankLines: true, skipComments: true }],
    },
  },
  {
    files: arquivosDeTeste,
    rules: {
      "max-lines": "off",
      "max-lines-per-function": "off",
    },
  },
];

function restringirImports(patterns) {
  return { "no-restricted-imports": ["error", { patterns }] };
}

/** Regras de dependencia entre pastas (CLAUDE.md, secao 3). Violacao quebra o lint. */
export const fronteiras = [
  {
    files: ["packages/dominio/**/*.{ts,tsx}"],
    ignores: arquivosDeTeste,
    rules: restringirImports([
      {
        regex: "^(?!\\.{1,2}(/|$)).+",
        message:
          "packages/dominio nao importa nada de fora: nem framework, nem ORM, nem outros packages.",
      },
    ]),
  },
  ...APPS.map((app) => ({
    files: [`apps/${app}/**/*.{ts,tsx}`],
    rules: restringirImports([
      {
        group: APPS.filter((outro) => outro !== app).flatMap((outro) => [
          `@marquei/${outro}`,
          `@marquei/${outro}/*`,
        ]),
        message: "apps nunca importam outro app. Compartilhou? Mova para um package.",
      },
      {
        regex: "^\\.\\./(.*/)?apps/",
        message: "apps nunca importam outro app por caminho relativo.",
      },
    ]),
  })),
];
