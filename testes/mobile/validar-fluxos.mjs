// Validacao minima dos fluxos Maestro sem o binario: exige appId e o separador "---".
import console from "node:console";
import process from "node:process";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const pasta = dirname(fileURLToPath(import.meta.url));
let falhou = false;
for (const arquivo of readdirSync(pasta).filter((nome) => nome.endsWith(".yaml"))) {
  const texto = readFileSync(join(pasta, arquivo), "utf8");
  const [cabecalho, ...fluxo] = texto.split(/^---\s*$/m);
  const temAppId = /^appId:\s*\S+/m.test(cabecalho ?? "");
  const temComandos = /^- \w+/m.test(fluxo.join("---"));
  if (!temAppId || !temComandos) {
    console.error(`${arquivo}: invalido (appId=${temAppId}, comandos=${temComandos})`);
    falhou = true;
  } else {
    console.log(`${arquivo}: ok`);
  }
}
process.exit(falhou ? 1 : 0);
