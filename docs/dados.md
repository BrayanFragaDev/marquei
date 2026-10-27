# Dados: dicionario e regras de RLS

Fonte da verdade: `apps/api/db/migracoes/*.sql` (node-pg-migrate). Este documento resume o modelo.
Migracoes sao aditivas; nunca edite uma ja aplicada.

## Comandos

```bash
pnpm db:migrate                 # aplica migracoes pendentes
pnpm db:migrate:create <nome>   # cria migracao SQL (-- Up Migration / -- Down Migration)
pnpm db:seed                    # 2 estabelecimentos de desenvolvimento (precisa de SEED_SENHA)
pnpm db:reset                   # recria o schema LOCAL, migra e semeia (recusa banco nao local)
pnpm test:integration           # migra e roda os testes contra o Postgres real
```

## Papeis do banco

| Papel | Uso | Observacao |
|---|---|---|
| `app_usuario` | API em nome de um estabelecimento | Sujeito a RLS; sem `BYPASSRLS` |
| `app_plataforma` | Console da plataforma | Politicas explicitas `acesso_plataforma`; sem `BYPASSRLS` |
| `migrador` | Migracoes | Reservado |

A aplicacao conecta com um usuario de login membro destes papeis e, em cada transacao, executa
`SET LOCAL ROLE` e `set_config('app.estabelecimento_id', <tenant>, true)` (ver
`apps/api/src/nucleo/transacao`). O tenant vem do token autenticado, nunca do cliente.

## Regras de RLS

- Toda tabela com `estabelecimento_id NOT NULL` tem `ENABLE` e `FORCE ROW LEVEL SECURITY`.
- Politica `isolamento_tenant` (papel `app_usuario`): `estabelecimento_id = app_estabelecimento_id()`
  em `USING` e `WITH CHECK`. Em `estabelecimento`, a chave e o proprio `id`.
- Sem tenant definido, `app_estabelecimento_id()` devolve `NULL` e nenhuma linha e visivel nem gravavel.
- FKs compostas `(id, estabelecimento_id)` impedem que uma linha referencie dado de outro tenant.
- `evento_analitico` (outbox): a aplicacao so le e insere.
- Verificacao automatica: `test/integracao/estrutura-do-schema.test.ts` lista tabelas de tenant sem RLS (deve ser vazio).

## Tabelas

| Tabela | Tenant | Descricao |
|---|---|---|
| `vertical` | global (somente leitura) | Manicure, cabeleireiro, barbearia, estetica, outro; vocabulario e servicos-modelo |
| `estabelecimento` | e o proprio tenant | slug, nome, vertical, fuso (`America/Sao_Paulo`), status |
| `usuario` | sim | e-mail unico por estabelecimento, papel (`dono`, `gestor`, `profissional`), `senha_hash` argon2id |
| `servico` | sim | duracao em minutos, preco em centavos inteiros |
| `profissional` | sim | pode estar ligado a um `usuario` |
| `cliente_final` | sim | telefone unico por estabelecimento; `consentimento_em`, `anonimizado_em` (LGPD) |
| `agendamento` | sim | `inicio`/`fim` em `timestamptz` UTC; status `confirmado`, `cancelado`, `concluido`, `faltou` |
| `tema` | sim | `rascunho` ou `publicado` (um de cada por estabelecimento); `tokens` jsonb |
| `evento_analitico` | sim | outbox: nome snake_case no passado, `ocorrido_em` UTC, propriedades sem dado pessoal |

## Concorrencia de agenda

`agendamento_sem_sobreposicao`: restricao de exclusao (`gist`) impede dois agendamentos
`confirmado` do mesmo profissional com intervalos `[inicio, fim)` sobrepostos. Horarios
consecutivos sao permitidos; cancelar libera o horario.
