import argon2 from "argon2";
import type pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { Email, EstabelecimentoId, Slug } from "@marquei/dominio";
import {
  ExecutorTransacional,
  ProvedorDeTransacao,
  SemTransacaoComTenantError,
} from "../../src/nucleo";
import { EscopoDeTenantTransacional } from "../../src/modulos/identidade/infra/escopo-de-tenant-transacional";
import { ResolvedorDeEstabelecimentoPostgres } from "../../src/modulos/identidade/infra/resolvedor-de-estabelecimento-postgres";
import { UsuarioRepositorioPostgres } from "../../src/modulos/identidade/infra/usuario-repositorio-postgres";
import { criarPoolAdmin } from "./suporte/banco";
import { criarTenant, removerTenant, type Tenant } from "./suporte/fixtures";

describe("isolamento entre tenants: repositorio de usuario e resolvedor de slug", () => {
  let pool: pg.Pool;
  let a: Tenant;
  let b: Tenant;
  let transacao: ProvedorDeTransacao;
  let executor: ExecutorTransacional;
  let repositorio: UsuarioRepositorioPostgres;
  const idA = (): EstabelecimentoId => EstabelecimentoId.de(a.estabelecimentoId);
  const idB = (): EstabelecimentoId => EstabelecimentoId.de(b.estabelecimentoId);

  beforeAll(async () => {
    pool = criarPoolAdmin();
    a = await criarTenant(pool, "81");
    b = await criarTenant(pool, "82");
    await pool.query("UPDATE usuario SET senha_hash = $1 WHERE id = $2", [
      await argon2.hash("x-1234567890"),
      a.usuarioId,
    ]);
    transacao = new ProvedorDeTransacao();
    executor = new ExecutorTransacional(pool, transacao);
    repositorio = new UsuarioRepositorioPostgres(transacao);
  });

  afterAll(async () => {
    await removerTenant(pool, a.estabelecimentoId);
    await removerTenant(pool, b.estabelecimentoId);
    await pool.end();
  });

  it("le o proprio usuario e reconstitui papel, ativo e credencial", async () => {
    const usuario = await executor.executar({ papel: "app_usuario", tenant: idA() }, () =>
      repositorio.obterPorEmail(idA(), Email.de("dono-81@exemplo.test")),
    );
    expect(usuario?.id.valor).toBe(a.usuarioId);
    expect(usuario?.podeEntrar()).toBe(true);
  });

  it("no tenant A nao le usuario do tenant B, nem pedindo o id de B", async () => {
    const emailB = Email.de("dono-82@exemplo.test");
    const resultados = await executor.executar(
      { papel: "app_usuario", tenant: idA() },
      async () => [
        await repositorio.obterPorEmail(idA(), emailB),
        await repositorio.obterPorEmail(idB(), emailB),
      ],
    );
    expect(resultados).toEqual([null, null]);
  });

  it("e simetrico: no tenant B nao le usuario de A", async () => {
    const r = await executor.executar({ papel: "app_usuario", tenant: idB() }, () =>
      repositorio.obterPorEmail(idA(), Email.de("dono-81@exemplo.test")),
    );
    expect(r).toBeNull();
  });

  it("fora de transacao com tenant o repositorio falha com erro tipado", async () => {
    await expect(
      repositorio.obterPorEmail(idA(), Email.de("dono-81@exemplo.test")),
    ).rejects.toBeInstanceOf(SemTransacaoComTenantError);
  });

  it("o resolvedor devolve so o id do estabelecimento ativo pelo slug", async () => {
    const resolvedor = new ResolvedorDeEstabelecimentoPostgres(executor, transacao);
    expect((await resolvedor.idPorSlug(Slug.de("teste-81")))?.valor).toBe(a.estabelecimentoId);
    expect(await resolvedor.idPorSlug(Slug.de("nao-existe-123"))).toBeNull();
    await pool.query("UPDATE estabelecimento SET status = 'encerrado' WHERE id = $1", [
      b.estabelecimentoId,
    ]);
    expect(await resolvedor.idPorSlug(Slug.de("teste-82"))).toBeNull();
  });

  it("o escopo de tenant prende a transacao ao tenant informado", async () => {
    const escopo = new EscopoDeTenantTransacional(executor);
    const visiveis = await escopo.noTenant(idA(), async () => {
      const r = await transacao.atual().consultar<{ id: string }>("SELECT id FROM usuario");
      return r.linhas.map((l) => l.id);
    });
    expect(visiveis).toEqual([a.usuarioId]);
  });
});
