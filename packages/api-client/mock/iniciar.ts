import { SENHA_DO_MOCK, TENANTS } from "./dados.ts";
import { iniciarMock } from "./servidor.ts";

const porta = Number(process.env["MOCK_API_PORT"] ?? 4010);
const mock = await iniciarMock({
  porta,
  ...(process.env["MOCK_API_AGORA"] ? { agora: process.env["MOCK_API_AGORA"] } : {}),
});

console.log(`Mock da API Marquei em ${mock.url} (contrato: apps/api/openapi/openapi.yaml)`);
console.log("Estabelecimentos:", TENANTS.map((t) => t.estabelecimento.slug).join(", "));
console.log(`Login: e-mail de dono@<slug>.exemplo.test e senha ${SENHA_DO_MOCK}.`);
console.log(
  "Rotas autenticadas aceitam qualquer Bearer; `mock-token-<slug>` escolhe o estabelecimento.",
);
