import { describe, expect, it } from "vitest";
import {
  ContaBloqueadaPorTentativasError,
  CredenciaisInvalidasError,
  Papel,
  SessaoExpiradaError,
} from "@marquei/dominio";
import { SENHA_CORRETA, TENANT_A, entrada, montarCenario } from "./suporte";

describe("LoginPorEmailESenha", () => {
  it("emite sessao do tenant resolvido pelo slug quando as credenciais sao validas", async () => {
    const { login, emissor } = await montarCenario();
    const saida = await login.execute(entrada("loja-a", "dono@a.test", SENHA_CORRETA));
    expect(saida.papel).toBe(Papel.Dono);
    expect(saida.estabelecimentoId.igual(TENANT_A)).toBe(true);
    const sessao = await emissor.verificar(saida.token);
    expect(sessao.tenant?.igual(TENANT_A)).toBe(true);
    expect(sessao.papel).toBe(Papel.Dono);
  });

  it("e-mail em outra caixa entra normalmente", async () => {
    const { login } = await montarCenario();
    await expect(
      login.execute(entrada("loja-a", "  DONO@A.test ", SENHA_CORRETA)),
    ).resolves.toBeDefined();
  });

  it.each([
    ["senha errada", "loja-a", "dono@a.test", "senha-errada-qualquer"],
    ["e-mail inexistente", "loja-a", "ninguem@a.test", SENHA_CORRETA],
    ["estabelecimento inexistente", "loja-zzz", "dono@a.test", SENHA_CORRETA],
    ["usuario de outro estabelecimento", "loja-b", "dono@a.test", SENHA_CORRETA],
    ["usuario inativo", "loja-a", "inativo@a.test", SENHA_CORRETA],
  ])("recusa com a mesma mensagem: %s", async (_caso, slug, email, senha) => {
    const { login } = await montarCenario();
    const erro = await login.execute(entrada(slug, email, senha)).catch((e: unknown) => e);
    expect(erro).toBeInstanceOf(CredenciaisInvalidasError);
    expect((erro as Error).message).toBe("E-mail ou senha invalidos.");
  });

  it("verifica um hash mesmo quando o e-mail nao existe (tempo comparavel, sem enumeracao)", async () => {
    const { login, hasher } = await montarCenario();
    await login.execute(entrada("loja-a", "ninguem@a.test", "qualquer")).catch(() => undefined);
    await login.execute(entrada("loja-zzz", "ninguem@a.test", "qualquer")).catch(() => undefined);
    expect(hasher.verificacoes).toBe(2);
  });

  it("bloqueia por 15 minutos apos 5 falhas, mesmo com a senha certa", async () => {
    const { login, relogio } = await montarCenario();
    for (let i = 0; i < 5; i++) {
      await login.execute(entrada("loja-a", "dono@a.test", "errada")).catch(() => undefined);
    }
    await expect(
      login.execute(entrada("loja-a", "dono@a.test", SENHA_CORRETA)),
    ).rejects.toBeInstanceOf(ContaBloqueadaPorTentativasError);
    relogio.avancar(15);
    await expect(
      login.execute(entrada("loja-a", "dono@a.test", SENHA_CORRETA)),
    ).resolves.toBeDefined();
  });

  it("o bloqueio tambem vale para e-mail inexistente (nao revela se a conta existe)", async () => {
    const { login } = await montarCenario();
    for (let i = 0; i < 5; i++) {
      await login.execute(entrada("loja-a", "fantasma@a.test", "x")).catch(() => undefined);
    }
    await expect(login.execute(entrada("loja-a", "fantasma@a.test", "x"))).rejects.toBeInstanceOf(
      ContaBloqueadaPorTentativasError,
    );
  });

  it("login correto zera a contagem de falhas", async () => {
    const { login } = await montarCenario();
    for (let i = 0; i < 4; i++) {
      await login.execute(entrada("loja-a", "dono@a.test", "errada")).catch(() => undefined);
    }
    await login.execute(entrada("loja-a", "dono@a.test", SENHA_CORRETA));
    for (let i = 0; i < 4; i++) {
      await login.execute(entrada("loja-a", "dono@a.test", "errada")).catch(() => undefined);
    }
    await expect(
      login.execute(entrada("loja-a", "dono@a.test", SENHA_CORRETA)),
    ).resolves.toBeDefined();
  });

  it("o token expira (exp curto)", async () => {
    const { login, emissor, relogio } = await montarCenario();
    const saida = await login.execute(entrada("loja-a", "dono@a.test", SENHA_CORRETA));
    relogio.avancar(31);
    await expect(emissor.verificar(saida.token)).rejects.toBeInstanceOf(SessaoExpiradaError);
  });
});
