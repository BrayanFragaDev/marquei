# Testes (e2e, mobile, carga)

Dono: subagente `qa-seguranca`. Testes unitarios de dominio ficam nos pacotes; aqui ficam os que cruzam apps.

| Tipo | Pasta | Como rodar |
|---|---|---|
| Unitario das fabricas de dados | `dados/` | `pnpm --filter @marquei/testes test` |
| Web (Playwright) | `e2e/` | `pnpm test:e2e` (primeira vez: `pnpm --filter @marquei/testes exec playwright install chromium`) |
| Mobile (Maestro) | `mobile/` | manual: `maestro test testes/mobile/fumaca.yaml`; sintaxe: `pnpm --filter @marquei/testes validar:mobile` |
| Carga (k6) | `carga/` | `BASE_URL=http://localhost:3333 pnpm --filter @marquei/testes carga:fumaca` (requer o binario `k6`) |

- `BASE_URL` aponta o alvo do Playwright e do k6. Padrao local: `http://localhost:3000` (web) e `http://localhost:3333` (API).
- A fumaca atual prova a infraestrutura; ainda nao existe app. O `appId` do Maestro e um placeholder ate o nome do produto ser definido.
- `dados/` tem fabricas deterministicas (sem aleatoriedade, sem relogio) dos estabelecimentos A e B, base da suite de vazamento entre tenants.
- Tipos: `tsconfig.json` (Node/Playwright) e `carga/tsconfig.json` (k6) sao separados de proposito.
