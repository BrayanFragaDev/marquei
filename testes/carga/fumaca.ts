import http from "k6/http";
import { check, sleep } from "k6";
import type { Options } from "k6/options";

// Nesta fase nao ha API: BASE_URL aponta para o alvo real quando existir.
const BASE_URL = __ENV["BASE_URL"] ?? "http://localhost:3333";
// Rota de horarios livres (contrato final em OpenAPI, F0-29); ajuste via variavel.
const ROTA = __ENV["ROTA_HORARIOS_LIVRES"] ?? "/saude";

export const options: Options = {
  vus: 5,
  duration: "10s",
  thresholds: {
    // plano.md, secao 4.10: horarios livres com p95 abaixo de 300 ms.
    http_req_duration: ["p(95)<300"],
    http_req_failed: ["rate<0.01"],
  },
};

export default function (): void {
  const resposta = http.get(`${BASE_URL}${ROTA}`);
  check(resposta, { "status 200": (r) => r.status === 200 });
  sleep(1);
}
