import { describe, expect, it } from "vitest";
import {
  ContadorDeTentativas,
  Credencial,
  Email,
  EmailInvalidoError,
  EstabelecimentoId,
  Instante,
  Papel,
  Usuario,
  UsuarioId,
} from "../../src/index";

const AGORA = Instante.deIso("2030-01-10T12:00:00Z");

describe("ContadorDeTentativas", () => {
  it("bloqueia na quinta falha por 15 minutos", () => {
    let contador = ContadorDeTentativas.vazio();
    for (let i = 0; i < 4; i++) contador = contador.comFalha(AGORA);
    expect(contador.bloqueado(AGORA)).toBe(false);
    contador = contador.comFalha(AGORA);
    expect(contador.bloqueado(AGORA)).toBe(true);
    expect(contador.bloqueadoAte?.igual(AGORA.maisMinutos(15))).toBe(true);
  });

  it("o bloqueio termina depois de 15 minutos", () => {
    let contador = ContadorDeTentativas.vazio();
    for (let i = 0; i < 5; i++) contador = contador.comFalha(AGORA);
    expect(contador.bloqueado(AGORA.maisMinutos(14))).toBe(true);
    expect(contador.bloqueado(AGORA.maisMinutos(15))).toBe(false);
  });

  it("falha apos o bloqueio expirar recomeca a contagem", () => {
    let contador = ContadorDeTentativas.vazio();
    for (let i = 0; i < 5; i++) contador = contador.comFalha(AGORA);
    const depois = contador.comFalha(AGORA.maisMinutos(20));
    expect(depois.falhas).toBe(1);
    expect(depois.bloqueado(AGORA.maisMinutos(20))).toBe(false);
  });

  it("e imutavel", () => {
    const vazio = ContadorDeTentativas.vazio();
    vazio.comFalha(AGORA);
    expect(vazio.falhas).toBe(0);
  });
});

describe("Email", () => {
  it("normaliza caixa e espacos", () => {
    expect(Email.de("  Dono@Exemplo.COM ").valor).toBe("dono@exemplo.com");
  });

  it.each(["", "sem-arroba", "a@b", "a b@c.com", "@c.com", "a@@c.com"])("recusa %j", (t) => {
    expect(() => Email.de(t)).toThrow(EmailInvalidoError);
  });
});

describe("Usuario", () => {
  const base = {
    id: UsuarioId.de("00000000-0000-4000-8000-000000000001"),
    estabelecimentoId: EstabelecimentoId.de("00000000-0000-4000-8000-0000000000a1"),
    email: Email.de("dono@exemplo.com"),
    nome: "Dono",
    credencial: Credencial.reconstituir("hash"),
  };

  it("usuario ativo de papel de console pode entrar", () => {
    expect(Usuario.reconstituir({ ...base, papel: Papel.Dono, ativo: true }).podeEntrar()).toBe(
      true,
    );
  });

  it("usuario inativo nao entra", () => {
    expect(Usuario.reconstituir({ ...base, papel: Papel.Dono, ativo: false }).podeEntrar()).toBe(
      false,
    );
  });

  it("papel fora do console do estabelecimento nao entra por senha", () => {
    expect(
      Usuario.reconstituir({ ...base, papel: Papel.ClienteFinal, ativo: true }).podeEntrar(),
    ).toBe(false);
  });

  it("inicia sessao no tenant do proprio usuario", () => {
    const sessao = Usuario.reconstituir({
      ...base,
      papel: Papel.Gestor,
      ativo: true,
    }).iniciarSessao(AGORA, 30);
    expect(sessao.tenant?.igual(base.estabelecimentoId)).toBe(true);
    expect(sessao.papel).toBe(Papel.Gestor);
    expect(sessao.usuarioId.igual(base.id)).toBe(true);
  });
});
