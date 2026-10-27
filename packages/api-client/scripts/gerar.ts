import { readFile, writeFile } from "node:fs/promises";
import { CAMINHO_SCHEMA, gerarSchema } from "./gerar-schema.ts";

const verificar = process.argv.includes("--verificar");
const novo = await gerarSchema();

if (verificar) {
  const atual = await readFile(CAMINHO_SCHEMA, "utf8").catch(() => "");
  if (atual !== novo) {
    throw new Error("schema.ts desatualizado: rode `pnpm gerar:api-client`.");
  }
  console.log("schema.ts em dia.");
} else {
  await writeFile(CAMINHO_SCHEMA, novo);
  console.log(`Gerado ${CAMINHO_SCHEMA}`);
}
