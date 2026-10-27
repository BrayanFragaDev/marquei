import { describe, expect, it } from "vitest";
import {
  Audiencia,
  EstabelecimentoId,
  Instante,
  Papel,
  Sessao,
  SessaoInvalidaError,
  UsuarioId,
} from "../../src/index";

const USUARIO = UsuarioId.de("00000000-0000-4000-8000-000000000001");
const TENANT = EstabelecimentoId.de("00000000-0000-4000-8000-0000000000a1");
const OUTRO = EstabelecimentoId.de("00000000-0000-4000-8000-0000000000b2");
const AGORA = Instante.deIso("2030-01-10T12:00:00Z");

function sessaoDoDono(): Sessao {
  return Sessao.criar({
    usuarioId: USUARIO,
    papel: Papel.Dono,
    tenant: TENANT,
    emitidaEm: AGORA,
    validadeEmMinutos: 30,
  });
}

describe("Sessao", () => {
  it("deriva a audiencia do papel", () => {
    expect(sessaoDoDono().audiencia).toBe(Audiencia.ConsoleEstabelecimento);
  });

  it("expira no instante de expiracao, nao antes", () => {
    const sessao = sessaoDoDono();
    expect(sessao.expirada(AGORA.maisMinutos(29))).toBe(false);
    expect(sessao.expirada(AGORA.maisMinutos(30))).toBe(true);
  });

  it("papel de estabelecimento exige tenant", () => {
    expect(() =>
      Sessao.criar({
        usuarioId: USUARIO,
        papel: Papel.Dono,
        tenant: null,
        emitidaEm: AGORA,
        validadeEmMinutos: 5,
      }),
    ).toThrow(SessaoInvalidaError);
  });

  it("operador nao pode ter tenant", () => {
    expect(() =>
      Sessao.criar({
        usuarioId: USUARIO,
        papel: Papel.OperadorPlataforma,
        tenant: TENANT,
        emitidaEm: AGORA,
        validadeEmMinutos: 5,
      }),
    ).toThrow(SessaoInvalidaError);
  });

  it("operador tem sessao sem tenant na audiencia da plataforma", () => {
    const sessao = Sessao.criar({
      usuarioId: USUARIO,
      papel: Papel.OperadorPlataforma,
      tenant: null,
      emitidaEm: AGORA,
      validadeEmMinutos: 15,
    });
    expect(sessao.tenant).toBeNull();
    expect(sessao.audiencia).toBe(Audiencia.ConsolePlataforma);
  });

  it("validade precisa ser positiva", () => {
    expect(() =>
      Sessao.criar({
        usuarioId: USUARIO,
        papel: Papel.Dono,
        tenant: TENANT,
        emitidaEm: AGORA,
        validadeEmMinutos: 0,
      }),
    ).toThrow(SessaoInvalidaError);
  });

  it("reconstituir recusa audiencia incompativel com o papel", () => {
    expect(() =>
      Sessao.reconstituir({
        usuarioId: USUARIO,
        papel: Papel.Dono,
        tenant: TENANT,
        audiencia: Audiencia.ConsolePlataforma,
        emitidaEm: AGORA,
        expiraEm: AGORA.maisMinutos(5),
      }),
    ).toThrow(SessaoInvalidaError);
  });

  it("reconstituir recusa expiracao anterior a emissao", () => {
    expect(() =>
      Sessao.reconstituir({
        usuarioId: USUARIO,
        papel: Papel.Dono,
        tenant: TENANT,
        audiencia: Audiencia.ConsoleEstabelecimento,
        emitidaEm: AGORA,
        expiraEm: AGORA.maisMinutos(-1),
      }),
    ).toThrow(SessaoInvalidaError);
  });

  it("informa se pertence a um tenant", () => {
    const sessao = sessaoDoDono();
    expect(sessao.pertenceAoTenant(TENANT)).toBe(true);
    expect(sessao.pertenceAoTenant(OUTRO)).toBe(false);
  });

  it("tenantObrigatorio devolve o tenant e falha para operador", () => {
    expect(sessaoDoDono().tenantObrigatorio().igual(TENANT)).toBe(true);
    const operador = Sessao.criar({
      usuarioId: USUARIO,
      papel: Papel.OperadorPlataforma,
      tenant: null,
      emitidaEm: AGORA,
      validadeEmMinutos: 5,
    });
    expect(() => operador.tenantObrigatorio()).toThrow(SessaoInvalidaError);
  });
});
