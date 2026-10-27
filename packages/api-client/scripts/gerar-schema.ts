import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import openapiTS, { astToString } from "openapi-typescript";
import { format, resolveConfig } from "prettier";

export const CAMINHO_OPENAPI = fileURLToPath(
  new URL("../../../apps/api/openapi/openapi.yaml", import.meta.url),
);
export const CAMINHO_SCHEMA = fileURLToPath(new URL("../src/gerado/schema.ts", import.meta.url));

const CABECALHO = `/* eslint-disable */
// ARQUIVO GERADO por \`pnpm gerar:api-client\` a partir de apps/api/openapi/openapi.yaml.
// NAO EDITE A MAO: altere o OpenAPI e regere.
`;

/** Gera o conteudo de `schema.ts` a partir do OpenAPI, formatado com o Prettier do repositorio. */
export async function gerarSchema(): Promise<string> {
  const yaml = await readFile(CAMINHO_OPENAPI, "utf8");
  const ast = await openapiTS(yaml);
  const bruto = `${CABECALHO}\n${astToString(ast)}`;
  const config = (await resolveConfig(CAMINHO_SCHEMA)) ?? {};
  return format(bruto, { ...config, filepath: CAMINHO_SCHEMA });
}
