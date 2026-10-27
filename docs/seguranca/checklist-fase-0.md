# Checklist de seguranca e LGPD: fim da Fase 0

Legenda: [x] existe e foi verificado; [~] parcial; [ ] depende de onda futura.
Atualizado pelo subagente `qa-seguranca`. Marque somente com evidencia.

## Isolamento por tenant
- [ ] Toda tabela de tenant com `estabelecimento_id NOT NULL` e RLS habilitada e forcada (depende do schema, AD-2).
- [ ] Papel do banco da aplicacao sem `BYPASSRLS`; tenant por transacao via `SET LOCAL` (AD-2).
- [~] Dados de teste deterministicos dos estabelecimentos A e B (`testes/dados/`); falta a suite de vazamento que os usa.
- [ ] Suite de vazamento percorrendo todas as rotas autenticadas com token de A e dados de B (lista de rotas gerada).
- [ ] Tenant extraido do token, nunca de body, query, header ou rota; divergencia rejeitada.

## Segredos e dependencias
- [~] `.env` fora do repositorio e `.env.example` sem valores reais (confirmar na revisao da raiz).
- [ ] Varredura automatica de segredos no CI (a adicionar em `qualidade*.yml`).
- [ ] Varredura de vulnerabilidades de dependencias no CI.
- [x] Dados de teste usam apenas valores ficticios (telefones e nomes inventados).

## Autenticacao e acesso
- [ ] OTP com limite de tentativas e rate limit em login e endpoints publicos (Fase 1).
- [ ] 2FA obrigatorio no console da plataforma; cookies `HttpOnly`/`Secure`/`SameSite`.
- [ ] Acesso assistido com consentimento, prazo e auditoria imutavel.
- [ ] Revisao OWASP ASVS nivel 2 para autenticacao e dados.

## LGPD
- [ ] Logs e eventos de analytics sem dado pessoal (apenas ids); teste automatizado sobre o formato dos eventos.
- [ ] Registro de consentimento do cliente final.
- [ ] Exportacao e exclusao de dados do cliente (exclusao anonimiza o que a lei exige reter).

## Qualidade como portao
- [x] Workflow `qualidade.yml` com e2e (Playwright) e fumaca de carga (k6, nao bloqueante ainda).
- [~] Maestro manual ate existir app.
- [ ] Relatorio de acessibilidade da fase.
