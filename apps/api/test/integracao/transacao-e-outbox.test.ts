import pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { EstabelecimentoId, Instante } from "@marquei/dominio";
import {
  ExecutorTransacional,
  ProvedorDeTransacao,
  PublicadorDeEventosOutbox,
  SemTransacaoComTenantError,
} from "../../src/nucleo";
import { criarPoolAdmin } from "./suporte/banco";
import { criarTenant, removerTenant, type Tenant } from "./suporte/fixtures";

describe("transacao com tenant e outbox de eventos", () => {
  let pool: pg.Pool;
  let a: Tenant;
  let b: Tenant;
  let provedor: ProvedorDeTransacao;
  let executor: ExecutorTransacional;
  let publicador: PublicadorDeEventosOutbox;

  const evento = (tenant: Tenant) => ({
    nome: "agendamento_criado",
    estabelecimentoId: EstabelecimentoId.de(tenant.estabelecimentoId),
    ocorridoEm: Instante.deIso("2030-01-10T12:00:00Z"),
    propriedades: { agendamento_id: tenant.agendamentoId },
  });

  beforeAll(async () => {
    pool = criarPoolAdmin();
    a = await criarTenant(pool, "55");
    b = await criarTenant(pool, "66");
    provedor = new ProvedorDeTransacao();
    executor = new ExecutorTransacional(pool, provedor);
    publicador = new PublicadorDeEventosOutbox(provedor);
  });

  afterAll(async () => {
    await removerTenant(pool, a.estabelecimentoId);
    await removerTenant(pool, b.estabelecimentoId);
    await pool.end();
  });

  const contarEventos = async (tenant: Tenant): Promise<number> => {
    const r = await pool.query("SELECT 1 FROM evento_analitico WHERE estabelecimento_id = $1", [
      tenant.estabelecimentoId,
    ]);
    return r.rowCount ?? 0;
  };

  it("usar o banco fora de transacao lanca erro tipado", () => {
    expect(() => provedor.atual()).toThrow(SemTransacaoComTenantError);
  });

  it("dentro da transacao o tenant limita o que a consulta enxerga", async () => {
    const linhas = await executor.executar(
      { papel: "app_usuario", tenant: EstabelecimentoId.de(a.estabelecimentoId) },
      async () => (await provedor.atual().consultar("SELECT id FROM agendamento")).linhas,
    );
    expect(linhas).toHaveLength(1);
  });

  it("depois do commit a conexao deixa de estar disponivel", async () => {
    const tenantA = EstabelecimentoId.de(a.estabelecimentoId);
    await executor.executar({ papel: "app_usuario", tenant: tenantA }, async () => undefined);
    expect(() => provedor.atual()).toThrow(SemTransacaoComTenantError);
  });

  it("evento gravado junto com o fato e confirmado no commit", async () => {
    await executor.executar(
      { papel: "app_usuario", tenant: EstabelecimentoId.de(a.estabelecimentoId) },
      () => publicador.publicar(evento(a)),
    );
    expect(await contarEventos(a)).toBe(1);
  });

  it("rollback descarta o fato e o evento", async () => {
    const falha = new Error("falha simulada depois de publicar");
    await expect(
      executor.executar(
        { papel: "app_usuario", tenant: EstabelecimentoId.de(b.estabelecimentoId) },
        async () => {
          await provedor
            .atual()
            .consultar("UPDATE agendamento SET status = 'cancelado' WHERE id = $1", [
              b.agendamentoId,
            ]);
          await publicador.publicar(evento(b));
          throw falha;
        },
      ),
    ).rejects.toBe(falha);
    expect(await contarEventos(b)).toBe(0);
    const r = await pool.query("SELECT status FROM agendamento WHERE id = $1", [b.agendamentoId]);
    expect(r.rows[0]).toEqual({ status: "confirmado" });
  });

  it("nao publica evento de outro tenant", async () => {
    await expect(
      executor.executar(
        { papel: "app_usuario", tenant: EstabelecimentoId.de(a.estabelecimentoId) },
        () => publicador.publicar(evento(b)),
      ),
    ).rejects.toThrow(/row-level security/i);
  });
});
