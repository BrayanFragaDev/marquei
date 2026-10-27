import { base, fronteiras, ignores } from "@marquei/config/eslint";

// Scripts Node soltos (db/*.mjs) nao passam pelo TypeScript: declaram as globais que usam.
const scriptsNode = {
  files: ["apps/api/db/**/*.mjs"],
  languageOptions: { globals: { process: "readonly", console: "readonly" } },
};

export default [ignores, ...base, ...fronteiras, scriptsNode];
