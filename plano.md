# plano.md — Plano de execução do Agendaí (nome provisório)

> Este plano diz COMO e EM QUE ORDEM construir. O que construir está em `produto.md`
> (fonte da verdade). Em caso de conflito, `produto.md` vence e este plano é corrigido.

## 1. Objetivo e princípios

Entregar a plataforma descrita em `produto.md` em fases curtas, cada uma com algo utilizável
por um estabelecimento real. Vários subagentes trabalham em paralelo sem se atropelar.

- **Contratos primeiro:** interfaces e DTOs nascem antes da implementação.
- **Um dono por pasta:** quem não é dono pede a mudança ao dono.
- **Tenant no banco:** o isolamento por estabelecimento é garantido por RLS, não só pela aplicação.
- **Configuração em vez de código:** vertical, tema, plano e limite são dados.
- **Fatia vertical:** cada fase fecha um fluxo ponta a ponta, não camadas soltas.

## 2. Stack e arquitetura (resumo fixo)

| Item | Decisão |
|---|---|
| Repositório | Monorepo com pnpm workspaces + Turborepo, TypeScript em tudo |
| `apps/app-cliente` | Next.js (App Router), PWA mobile-first, app web único com marca dinâmica por estabelecimento, modo profissional incluído. Sem aplicativo nativo e sem lojas |
| `apps/console-estabelecimento` | Next.js, dono/gestor do salão |
| `apps/console-plataforma` | Next.js, aplicação separada, domínio, deploy e autenticação próprios |
| `apps/api` | NestJS, PostgreSQL com RLS por tenant, Redis + BullMQ |
| `packages/dominio` | Classes de domínio puras, sem framework |
| `packages/design-tokens` | Tema por estabelecimento |
| `packages/api-client` | Cliente tipado da API |
| `packages/config` | Configurações compartilhadas (tsconfig, eslint, prettier, env tipado) |

Camadas (dependência só aponta para dentro):

| Camada | Conteúdo | Onde vive |
|---|---|---|
| Domínio | Entidades, objetos de valor, regras, portas (interfaces) | `packages/dominio` |
| Aplicação | Casos de uso, orquestração, DTOs | `apps/api/src/modulos/<modulo>/aplicacao` |
| Infraestrutura | Repositórios Postgres, filas, provedores externos | `apps/api/src/modulos/<modulo>/infra` |
| Interface | Controllers REST; telas nos apps | `.../interface` e `apps/*` |

Convenção: tenant = `estabelecimento_id`; a API abre cada transação com `SET LOCAL app.estabelecimento_id`; papéis de banco `app_usuario` (sujeito a RLS), `app_plataforma` (políticas explícitas) e `migrador`.

## 3. Fases, marcos e critérios de saída

| Fase | Nome | Marco | Critério de saída |
|---|---|---|---|
| 0 | Fundação | M0: "hello tenant" | Monorepo e CI verdes; migração cria schema com RLS; teste prova que o tenant A não lê dados do B; login funciona; tokens geram tema para web e mobile |
| 1 | MVP de agendamento | M1: primeiro salão agendando | Dono cria salão, serviços, equipe e horários; personaliza e publica o tema; cliente agenda e cancela pelo app; profissional conclui atendimento; tudo em staging |
| P | Piloto (1 ou 2 estabelecimentos) | Piloto validado | Etapas P0 a P2 da seção 12: uso real medido, metas atingidas e pelo menos um aceita pagar |
| 2 | Console da Plataforma | M2: operador no comando | Leads, estabelecimentos, planos, cobrança, acesso assistido, auditoria e flags operando; dashboard com indicadores de receita e uso |
| 3 | Retenção | M3: menos faltas | Lembretes (Web Push e WhatsApp) entregues; no-show registrado; avaliação pós-atendimento; campanha de retorno; indicadores de qualidade no dashboard |
| 4 | Premium | M4: venda do plano máximo | Sinal por Pix/cartão; multiunidade; domínio próprio; PWA com manifesto da marca do estabelecimento |

Ajustes em relação à sugestão inicial, com justificativa:
- **Dashboard dividido em dois lotes:** receita e uso na Fase 2; no-show, notificações e erros na
  Fase 3, porque dependem de dados que só existem depois dos lembretes.
- **Plano Grátis padrão na Fase 1:** semeado por migração, com limite lido de tabela, para a
  Fase 2 só acrescentar a edição.
- **100% web, sem lojas de aplicativo:** o app do cliente é um PWA instalável pela tela inicial.
  Isso elimina contas de desenvolvedor, revisão das lojas e builds nativos.

## 4. Divisão em subagentes

Nove subagentes de implementação. Cada um é dono exclusivo das pastas listadas. Abreviações
usadas nas tabelas: AD, BN, AS, DS, AC, CE, CP, NC, QA.

| Sigla | Nome do subagente | Missão em uma frase |
|---|---|---|
| AD | `arquitetura-dados` | Montar o monorepo, o CI e o banco com RLS, migrações e infra de eventos |
| BN | `backend-nucleo` | Implementar o domínio e a API de estabelecimento, catálogo, equipe e agenda |
| AS | `auth-seguranca` | Implementar identidade, OTP, e-mail/senha, 2FA, papéis e contexto de tenant |
| DS | `design-system` | Entregar tokens, presets, validação de contraste e o módulo de tema rascunho/publicado |
| AC | `app-cliente` | Construir o app web (PWA) do cliente e o modo profissional |
| CE | `console-estabelecimento` | Construir o console web do dono/gestor do salão |
| CP | `console-plataforma` | Construir o console do operador, o dashboard e a API de administração |
| NC | `notificacoes-cobranca` | Entregar lembretes, filas, assinaturas, faturas e gateway |
| QA | `qa-seguranca` | Garantir testes ponta a ponta, isolamento de tenant, acessibilidade e segurança |

### 4.1 Mapa de pastas (donos exclusivos)

| Pasta ou arquivo | Dono |
|---|---|
| Raiz (`package.json`, `pnpm-workspace.yaml`, `turbo.json`), `.github/workflows/ci*.yml`, `docker-compose.yml` | AD |
| `packages/config/**` | AD |
| `apps/api/db/**` (migrações, seeds, políticas RLS) | AD |
| `apps/api/src/nucleo/**` (base de módulos, repositório base, transação com tenant, barramento de eventos) | AD |
| `apps/api/src/app.module.ts`, `main.ts` | AD |
| `packages/dominio/src/{estabelecimento,vertical,catalogo,equipe,agenda,cliente-final,eventos}/**` | BN |
| `apps/api/src/modulos/{estabelecimento,catalogo,equipe,agenda,clientes}/**` | BN |
| `packages/api-client/src/{base,nucleo}/**`, `packages/api-client/openapi/**` | BN |
| `packages/dominio/src/identidade/**`, `apps/api/src/modulos/identidade/**` | AS |
| `apps/api/src/seguranca/**` (guards, interceptor de tenant, rate limit) | AS |
| `packages/api-client/src/identidade/**` | AS |
| `packages/design-tokens/**` | DS |
| `packages/dominio/src/tema/**`, `apps/api/src/modulos/tema/**`, `packages/api-client/src/tema/**` | DS |
| `apps/app-cliente/**` | AC |
| `apps/console-estabelecimento/**` | CE |
| `apps/console-plataforma/**` | CP |
| `packages/dominio/src/plataforma/**` (lead, plano, flag, auditoria, indicador) | CP |
| `apps/api/src/modulos/plataforma/**` (leads, admin de estabelecimentos, flags, auditoria, dashboard) | CP |
| `packages/api-client/src/plataforma/**` | CP |
| `packages/dominio/src/{notificacao,cobranca}/**` | NC |
| `apps/api/src/modulos/{notificacoes,cobranca}/**`, `apps/api/src/filas/**` | NC |
| `packages/api-client/src/cobranca/**` | NC |
| `testes/**` (e2e, carga, segurança), `docs/seguranca/**`, `.github/workflows/qualidade*.yml` | QA |

Exceção controlada: arquivos de registro (lista de módulos em `app.module.ts`, índice de
exportações de um pacote) aceitam adição de UMA linha por qualquer subagente, avisando o dono
no relatório. Qualquer outra mudança vira pedido (seção 5).

### 4.2 Subagente AD — `arquitetura-dados`

**Missão:** dar a todos um chão firme: monorepo, CI, banco com RLS e barramento de eventos.

**Entregas**
- Monorepo pnpm + Turborepo com pipelines `lint`, `typecheck`, `test`, `build`, `dev`.
- `packages/config`: tsconfig base, ESLint, Prettier, env tipado com validação (zod).
- CI no GitHub Actions com cache do Turborepo e serviços Postgres e Redis.
- Schema versionado: estabelecimento, unidade, usuario, papel, vertical, servico, profissional,
  horario_trabalho, bloqueio, cliente_final, agendamento, tema, assinatura, plano, evento_analitico.
- Políticas RLS em toda tabela com `estabelecimento_id`; papéis `app_usuario`, `app_plataforma`, `migrador`.
- Base de módulos NestJS: repositório base que exige transação com tenant, barramento de
  eventos de domínio, outbox de eventos analíticos.
- Seeds de verticais (Manicure, Cabeleireiro, Barbearia, Estética, Outro).
- Documento `docs/dados.md` com o dicionário e as regras de RLS.

**Dependências:** nenhuma (inicia a Onda 1).
**Em paralelo:** DS e QA (infra de testes) rodam junto; BN e AS começam ao fim do marco AD-1.

**Critérios de aceite**
- `pnpm install && pnpm turbo run lint typecheck test build` passa do zero em máquina limpa.
- Toda tabela com `estabelecimento_id` tem `ENABLE` e `FORCE ROW LEVEL SECURITY` (verificado por script).
- Consulta sem `app.estabelecimento_id` definido retorna zero linhas, nunca erro nem dados.
- Migração sobe e desce (`up`/`down`) em banco vazio no CI.

**Testes esperados:** integração de RLS (A não lê, não escreve nem atualiza dados de B); script
de auditoria do schema; teste de migração up/down; teste do repositório base.

### 4.3 Subagente BN — `backend-nucleo`

**Missão:** implementar as regras de negócio do agendamento em classes de domínio puras e expô-las na API.

**Entregas**
- Domínio: `Estabelecimento`, `Vertical`, `Vocabulario`, `Servico`, `Profissional`,
  `HorarioTrabalho`, `Bloqueio`, `Agendamento`, `ClienteFinal`, `PoliticaCancelamento`,
  `CalculadoraDeHorariosLivres`, máquina de estados do agendamento.
- Casos de uso: criar estabelecimento, CRUD de serviços e equipe, definir horários e bloqueios,
  consultar horários livres, criar, cancelar, remarcar e concluir agendamento, criar manualmente.
- Controle de concorrência: dois clientes no mesmo horário nunca confirmam (restrição de exclusão no banco).
- Contrato OpenAPI e geração do `packages/api-client` (base e núcleo).
- Emissão dos eventos `agendamento_*` e `atendimento_concluido`.
- Servidor mock gerado do OpenAPI para AC e CE desenvolverem sem esperar.

**Dependências:** AD-1 (scaffold); AD-2 (schema) para a camada de infra. Contratos de domínio
e OpenAPI podem sair antes do schema.
**Em paralelo:** AS, DS; AC e CE a partir do contrato publicado (marco BN-1).

**Critérios de aceite**
- Domínio não importa NestJS, TypeORM/driver nem `fetch` (regra ESLint `no-restricted-imports`).
- Horários livres respeitam duração, buffer, folgas, bloqueios e agendamentos existentes.
- Duas requisições simultâneas ao mesmo horário: uma confirma, outra recebe 409.
- Cobertura de linhas do pacote `dominio` >= 90% nas pastas de BN.
- Resposta de horários livres abaixo de 300 ms (p95) com 5 profissionais e 30 dias.

**Testes esperados:** unitários de domínio (fusos, virada de dia, horário de verão); propriedades
da calculadora; integração dos casos de uso com banco real; contrato (OpenAPI x implementação);
concorrência.

### 4.4 Subagente AS — `auth-seguranca`

**Missão:** identificar quem é quem, com qual papel e em qual tenant, de forma segura.

**Entregas**
- Cliente final: telefone + OTP (código de 6 dígitos, expira em 5 min, limite de tentativas).
- Profissional e dono: e-mail + senha (argon2id), recuperação de senha, 2FA TOTP opcional.
- Operador da plataforma: fluxo SEPARADO (emissor de tokens, segredo, audiência e cookies distintos), 2FA obrigatório.
- Papéis e permissões: `cliente_final`, `profissional`, `gestor`, `dono`, `operador_plataforma`.
- Interceptor que resolve o tenant e abre a transação com `SET LOCAL`.
- Guards, rate limit, política de senha, bloqueio por tentativas, sessões revogáveis.
- Porta `EnviadorDeOtp` (implementação real por NC; fake para desenvolvimento).

**Dependências:** AD-1 e AD-2 (tabelas de identidade).
**Em paralelo:** BN, DS. AC e CE usam login simulado até o marco AS-1.

**Critérios de aceite**
- Token do Console do Estabelecimento é rejeitado pela API do Console da Plataforma e vice-versa.
- Operador sem 2FA ativo não consegue emitir sessão.
- OTP errado 5 vezes bloqueia o número por 15 minutos.
- Nenhuma rota de negócio existe sem guard (teste que varre as rotas e falha se faltar).
- Senhas e OTPs nunca aparecem em log.

**Testes esperados:** unitários de política de senha e OTP; integração dos fluxos; testes de
abuso (força bruta, reuso de token, troca de tenant no header); varredura de rotas.

### 4.5 Subagente DS — `design-system`

**Missão:** fazer qualquer combinação de tema ficar bonita e acessível, em web, inclusive em telas pequenas.

**Entregas**
- `packages/design-tokens`: tipos `TemaDoEstabelecimento` (cores, tipografia, raio, densidade,
  preset de cabeçalho e de cartão, textos), valores padrão por vertical.
- Famílias tipográficas curadas (4 a 6) e presets de forma e layout (2 a 3).
- Validador de contraste (WCAG AA: 4.5:1 texto normal, 3:1 texto grande e componentes) com
  correção sugerida automática.
- Gerador: `paraVariaveisCss(tema)` (variáveis CSS) para todos os apps web.
- Módulo de tema na API: salvar rascunho, publicar, reverter, histórico; leitura pública do publicado.
- Catálogo de componentes de referência (documentado) para AC e CE seguirem.
- Evento `tema_rascunho_salvo` e `tema_publicado`.

**Dependências:** AD-1 (scaffold). Módulo de API depende de AD-2.
**Em paralelo:** AD, BN, AS. AC e CE consomem os tokens a partir do marco DS-1.

**Critérios de aceite**
- Publicar tema com contraste abaixo de AA é recusado com mensagem clara e sugestão de correção.
- Todas as combinações de preset x fonte x raio geram tema sem erro (teste combinatório).
- Rascunho nunca altera o que o cliente vê; só `publicar` altera.
- Pacote não depende de React nem Next.js (apenas tipos e funções).

**Testes esperados:** unitários do validador com casos de borda; combinatório de presets;
snapshot dos geradores; integração rascunho/publicado/reverter.

### 4.6 Subagente AC — `app-cliente`

**Missão:** agendar em menos de um minuto, com a marca do estabelecimento, no navegador do celular, sem instalar nada.

**Entregas**
- Next.js (TypeScript), rotas por estabelecimento (`/{slug}`), `ProvedorDeTema` que aplica as variáveis CSS do tema publicado.
- Entrada por link, QR e código; PWA instalável (manifesto e service worker) com cache do tema e fallback offline.
- Telas: início do estabelecimento, catálogo, profissional, calendário de horários livres,
  confirmação, login por OTP, meus agendamentos, cancelar e remarcar.
- Modo profissional: login por e-mail/senha, agenda do dia, concluir atendimento.
- Vocabulário dinâmico aplicado a todos os textos; preparação para i18n (pt-BR primeiro).
- Rodapé do plano Grátis com convite de lead (Fase 2); pedido de avaliação (Fase 3).
- Deploy web (preview por PR) e manifesto PWA com a marca do estabelecimento.

**Dependências:** DS-1 (tokens); BN-1 (contrato e mock); AS-1 (login de desenvolvimento).
**Em paralelo:** CE; ambos contra o mock até BN-2.
**Critérios de aceite**
- Fluxo abrir -> escolher serviço -> horário -> confirmar em <= 5 toques e < 60 s em teste cronometrado.
- Horários visíveis em < 2 s em 4G simulado (perfil de rede 4G no teste).
- Dois estabelecimentos com temas diferentes renderizam marcas diferentes na mesma aplicação.
- Alvos de toque >= 44 px; rótulos de acessibilidade em todos os botões e campos.
- Sem texto fixo "profissional" ou "serviço": tudo vem do vocabulário.

**Testes esperados:** unitários de componentes (Vitest + Testing Library); testes de tela com
mock do api-client; Playwright em viewport de celular para o fluxo principal; verificação de acessibilidade.

### 4.7 Subagente CE — `console-estabelecimento`

**Missão:** dar ao dono do salão controle simples da marca, da agenda e dos números.

**Entregas**
- Next.js (App Router), login, onboarding guiado (vertical, nome, serviços iniciais, horários).
- Editor de marca com rascunho/publicado e pré-visualização ao vivo em moldura de celular.
- Serviços, equipe e permissões, horários, folgas e bloqueios.
- Agenda dia/semana com criação manual, remarcação e cancelamento.
- Base de clientes; indicadores do estabelecimento (Fase 1: agendamentos e ocupação; Fase 3: completos).
- Página pública de agendamento e QR code; campanhas de retorno (Fase 3).
- Tela de plano e limites (leitura na Fase 2, upgrade na Fase 4).

**Dependências:** DS-1; BN-1; AS-1. Editor de marca com persistência depende de DS-2.
**Em paralelo:** AC.
**Critérios de aceite**
- Pré-visualização reflete o rascunho em < 300 ms e é idêntica ao que o app mostra após publicar (teste visual).
- "Publicar" só altera o que o cliente vê; "descartar" volta ao publicado.
- Todas as telas funcionam em 360 px de largura (profissional usa web responsiva).
- Nenhuma rota de `apps/console-plataforma` é importada aqui (regra ESLint).

**Testes esperados:** componentes; Playwright para onboarding, publicação de tema e agenda;
axe-core nas telas principais; teste visual da pré-visualização.

### 4.8 Subagente CP — `console-plataforma`

**Missão:** dar ao operador visão e controle de toda a plataforma, com dashboard de indicadores.

**Entregas**
- Next.js em app separado: domínio, deploy, cookies e autenticação próprios; 2FA obrigatório.
- Leads (funil Captado -> Contatado -> Demo -> Trial -> Ativo/Perdido), origem, responsável, histórico.
- Estabelecimentos: lista, filtros, detalhe, status, plano, usuários, uso.
- Planos e limites editáveis; cupons (cobrança em si é de NC).
- Acesso assistido com consentimento do estabelecimento, expiração e log obrigatório.
- Auditoria (quem, o quê, quando, antes/depois); feature flags por plano e por estabelecimento.
- Templates de vertical e configurações globais.
- Dashboard: backlog da seção 8; tabela `metrica_diaria` alimentada por job.
- Página pública de captação de leads.

**Dependências:** AS-2 (operador e 2FA); BN-2 (dados reais de agenda); NC-1 (contratos de cobrança) para MRR.
**Em paralelo:** NC; CE (ajustes de Fase 2).
**Critérios de aceite**
- Console da Plataforma inicia sem importar código de `console-estabelecimento` e vice-versa.
- Todo gráfico oferece os cortes obrigatórios: período, vertical, plano e estabelecimento.
- Acesso assistido sem consentimento é impossível; cada sessão gera linha de auditoria.
- Mudança de etapa de lead gera `lead_mudou_etapa` e linha de auditoria.
- Dashboard abre em < 3 s com 1.000 estabelecimentos e 12 meses de dados de teste.

**Testes esperados:** unitários das fórmulas (seção 8) com dados fixos; integração de leads,
flags e auditoria; Playwright para funil e acesso assistido; teste de isolamento de sessão.

### 4.9 Subagente NC — `notificacoes-cobranca`

**Missão:** lembrar o cliente na hora certa e cobrar o estabelecimento com segurança.

**Entregas**
- Infra BullMQ: filas `lembretes`, `cobranca`, `metricas`; reprocessamento, backoff, fila de falhas.
- Porta `ProvedorDeMensagem` com adaptadores: Web Push, WhatsApp (API oficial), SMS/OTP, e-mail.
- Agendador de lembretes (24 h e 2 h antes, configurável por plano); respeita opt-out.
- Registro de cada envio (`notificacao`: status, custo, erro) para custo de WhatsApp e falhas.
- Cobrança: `Assinatura`, `Fatura`, `Cupom`, porta `GatewayDePagamento`; webhooks idempotentes;
  inadimplência (carência, bloqueio de recursos pagos, retomada).
- Fase 4: sinal/pagamento do cliente final e reembolso conforme política.

**Dependências:** AD-2; NC-1 (contratos) depende apenas de AD-1; adaptadores reais dependem de decisões em aberto (seção 10).
**Em paralelo:** CP, BN.
**Critérios de aceite**
- Webhook repetido 3 vezes gera exatamente uma baixa de fatura.
- Lembrete não é enviado para agendamento cancelado nem duas vezes.
- Falha do provedor reenvia com backoff e, esgotado, marca `falhou` e emite `notificacao_falhou`.
- Fatura vencida há mais dias que a carência muda o status do estabelecimento sem apagar dados.
- Trocar o gateway exige alterar apenas o adaptador.

**Testes esperados:** unitários de regras de cobrança (pró-rata, cupom, carência); integração
de filas com Redis real; contrato de adaptadores com provedor simulado; testes de idempotência.

### 4.10 Subagente QA — `qa-seguranca`

**Missão:** provar que o produto funciona, é acessível e não vaza dados entre tenants.

**Entregas**
- Estrutura `testes/` (e2e, carga, segurança) e dados de teste determinísticos.
- Suíte de vazamento de tenant: percorre TODAS as rotas autenticadas com token do tenant A e
  dados do B; falha se vier qualquer linha.
- Smoke e2e por fase: Playwright (desktop e viewport de celular).
- Carga com k6 nos horários livres e criação de agendamento.
- Varredura de dependências e segredos; revisão de OWASP ASVS nível 2 para auth e dados.
- Checklist LGPD; relatório de acessibilidade por fase.
- Portões de qualidade no CI (`qualidade*.yml`) — pode bloquear merge.

**Dependências:** AD-1 (infra de teste, Onda 1); suítes completas dependem de cada fase.
**Em paralelo:** todos; atua como revisor transversal.
**Critérios de aceite**
- Suíte de tenant roda em todo PR e cobre 100% das rotas autenticadas (lista gerada, não manual).
- Nenhum achado crítico ou alto em aberto na saída de cada fase.
- Smoke e2e da fase corrente passa em staging antes de cada marco.

**Testes esperados:** os próprios descritos acima; meta de flakiness: < 2% de reexecuções.

## 5. Tabela de dependências e ondas

### 5.0 Marcos internos

| Marco | Significado |
|---|---|
| AD-1 / AD-2 | Scaffold e CI verdes / schema com RLS e outbox |
| DS-1 / DS-2 | Tipos, presets e validador / módulo de tema na API |
| BN-1 / BN-2 | Contratos OpenAPI e mock / implementação completa |
| AS-1 / AS-2 | Contratos e login de desenvolvimento / fluxos completos |
| NC-1 | Contratos de mensagem e cobrança |

### 5.1 Dependências (quem precisa de quem)

| Subagente | Precisa de | Libera |
|---|---|---|
| AD | nada | todos |
| DS | AD-1 | AC, CE, CP (tokens e tema) |
| BN | AD-1 (contrato); AD-2 (infra) | AC, CE, CP, NC |
| AS | AD-1; AD-2 | AC, CE, CP (login real) |
| AC | DS-1, BN-1, AS-1 (mock); BN-2, AS-2 (integração) | QA |
| CE | DS-1, BN-1, AS-1 (mock); DS-2, BN-2, AS-2 | QA |
| CP | AS-2, BN-2, NC-1 | QA |
| NC | AD-2, BN-1 (eventos) | CP (MRR), AC/CE (lembretes) |
| QA | AD-1; cada fase fecha com suíte própria | marcos |

### 5.2 Ondas de execução

| Onda | Fase | Roda em paralelo | O que sai | Porta de saída |
|---|---|---|---|---|
| 1 | 0 | AD (scaffold, CI), DS (DS-1), QA (infra de testes) | Monorepo verde; tokens e validador | AD-1 e DS-1 mergeados |
| 2 | 0 | AD (schema, RLS), AS (AS-1), BN (BN-1 contratos e mock), NC (NC-1 contratos) | Schema com RLS; contratos publicados; login de desenvolvimento | M0 |
| 3 | 1 | BN (BN-2), AS (AS-2), DS (DS-2), AC e CE contra o mock | Núcleo da API; telas funcionando com mock | API real passando contrato |
| 4 | 1 | AC e CE trocam mock por API real; QA e2e da Fase 1 | Fluxo ponta a ponta em staging | M1 |
| 5 | 2 | CP (leads, estabelecimentos, auditoria, flags), NC (cobrança e gateway) | Console de operação e faturas | Acesso assistido e cobrança em staging |
| 6 | 2 | CP (dashboard lote A), CE (tela de plano), QA (segurança do console) | Indicadores de receita e uso | M2 |
| 7 | 3 | NC (lembretes), BN (no-show, avaliação), AC e CE (telas), CP (dashboard lote B) | Retenção em produção | M3 |
| 8 | 4 | NC (sinal), BN (multiunidade), CE (domínio próprio), AC (publicação nas lojas), QA | Plano Premium | M4 |

Regras de onda:
- Uma onda só começa quando a porta de saída da anterior passa no CI.
- AC e CE nunca esperam a API real: usam o mock gerado do OpenAPI (Onda 2 em diante).

## 6. Regras de coordenação entre subagentes

### 6.1 Contratos primeiro
1. O dono escreve interfaces, tipos e DTOs em `packages/dominio` e o OpenAPI em `packages/api-client/openapi`.
2. Abre PR só de contrato; consumidores revisam em até uma onda curta (um ciclo de trabalho).
3. Contrato publicado só muda por PR de contrato com nota "quebra" ou "compatível".
4. A implementação nunca antecede o contrato mergeado.
5. O `api-client` é regenerado por script (`pnpm gerar:api-client`); ninguém edita arquivo gerado.

### 6.2 Um dono por pasta
- A seção 4.1 é a lei. Pasta sem dono listado pertence a AD até ser atribuída.
- Mudança em pasta alheia vira **pedido ao dono** (formato abaixo). Não se edita "só um pouquinho".
- Exceção: adição de uma linha em arquivo de registro (ver 4.1).

Formato do pedido:

```
PEDIDO para: <sigla/nome do dono>
De: <sigla/nome>
Arquivo/pasta: <caminho>
Motivo: <por que preciso>
Mudança desejada: <o que, em termos de comportamento ou assinatura>
Urgência: bloqueante | normal
```

O dono responde em uma linha: aceito, aceito com ajuste, ou recuso com motivo.

### 6.3 Definição de pronto (DoD)
Uma entrega só conta quando todos os itens abaixo são verdadeiros:
- [ ] Testes novos e antigos passam (`pnpm turbo run test`).
- [ ] Lint e formatação passam, sem `eslint-disable` sem justificativa.
- [ ] `pnpm turbo run typecheck` passa, sem `any` implícito nem `@ts-ignore` sem justificativa.
- [ ] Migração incluída, reversível, com política RLS quando houver tabela de tenant.
- [ ] Contrato (OpenAPI/DTO) atualizado e `api-client` regenerado.
- [ ] Documentação atualizada (README do módulo ou `docs/`), incluindo variáveis de ambiente novas.
- [ ] Eventos de analytics da entrega emitidos e cobertos por teste.
- [ ] Critérios de aceite do subagente, da seção 4, demonstrados.

### 6.4 Como reportar progresso
Ao fim de cada marco (ou ao se bloquear), o subagente escreve no relatório:

```
Subagente: <nome>   Onda: <n>   Marco: <id>
Feito: <lista curta, com caminhos>
Evidência: <comando e resultado, ou link do CI>
Contratos alterados: <sim/não e quais>
Pedidos abertos: <para quem e o quê>
Bloqueios: <o que impede e quem desbloqueia>
Próximo: <próximo marco>
```

Regras: relatar fatos verificados; nunca declarar pronto sem a evidência; bloqueio é
reportado na hora, não no fim da onda.

## 7. Eventos de analytics

Todo evento passa pelo outbox (tabela `evento_analitico`) na mesma transação do fato, para
nunca perder nem duplicar. O barramento é de AD; cada subagente emite os seus.

Campos comuns: `id`, `nome`, `ocorrido_em` (UTC), `estabelecimento_id`, `ator_tipo`
(`cliente_final`, `profissional`, `gestor`, `operador`, `sistema`), `ator_id`, `versao_schema`, `propriedades` (JSON).

| Evento | Emitido por | Quando | Propriedades principais |
|---|---|---|---|
| `fluxo_agendamento_iniciado` | AC | Cliente abre o fluxo de escolha | sessao_id, origem (link, QR, código) |
| `agendamento_criado` | BN | Agendamento confirmado | agendamento_id, servico_id, profissional_id, inicio, canal (app, manual, web), preco_centavos |
| `agendamento_cancelado` | BN | Cancelamento | agendamento_id, quem_cancelou, antecedencia_min, dentro_da_politica |
| `agendamento_remarcado` | BN | Remarcação | agendamento_id, inicio_antigo, inicio_novo |
| `atendimento_concluido` | BN | Profissional conclui | agendamento_id, valor_centavos, duracao_real_min |
| `agendamento_no_show` | BN | Marcado como falta (Fase 3) | agendamento_id, cliente_final_id |
| `cliente_final_criado` | AS | Primeiro login por OTP | cliente_final_id, origem |
| `avaliacao_enviada` | BN | Cliente avalia (Fase 3) | agendamento_id, nota |
| `tema_rascunho_salvo` | DS | Salva rascunho | versao, campos_alterados |
| `tema_publicado` | DS | Publica tema | versao, contraste_minimo |
| `estabelecimento_criado` | BN | Onboarding conclui | vertical, modo_agenda, origem_lead_id |
| `lead_criado` | CP | Lead captado | origem, responsavel_id |
| `lead_mudou_etapa` | CP | Muda etapa do funil | lead_id, de, para, motivo_perda |
| `assinatura_iniciada` | NC | Trial ou plano começa | plano_id, valor_centavos, ciclo |
| `assinatura_alterada` | NC | Upgrade ou downgrade | plano_antigo, plano_novo |
| `assinatura_cancelada` | NC | Cancelamento | motivo, mrr_perdido_centavos |
| `fatura_paga` | NC | Webhook confirma pagamento | fatura_id, valor_centavos, metodo |
| `fatura_vencida` | NC | Passa do vencimento | fatura_id, dias_atraso |
| `notificacao_enviada` | NC | Provedor aceita | canal, tipo, custo_centavos |
| `notificacao_falhou` | NC | Esgotou tentativas | canal, tipo, erro_codigo |
| `acesso_assistido_iniciado` | CP | Operador entra como estabelecimento | operador_id, consentimento_id |
| `feature_flag_alterada` | CP | Flag muda | flag, escopo, valor |
| `erro_app_registrado` | AC | Erro capturado no app | release, tela, codigo |

## 8. Backlog do dashboard da plataforma

Cortes obrigatórios em todos os itens: **período, vertical, plano, estabelecimento**.
Leitura via `metrica_diaria` (job noturno em fila `metricas`, reprocessável) e, para o tempo
quase real, consultas diretas com o papel `app_plataforma`. Estabelecimento de teste/interno é excluído.

Definições comuns:
- **Estabelecimento ativo:** ao menos 1 agendamento criado nos últimos 7 dias.
- **Risco de churn:** estabelecimento pagante ou em trial, com mais de 14 dias de vida, sem
  agendamento criado há 14 dias OU com queda >= 50% nos agendamentos da última semana contra a
  média das 4 semanas anteriores.
- **Pagante:** assinatura ativa de plano com preço > 0 e fatura paga.

### 8.1 Receita e crescimento

| Indicador | Fonte (tabela / evento) | Fórmula | Fase |
|---|---|---|---|
| MRR | `assinatura`, `plano`, `cupom` | Soma do valor mensal das assinaturas pagantes ativas (anual dividido por 12), com desconto de cupom vigente; exclui Grátis e trial | 2 |
| ARR | derivado de MRR | MRR x 12 | 2 |
| ARPA | `assinatura` | MRR / número de estabelecimentos pagantes | 2 |
| Novos pagantes no período | `assinatura_iniciada`, `fatura_paga` | Estabelecimentos cuja primeira `fatura_paga` cai no período | 2 |
| Churn de logos | `assinatura_cancelada` | Cancelados no período / pagantes no início do período | 2 |
| Churn de receita | `assinatura_cancelada` | MRR perdido no período / MRR no início | 2 |
| Retenção por coorte | `fatura_paga`, `assinatura` | Coorte = mês da primeira fatura paga; % da coorte ainda pagante em cada mês seguinte | 2 |
| Conversão do funil por etapa | `lead`, `lead_mudou_etapa` | Leads que chegaram à etapa N / leads que chegaram à etapa N-1 | 2 |
| Conversão por origem | `lead`, `lead_mudou_etapa` | Leads em Ativo / leads captados, agrupado por origem | 2 |
| Tempo médio até conversão | `lead_mudou_etapa` | Média de (data de Ativo - data de Captado) dos convertidos | 2 |

### 8.2 Uso do produto

| Indicador | Fonte | Fórmula | Fase |
|---|---|---|---|
| Agendamentos criados (dia/semana/mês) | `agendamento_criado` | Contagem por período, total e por estabelecimento | 2 |
| Estabelecimentos ativos x inativos | `agendamento_criado`, `estabelecimento` | Ativos = definição comum; inativos = demais com status ativo | 2 |
| Clientes finais ativos | `agendamento`, `cliente_final` | Distintos com >= 1 agendamento nos últimos 30 dias | 2 |
| Clientes finais novos | `cliente_final_criado` | Contagem no período | 2 |
| Agendamentos por cliente | `agendamento` | Agendamentos no período / clientes finais ativos | 2 |
| Taxa de ocupação média | `agendamento`, `horario_trabalho`, `bloqueio` | Minutos agendados (confirmado + concluído) / minutos disponíveis (jornada - bloqueios), média por profissional | 2 |
| Horários de pico | `agendamento` | Contagem por dia da semana x hora de início (mapa de calor) | 2 |
| Serviços mais agendados | `agendamento`, `servico` | Ranking por contagem, por vertical | 2 |
| Adoção da customização | `tema`, `tema_publicado` | Estabelecimentos ativos com tema publicado / estabelecimentos ativos | 2 |

### 8.3 Qualidade e saúde

| Indicador | Fonte | Fórmula | Fase |
|---|---|---|---|
| Taxa de no-show | `agendamento_no_show`, `atendimento_concluido` | No-show / (concluídos + no-show), por início do agendamento | 3 |
| Taxa de cancelamento | `agendamento_cancelado`, `agendamento_criado` | Cancelados / criados com início no período | 3 |
| Lista de risco de churn | `agendamento_criado`, `assinatura` | Definição comum; ordenada por MRR em risco | 2 |
| Tempo médio de agendamento | `fluxo_agendamento_iniciado`, `agendamento_criado` | Mediana de (criado - início do fluxo) por `sessao_id` | 3 |
| Falhas de notificação | `notificacao`, `notificacao_falhou` | Falhas / (enviadas + falhas), por canal | 3 |
| Erros do app | `erro_app_registrado` e ferramenta de erros | Erros por 1.000 sessões, por release | 3 |
| Tickets de suporte abertos | `ticket` (tabela simples do console) | Contagem com status aberto, idade média | 3 |

## 9. Riscos e mitigações

| Risco | Impacto | Mitigação | Dono |
|---|---|---|---|
| Vazamento de dados entre tenants | Crítico (LGPD, confiança) | RLS com `FORCE`; papéis separados; suíte de tenant em todo PR; revisão de queries nativas | AD, QA |
| Custo de WhatsApp acima do previsto | Margem do plano Pro | Registrar custo por envio; limite mensal por plano; Web Push como padrão; WhatsApp só Pro/Premium; alerta no dashboard | NC, CP |
| Tema com contraste ruim | Acessibilidade e imagem do produto | Validador obrigatório na publicação; opções curadas; sugestão automática de correção | DS |
| Inadimplência de estabelecimentos | Receita recorrente | Carência e régua de cobrança; bloqueio gradual de recursos pagos sem apagar dados; Pix e cartão; painel de inadimplência | NC, CP |

## 10. Decisões em aberto (dependem do dono)

| # | Decisão | Impacto se atrasar | Prazo ideal |
|---|---|---|---|
| 1 | Nome definitivo do produto (Agendaí é provisório) | Domínios, textos legais, contrato do piloto | Fim da Fase 0 |
| 2 | Gateway de pagamento (Pix Automático e cartão recorrente, repasse do sinal na Fase 4). Recomendação inicial: Asaas, comparando propostas (seção 12.4) | Bloqueia o adaptador real de NC; o piloto não depende dele (cobrança manual) | Antes do P3 |
| 3 | Provedor da API oficial de WhatsApp | Bloqueia lembretes por WhatsApp | Início da Fase 3 |
| 5 | Domínios: da plataforma, do console do estabelecimento e do console da plataforma | Deploy e cookies separados | Fim da Fase 0 |
| 6 | Hospedagem e região dos dados (Brasil recomendado pela LGPD) | Staging e produção | Fim da Fase 0 |
| 7 | Preços e limites iniciais dos planos | Semente do banco e textos | Início da Fase 2 |

Enquanto uma decisão está aberta, o subagente trabalha atrás da porta/interface e usa um
adaptador simulado. Isso permite avançar sem escolher fornecedor.

## 11. Checklist da Fase 0 (execução imediata)

Cada tarefa é pequena e tem verificação objetiva. Dono entre colchetes.

### 11.1 Monorepo e CI [AD]
- [x] F0-01 Criar `pnpm-workspace.yaml` com `apps/*` e `packages/*`. Verifica: `pnpm -r list` lista os workspaces.
- [x] F0-02 Criar `package.json` raiz com `packageManager` fixado e engines de Node. Verifica: `pnpm install` sem aviso.
- [x] F0-03 Criar `turbo.json` com tarefas `lint`, `typecheck`, `test`, `build`, `dev`. Verifica: `pnpm turbo run build` roda e usa cache na segunda execução.
- [x] F0-04 Criar `packages/config` com tsconfig base, ESLint e Prettier. Verifica: pacote de exemplo estende e passa no lint.
- [x] F0-05 Adicionar env tipado e validado (zod) em `packages/config`. Verifica: variável faltando derruba o start com mensagem clara.
- [x] F0-06 Criar esqueletos de `apps/api`, `apps/app-cliente`, `apps/console-estabelecimento`, `apps/console-plataforma`, `packages/dominio`, `packages/design-tokens`, `packages/api-client`. Verifica: `pnpm turbo run typecheck` verde.
- [x] F0-07 Regra ESLint proibindo `packages/dominio` de importar NestJS, React e drivers de banco. Verifica: importação proibida de teste falha o lint.
- [x] F0-08 Regra ESLint proibindo apps de importar de outros apps. Verifica: importação cruzada falha o lint.
- [ ] F0-09 Criar `docker-compose.yml` com Postgres e Redis. Verifica: `docker compose up -d` e `pg_isready` respondem. (NÃO verificado: daemon Docker indisponível no ambiente de desenvolvimento)
- [x] F0-10 Criar workflow de CI (lint, typecheck, test, build) com Postgres e Redis. Verifica: PR de teste fica verde. (confirmado no PR #1)

### 11.2 Banco e RLS [AD]
- [x] F0-11 Escolher e configurar a ferramenta de migração e criar a migração 0001 (extensões, papéis `app_usuario`, `app_plataforma`, `migrador`). Verifica: migração roda em banco vazio.
- [x] F0-12 Criar tabelas `estabelecimento`, `usuario`, `vertical`, `servico`, `profissional`, `cliente_final`, `agendamento`, `tema`. Verifica: `up` e `down` funcionam.
- [x] F0-13 Habilitar `ENABLE` e `FORCE ROW LEVEL SECURITY` e políticas por `app.estabelecimento_id`. Verifica: script de auditoria lista 0 tabelas de tenant sem RLS.
- [x] F0-14 Restrição de exclusão para impedir agendamentos sobrepostos do mesmo profissional. Verifica: teste de inserção sobreposta falha.
- [x] F0-15 Seeds das cinco verticais com serviços de exemplo e vocabulário. Verifica: `SELECT count(*) FROM vertical` = 5.
- [x] F0-16 Teste de integração do vazamento: dois tenants, leitura, escrita e update cruzados. Verifica: todos retornam zero linhas ou erro.
- [x] F0-17 Teste: consulta sem tenant definido retorna zero linhas. Verifica: teste verde.
- [x] F0-18 Repositório base que exige transação com `SET LOCAL`. Verifica: uso fora de transação lança erro tipado.
- [x] F0-19 Tabela `evento_analitico` e barramento com outbox. Verifica: evento gravado na mesma transação do fato; rollback descarta ambos.

### 11.3 Autenticação e tenant [AS]
- [x] F0-20 Definir em `packages/dominio/src/identidade` os tipos `Papel`, `Sessao`, `Credencial`. Verifica: typecheck verde e PR de contrato mergeado.
- [x] F0-21 Login por e-mail e senha (argon2id) para dono/profissional. Verifica: teste de login válido e inválido.
- [x] F0-22 Interceptor de tenant que abre transação com `SET LOCAL`. Verifica: teste de integração lê só o tenant da sessão.
- [x] F0-23 Guard global com rotas públicas explícitas. Verifica: rota sem guard faz o teste de varredura falhar.
- [x] F0-24 Esqueleto do emissor de tokens do operador com audiência separada. Verifica: token de estabelecimento é recusado na rota do operador.

### 11.4 Design tokens [DS]
- [x] F0-25 Definir tipo `TemaDoEstabelecimento` e valores padrão por vertical. Verifica: typecheck e snapshot dos padrões.
- [x] F0-26 Implementar o validador de contraste WCAG AA com sugestão de correção. Verifica: casos conhecidos (preto/branco = 21:1; cinza claro sobre branco reprova).
- [x] F0-27 Gerar `paraVariaveisCss`. Verifica: snapshot para dois temas diferentes.
- [x] F0-28 Teste combinatório de todas as combinações de preset, fonte e raio. Verifica: nenhuma combinação gera erro.

### 11.5 Contratos e qualidade [BN, NC, QA]
- [x] F0-29 [BN] Publicar OpenAPI inicial (estabelecimento, serviços, horários livres, agendamento) e script `gerar:api-client`. Verifica: cliente gerado compila.
- [x] F0-30 [NC] Publicar interfaces `ProvedorDeMensagem` e `GatewayDePagamento` em `packages/dominio`. Verifica: typecheck verde; PR revisado por CP.
- [x] F0-31 [QA] Criar `testes/` com Playwright e k6 configurados e um teste de fumaça de cada. Verifica: smoke roda no CI. (e2e verde no CI; k6 só valida o script e falha sem API, job não bloqueante; Maestro manual até existir app)

**Saída (M0):** todas as tarefas marcadas, CI verde, demonstração de isolamento entre dois tenants e de tema reprovado por contraste.

## 12. Caminho para SaaS com assinatura (piloto → comercial)

Decisão do dono: o produto será um SaaS cobrado por assinatura dos estabelecimentos, **validado
antes com 1 ou 2 estabelecimentos**. O desenho abaixo evita construir cobrança antes de provar
que o produto resolve um problema pelo qual alguém paga.

### 12.1 Etapas

| Etapa | Quando | Cobrança | Objetivo | Saída (decisão go/no-go) |
|---|---|---|---|---|
| P0. Preparação do piloto | Fim da Fase 1 (M1) | Nenhuma | Ambiente de produção/staging estável, onboarding assistido, termos e privacidade | Piloto pode usar sem risco de perder dados |
| P1. Piloto grátis (4 a 8 semanas) | Após M1 | Nenhuma (acordo verbal ou escrito) | Medir uso real e coletar objeções com 1 ou 2 estabelecimentos de verticais diferentes | Metas de uso atingidas (12.2) |
| P2. Piloto pago manual | Final do P1 | **Manual:** Pix ou boleto avulso, mensalidade simbólica ou preço cheio | Testar disposição a pagar e o preço, sem código de cobrança | Pelo menos um piloto aceita pagar o preço-alvo |
| P3. Assinatura automática | Fase 2 (NC-2) | Gateway com recorrência (cartão e Pix) + nota fiscal | Cobrar sozinho, com inadimplência tratada, para os primeiros clientes além do piloto | Cobrança conciliada sem trabalho manual por 2 ciclos |
| P4. Venda em escala | Após P3 | Plano Grátis → Pro → Premium com trial | Funil de leads e autoatendimento de contratação | Indicadores de receita (MRR, churn, LTV/CAC) no dashboard |

Regra: **não construir P3 antes de P2 dar sinal positivo.** Até lá, o Console da Plataforma
registra plano e status manualmente (campo no estabelecimento), e o dono envia a cobrança por Pix.

### 12.2 Metas do piloto (definir antes de começar; ajustáveis)

- Ativação: serviços, equipe e horários cadastrados e tema publicado em até 3 dias do início.
- Uso: pelo menos 70% dos agendamentos do estabelecimento feitos pelo link/QR da plataforma na 4ª semana.
- Retenção: o dono abre o console pelo menos 3 vezes por semana.
- Valor: queda de faltas ou de mensagens manuais relatada pelo dono; NPS informal >= 8.
- Confiabilidade: zero perda de dado e nenhum horário duplicado; erros críticos corrigidos em 1 dia útil.
- Pagamento: pelo menos um dos dois aceita pagar o preço-alvo no P2.

### 12.3 O que precisa existir antes do piloto (P0)

- Ambiente de produção separado de staging, backups do PostgreSQL com teste de restauração, monitoramento de erros e alerta de queda.
- Domínios definidos (decisão em aberto nº 5) e HTTPS; subdomínio por estabelecimento ou rota `/{slug}`.
- Termos de uso, política de privacidade e **contrato de piloto** (LGPD: o estabelecimento é controlador dos dados dos clientes, a plataforma é operadora).
- Onboarding assistido (você cadastra o estabelecimento pelo console, com consentimento) e canal de suporte combinado (WhatsApp).
- Lembretes: no piloto, WhatsApp manual ou Web Push; WhatsApp oficial só depois (custo por conversa).
- Medição: eventos analíticos já emitidos (seção 7) e uma visão mínima de uso por estabelecimento.

### 12.4 Melhores caminhos para a cobrança (recomendação)

1. **Gateway recomendado para começar: Asaas.** Atende o que o SaaS precisa: assinaturas por boleto,
   Pix ou cartão, Pix Automático (débito recorrente autorizado pelo pagador, só Pix) e API de
   assinaturas com sandbox; relatos de desenvolvedores indicam emissão de nota fiscal de serviço
   pela própria API. Mantemos a porta `GatewayDePagamento` (já criada) para trocar de fornecedor
   sem mexer no domínio. Alternativas a comparar com propostas reais: Stripe (forte em cartão, Pix
   recorrente menos maduro), Pagar.me, Iugu, Vindi e Mercado Pago. **As taxas não foram verificadas
   aqui: peça proposta e compare custo efetivo por método antes de fechar.**
2. **Pix Automático como padrão para quem não quer cartão.** Reduz inadimplência de boleto e evita o
   limite de cartão; o cliente autoriza uma vez. Cartão recorrente continua como opção. Boleto só
   se houver demanda.
3. **Cobrança manual no P2 e recebimento no piloto = conta Nubank PJ do dono.** Pelo site do Nu
   Empresas (consultado em 30/10/2026; confirme no app), a conta PJ gera cobrança por Pix (QR Code
   ou copia e cola) e boleto de cobrança, ambos anunciados como gratuitos, e o Assistente de
   Cobranças agenda lembretes, juros e multa. A página **não** mostra assinatura recorrente, API nem
   conciliação automática; portanto no P2 o dono gera a cobrança mensal no app do Nubank e marca o
   plano como pago no console. Zero código; serve para validar preço. No P3 o gateway cobra e o
   dinheiro cai na mesma conta Nubank PJ.
4. **Nota fiscal:** definir com o contador. Para MEI ou empresa pequena de serviços, avaliar a NFS-e
   nacional/emissor da prefeitura e a emissão via gateway. Nenhuma venda recorrente sem CNPJ e regime definidos.
5. **Modelo de preço inicial (a validar no P2):** assinatura mensal fixa por estabelecimento, com
   plano anual com desconto; **trial de 14 dias** sem cartão; limites por plano em configuração
   (produto.md, seção 7). Evitar comissão por agendamento no início (atrito e dificuldade de auditar).
6. **Inadimplência:** carência de 5 a 7 dias, depois modo leitura (agenda continua visível, novos
   agendamentos bloqueados), depois suspensão; nunca apagar dados. Régua de lembrete por e-mail/WhatsApp.
7. **Webhooks** do gateway assinados, idempotentes e gravados antes de processar; conciliação diária.

### 12.5 Trabalho técnico que isso adiciona ao plano

| Item | Dono | Fase |
|---|---|---|
| Campo de plano/status/vencimento editável no console (cobrança manual) | CP + AD | Fase 2, antes do P2 |
| Visão mínima de uso por estabelecimento (agendamentos, ativação, última atividade) | CP | Fase 2 (lote A do dashboard) |
| Adaptador `GatewayDePagamento` do fornecedor escolhido + webhooks + conciliação | NC | P3 |
| Planos, assinatura, fatura, cupom, trial, carência, régua de cobrança | NC + CP | P3 |
| Autocontratação: fluxo de cadastro, trial, escolha de plano e pagamento | CE + NC | P4 |
| Eventos `assinatura_*`, `fatura_*` e indicadores MRR/churn/inadimplência | NC + CP | P3/P4 |
| Termos, privacidade, contrato e DPA | dono + jurídico | P0 |

### 12.6 Riscos específicos e mitigação

| Risco | Mitigação |
|---|---|
| Construir cobrança sem validar preço | Regra do P2 antes do P3 |
| Piloto vira cliente sem contrato | Contrato de piloto com prazo e condição de pagamento |
| Dependência de um gateway | Porta `GatewayDePagamento` + testes de contrato |
| Dado de um estabelecimento vazar para o outro | Já mitigado por RLS e testes; reforçar no piloto com auditoria de acesso assistido |
| Atendimento do piloto consome o desenvolvimento | Combinar canal e horário de suporte; priorizar bugs que travam agendamento |
