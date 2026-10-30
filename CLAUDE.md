# CLAUDE.md

Instruções para agentes de código. Leia inteiro no início de cada sessão e siga à risca.

## 1. O que é o projeto

**A aplicação é 100% web.** Não existe aplicativo nativo (iOS/Android), Expo, React Native nem publicação em lojas. Todas as superfícies são apps Next.js; o app do cliente é um PWA mobile-first.

Agendaí (nome provisório): plataforma SaaS multi-estabelecimento de agendamento por hora marcada.
Cada estabelecimento tem app do cliente com marca dinâmica (design tokens), console próprio e é administrado por um console da plataforma separado, com dashboard de indicadores.
Produto, personas, módulos e indicadores: `produto.md`. Fases, tarefas e donos de pasta: `plano.md`. Não duplique o conteúdo deles aqui nem no código; em caso de conflito, `produto.md` vence.

## 2. Comandos

Os comandos abaixo são o alvo. Se algum ainda não existir, criá-lo faz parte da Fase 0 (ver `plano.md`); não contorne rodando ferramentas soltas.

```bash
pnpm install                          # instala tudo (Node LTS e pnpm fixados em package.json/engines)
pnpm dev --filter=@marquei/api                 # API NestJS
pnpm dev --filter=@marquei/console-estabelecimento
pnpm dev --filter=@marquei/console-plataforma
pnpm dev --filter=@marquei/app-cliente         # App web do cliente (PWA)
pnpm test                             # todos os testes (turbo)
pnpm test --filter=@marquei/dominio            # só domínio, rápido, sem I/O
pnpm test:integration                 # integração com Postgres/Redis em contêiner
pnpm test:e2e                         # fluxos críticos
pnpm lint
pnpm typecheck
pnpm build
pnpm gerar:api-client                 # regenera packages/api-client a partir do OpenAPI; nunca edite o gerado
pnpm db:migrate                       # aplica migrações
pnpm db:migrate:create <nome>         # cria migração
pnpm db:seed                          # dados de desenvolvimento (2+ estabelecimentos)
pnpm db:reset                         # recria banco local, migra e semeia
```

Subir infraestrutura local: `docker compose up -d` (PostgreSQL e Redis).
Variáveis de ambiente: copie `.env.example`; nunca commite `.env`.

## 3. Estrutura do monorepo

```
apps/
  app-cliente/             Next.js (PWA, mobile-first). App web do cliente final e modo profissional. 100% web: sem app nativo.
  console-estabelecimento/ Next.js. Console do dono/gestor.
  console-plataforma/      Next.js. Aplicação SEPARADA: domínio, deploy e auth próprios.
  api/                     NestJS, organizada em módulos.
    db/                    Migrações, seeds e políticas RLS.
    src/nucleo/            Base de módulos, repositório base com tenant, barramento de eventos.
    src/seguranca/         Guards, interceptor de tenant, rate limit.
    src/filas/             Filas BullMQ.
    src/modulos/<modulo>/  aplicacao/ (casos de uso), infra/ (repositórios, provedores), interface/ (controllers).
packages/
  dominio/                 Classes de domínio puras (entidades, objetos de valor, erros, portas).
  design-tokens/           Esquema, valores padrão e validação (contraste) dos temas.
  api-client/              Cliente tipado da API e DTOs compartilhados.
  config/                  tsconfig, eslint, prettier e env tipado.
testes/                    E2E, carga e segurança (dono: QA, ver plano.md).
docs/                      Dicionário de dados e documentos de segurança.
```

Regras de dependência (verificadas por lint; violação quebra o build):
- `apps/*` podem importar `packages/*`.
- `apps/*` nunca importam outro app. Compartilhou? Vai para um package.
- `packages/dominio` não importa nada de fora: nem framework, nem ORM, nem outros packages, nem `Date.now()` direto (receba um `Relogio`).
- `packages/api-client` e `packages/design-tokens` podem importar `dominio`; o inverso é proibido.
- `packages/config` contém só configurações e o carregador de env tipado (`carregarEnv`); nenhuma lógica de negócio nem código de interface.

## 4. Arquitetura orientada a objetos (seção mais importante)

Camadas, de dentro para fora. Dependências apontam SEMPRE para dentro.

1. **Domínio** (`packages/dominio`): entidades, objetos de valor, serviços de domínio, erros de domínio e interfaces de repositório/portas.
2. **Aplicação** (`apps/api/src/modulos/<modulo>/aplicacao`): casos de uso. Orquestram domínio e portas.
3. **Infraestrutura** (`apps/api/src/modulos/<modulo>/infra`, mais `src/nucleo` e `src/filas`): implementações de repositórios (Postgres), filas (BullMQ), gateways, notificações, relógio.
4. **Interface**: controllers NestJS, páginas/componentes Next.js. Só traduzem entrada/saída e chamam casos de uso.

Regras:
- **Entidades e objetos de valor têm comportamento.** Modelo anêmico (só campos + getters/setters) é proibido. A regra mora no objeto que tem os dados.
- **Invariantes no construtor e nos métodos.** Um objeto inválido não pode existir. Use fábricas estáticas (`criar`, `reconstituir`) e construtor privado quando houver validação.
- **Imutabilidade.** Métodos de mudança retornam nova instância (`tenant.comServico(s)`, `agendamento.cancelar(...)`). Campos `readonly`. Sem setters.
- **Casos de uso são classes com um único método `execute`**, um por intenção do usuário (`CancelarAgendamento`, `PublicarTema`). Recebem dependências no construtor.
- **Repositórios são interfaces no domínio**; implementações ficam na infraestrutura. O domínio nunca sabe que existe SQL.
- **Injeção de dependência por construtor**, sempre por interface. Sem `new` de colaborador dentro de regra de negócio; sem singletons globais; sem service locator.
- **Composição sobre herança.** Herança só para erros de domínio e, no máximo, um nível. Varie comportamento com estratégias injetadas (ex.: `PoliticaDeCancelamento`).
- **Zero lógica de negócio** em controllers, componentes React, hooks de tela ou SQL solto. Se há um `if` de regra, ele pertence ao domínio.
- Entradas externas são validadas na borda (DTO) e convertidas em objetos de valor antes de entrar no caso de uso.

Exemplo do padrão correto:

```ts
// packages/dominio/src/agendamento/agendamento.ts
export class Agendamento {
  private constructor(
    readonly id: AgendamentoId,
    readonly estabelecimentoId: EstabelecimentoId,
    readonly janela: JanelaDeTempo,
    readonly status: StatusAgendamento,
  ) {}

  static criar(id: AgendamentoId, estabelecimentoId: EstabelecimentoId, janela: JanelaDeTempo, agora: Instante): Agendamento {
    if (janela.inicio.antesDe(agora)) throw new AgendamentoNoPassadoError();
    return new Agendamento(id, estabelecimentoId, janela, StatusAgendamento.Confirmado);
  }

  cancelar(agora: Instante, politica: PoliticaDeCancelamento): Agendamento {
    if (this.status !== StatusAgendamento.Confirmado) throw new AgendamentoNaoCancelavelError(this.status);
    if (!politica.permite(this.janela.inicio, agora)) throw new ForaDoPrazoDeCancelamentoError();
    return new Agendamento(this.id, this.estabelecimentoId, this.janela, StatusAgendamento.Cancelado);
  }
}

// apps/api/src/modulos/agenda/aplicacao/cancelar-agendamento.ts
export class CancelarAgendamento {
  constructor(
    private readonly agendamentos: AgendamentoRepositorio, // interface do domínio
    private readonly politicas: PoliticaDeCancelamentoRepositorio,
    private readonly eventos: PublicadorDeEventos,
    private readonly relogio: Relogio,
  ) {}

  async execute(entrada: { estabelecimentoId: EstabelecimentoId; agendamentoId: AgendamentoId }): Promise<void> {
    const agendamento = await this.agendamentos.obterPorId(entrada.estabelecimentoId, entrada.agendamentoId);
    const politica = await this.politicas.doEstabelecimento(entrada.estabelecimentoId);
    const cancelado = agendamento.cancelar(this.relogio.agora(), politica);
    await this.agendamentos.salvar(cancelado);
    await this.eventos.publicar(new AgendamentoCancelado(cancelado.id, cancelado.estabelecimentoId, this.relogio.agora()));
  }
}
```

Anti-padrões proibidos:
- Modelo anêmico: classe só com campos e um "Service" gigante com toda a regra.
- Controller, componente ou hook com regra de negócio, cálculo de preço, de horário livre ou de permissão.
- Entidade importando ORM, decorators de framework, `fetch` ou `process.env`.
- Mutar objeto de domínio (`agendamento.status = ...`).
- Classes "Manager", "Helper", "Utils" com métodos estáticos de negócio.
- Caso de uso chamando outro caso de uso; extraia um serviço de domínio.
- Retornar linha de banco/entidade ORM para a interface; mapeie para DTO.
- `any`, `as` para silenciar o compilador, `@ts-ignore` sem justificativa em comentário.
- Herança profunda ou classe-base com comportamento "para reaproveitar código".
- Ler `Date.now()`/`new Date()` dentro do domínio (use `Relogio`).

## 5. Multi-tenant e segurança

- Toda tabela de tenant tem `estabelecimento_id NOT NULL` e **Row-Level Security habilitada e forçada** (`FORCE ROW LEVEL SECURITY`). Migração de tabela de tenant sem política RLS não passa na revisão.
- A conexão define o tenant por transação (`SET LOCAL app.estabelecimento_id`); o papel do banco da aplicação não tem `BYPASSRLS`.
- **Nunca confie em tenant vindo do cliente** (body, query, header, rota). Extraia do token autenticado; ignore e rejeite divergências.
- **Testes de isolamento são obrigatórios** para todo repositório e endpoint novo: criar dados em dois estabelecimentos e provar que um não lê, altera nem lista os do outro.
- Console da plataforma: app, domínio, deploy, sessão, cookies e rotas separados do console do estabelecimento. Nenhum código de rota ou sessão compartilhado entre eles.
- 2FA obrigatório no console da plataforma. Sessões curtas, cookies `HttpOnly`/`Secure`/`SameSite`.
- Acesso assistido ("entrar como"): exige consentimento registrado do estabelecimento, tem prazo, e gera log de auditoria imutável (quem, quando, o que mudou).
- Ações administrativas e mudanças de plano, tema e permissão geram registro de auditoria.
- Segredos nunca no repositório (nem em testes, seeds ou exemplos). Use variáveis de ambiente e `.env.example` sem valores reais.
- LGPD: o cliente final pode exportar e excluir seus dados; exclusão anonimiza o que a lei exige reter. Registre consentimento. Não coloque dado pessoal em logs nem em eventos de analytics (use ids).
- Rate limit em OTP, login e endpoints públicos de agendamento.

## 6. Customização visual

- **Tema é dado, nunca código por cliente.** Um tema é um conjunto de design tokens por estabelecimento, com estados `rascunho` e `publicado`, lido pelo app em runtime. Proibido criar branch, componente ou arquivo por cliente.
- **Proibido hardcode** de cor, fonte, raio, espaçamento ou sombra em componentes. Consuma tokens de `packages/design-tokens`.
- O esquema de tokens é validado (ex.: com zod) em `design-tokens`; tema inválido não é salvo.
- **Validação de contraste ao publicar** (WCAG AA no mínimo) para texto sobre fundo e cor principal sobre texto. Rascunho pode salvar; publicar com contraste ruim falha com erro de domínio.
- Só opções curadas: paleta validada, 4 a 6 famílias de fonte, raio (reto/suave/arredondado), densidade, 2 a 3 presets de cabeçalho e de cartão de serviço. Nova opção entra por mudança em `design-tokens`, não por campo livre.
- Publicar emite `tema_publicado`. Clientes nunca veem rascunho.
- Pré-visualização usa os mesmos componentes do app real, alimentados pelo rascunho.

## 7. Convenções de código

- TypeScript estrito (`strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`). Sem `any`.
- **Idioma:** conceitos de domínio em português (`Agendamento`, `Estabelecimento`, `Profissional`, `Servico`, `Cliente`, `Tema`). Identificadores técnicos do framework em inglês (`Controller`, `Module`, `props`, `useEffect`). Não misture no mesmo nome (`AgendamentoRepositorio`, não `AppointmentRepositorio`).
- Arquivos e pastas em `kebab-case`; classes em `PascalCase`; um conceito principal por arquivo. Sem acentos em nomes de arquivo ou identificadores.
- Limites: função até ~30 linhas, arquivo até ~300, no máximo 4 parâmetros (senão, objeto de entrada). Passou disso, extraia.
- **Erros:** erros de domínio tipados, herdando de `ErroDeDominio` com `codigo` estável (`ForaDoPrazoDeCancelamentoError`). Nada de `throw new Error('texto')` em regra de negócio. Interface mapeia código para HTTP/mensagem. Não engula exceções.
- **Datas:** sempre UTC no banco (`timestamptz`) e no transporte (ISO 8601). Converta para o fuso do estabelecimento (padrão `America/Sao_Paulo`) somente na apresentação e no cálculo de agenda diária. Use um tipo `Instante`, nunca `Date` solto no domínio.
- **Dinheiro:** centavos inteiros (`Dinheiro` como objeto de valor). Nunca `float`.
- **i18n:** nenhum texto visível hardcoded em componente; use catálogo de mensagens, pt-BR padrão. Vocabulário do estabelecimento ("barbeiro", "procedimento") vem da configuração.
- Migrações são apenas aditivas e reversíveis quando possível; nunca edite migração já aplicada.
- Commits pequenos e descritivos (Conventional Commits).

## 8. Testes

Pirâmide:
- **Unitário de domínio** (base, maioria): rápido, sem banco, sem rede, sem mocks pesados. Use objetos reais e fakes simples em memória (`AgendamentoRepositorioEmMemoria`, `RelogioFixo`).
- **Integração**: repositórios, RLS, filas e controllers contra PostgreSQL e Redis reais em contêiner. Não mocke o banco.
- **E2E**: poucos, só fluxos críticos (agendar, cancelar, publicar tema, login por OTP, acesso assistido).

Regras:
- **TDD obrigatório para regras de agenda**: conflito de horário, duração de serviço, intervalo entre atendimentos, folgas e bloqueios, fuso e virada de dia, horário de verão histórico. Escreva o teste que falha primeiro.
- Testes de isolamento entre tenants em toda superfície nova (seção 5).
- Teste de comportamento, não de implementação. Nome do teste descreve a regra em português.
- Teste instável é bug: corrija ou remova, não use retry para esconder.

Critérios de pronto (todos, antes de dizer "pronto"):
- `pnpm typecheck`, `pnpm lint` e `pnpm test` passam; integração roda se tocou em banco, fila ou API.
- Regra nova tem teste unitário de domínio; tabela nova tem RLS e teste de isolamento.
- Evento de negócio emitido quando aplicável (seção 9).
- Documentação e `.env.example` atualizados; nenhum arquivo morto ou código comentado.

## 9. Indicadores e analytics

- Todo evento de negócio relevante emite um **evento nomeado** pelo `PublicadorDeEventos`, com `estabelecimento_id`, `ocorrido_em` (UTC) e ids (sem dado pessoal). Nomes em `snake_case` no passado:
  `agendamento_criado`, `agendamento_cancelado`, `atendimento_concluido`, `tema_publicado`, `lead_mudou_etapa`.
- Eventos são gravados na tabela `evento_analitico` (outbox) na mesma transação do fato que os originou: rollback descarta os dois.
- Eventos novos são declarados como tipos em `packages/dominio/src/eventos` (catálogo único) e documentados. A lista completa, com emissor e propriedades, está em `plano.md`, seção 7.
- O dashboard (plataforma e estabelecimento) lê **somente** dessas tabelas de eventos e das visões/agregações derivadas. Proibido contar ad hoc na tela ou em endpoint específico de gráfico.
- Todo indicador aceita os cortes obrigatórios: período, vertical, plano e estabelecimento (definição dos indicadores em `produto.md`, seções 6 e 7).
- Indicador do estabelecimento é sempre filtrado por tenant (RLS); indicador global só existe no console da plataforma.
- Mudar a definição de um indicador exige atualizar `produto.md` na mesma mudança.

## 10. Trabalho com subagentes

- Cada subagente tem pastas próprias, definidas em `plano.md`. Edite apenas as suas.
- **Contratos primeiro**: DTOs, interfaces de repositório, tipos de eventos e esquema de tokens são escritos e acordados antes da implementação que os consome.
- Precisa de mudança em pasta alheia? Não edite: peça ao dono, descrevendo o que e por quê.
- Não crie dependências entre apps; combine o contrato em `packages/`.
- Ao terminar, reporte: o que mudou (arquivos), o que foi testado (comandos e resultado) e o que ficou pendente ou bloqueado.
- Não toque em arquivos de coordenação (`plano.md`, `CLAUDE.md`) sem ser o responsável por eles.

## 11. Fluxo de trabalho do agente

- Leia antes de editar: o código vizinho, os testes existentes e o trecho relevante de `produto.md`/`plano.md`.
- Mudanças pequenas e verificáveis; uma intenção por vez. Rode o teste mais próximo a cada passo.
- Antes de declarar pronto: `pnpm typecheck`, `pnpm lint`, `pnpm test` (e integração se aplicável). Mostre o resultado real; não afirme sem ter rodado.
- Não invente dependências: use a stack já decidida e o que já está no `package.json`. Nova dependência só com justificativa curta e sem alternativa nativa ou existente.
- Atualize a documentação junto com o código (`.env.example`, README da pasta, catálogo de eventos).
- Siga os padrões existentes; não refatore fora do escopo da tarefa.
- Pergunte ao dono apenas decisões de produto: nome definitivo, gateway de pagamento, provedor de WhatsApp. Decisões técnicas dentro da stack, tome e registre.
- Se algo contradiz este arquivo, pare e sinalize em vez de abrir exceção silenciosa.

## 12. Fora do escopo (v1)

Ver `produto.md`, seção 10. Não implemente nada listado lá.
