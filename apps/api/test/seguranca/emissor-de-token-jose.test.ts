import { SignJWT } from "jose";
import { describe, expect, it } from "vitest";
import {
  EstabelecimentoId,
  Instante,
  Papel,
  Sessao,
  SessaoExpiradaError,
  SessaoInvalidaError,
  UsuarioId,
} from "@marquei/dominio";
import { EmissorDeTokenJose } from "../../src/seguranca/tokens/emissor-de-token-jose";
import { RelogioMutavel, SEGREDO_ESTABELECIMENTO, SEGREDO_PLATAFORMA } from "../identidade/suporte";

const AGORA = Instante.deIso("2030-01-10T12:00:00Z");
const USUARIO = UsuarioId.de("00000000-0000-4000-8000-000000000001");
const TENANT = EstabelecimentoId.de("00000000-0000-4000-8000-0000000000a1");

function emissores() {
  const relogio = new RelogioMutavel(AGORA);
  const estabelecimento = new EmissorDeTokenJose({
    audiencia: "console-estabelecimento",
    segredo: () => SEGREDO_ESTABELECIMENTO,
    relogio,
  });
  const plataforma = new EmissorDeTokenJose({
    audiencia: "console-plataforma",
    segredo: () => SEGREDO_PLATAFORMA,
    relogio,
  });
  return { relogio, estabelecimento, plataforma };
}

const sessaoDoDono = () =>
  Sessao.criar({
    usuarioId: USUARIO,
    papel: Papel.Dono,
    tenant: TENANT,
    emitidaEm: AGORA,
    validadeEmMinutos: 30,
  });
const sessaoDoOperador = () =>
  Sessao.criar({
    usuarioId: USUARIO,
    papel: Papel.OperadorPlataforma,
    tenant: null,
    emitidaEm: AGORA,
    validadeEmMinutos: 15,
  });

describe("EmissorDeTokenJose", () => {
  it("ida e volta preserva usuario, papel, tenant e expiracao", async () => {
    const { estabelecimento } = emissores();
    const { token, expiraEm } = await estabelecimento.emitir(sessaoDoDono());
    const sessao = await estabelecimento.verificar(token);
    expect(sessao.usuarioId.igual(USUARIO)).toBe(true);
    expect(sessao.papel).toBe(Papel.Dono);
    expect(sessao.tenant?.igual(TENANT)).toBe(true);
    expect(sessao.expiraEm.igual(expiraEm)).toBe(true);
  });

  it("recusa emitir sessao de outra audiencia", async () => {
    const { estabelecimento, plataforma } = emissores();
    await expect(estabelecimento.emitir(sessaoDoOperador())).rejects.toBeInstanceOf(
      SessaoInvalidaError,
    );
    await expect(plataforma.emitir(sessaoDoDono())).rejects.toBeInstanceOf(SessaoInvalidaError);
  });

  it("token do estabelecimento e recusado pelo verificador da plataforma e vice-versa", async () => {
    const { estabelecimento, plataforma } = emissores();
    const deEstabelecimento = (await estabelecimento.emitir(sessaoDoDono())).token;
    const deOperador = (await plataforma.emitir(sessaoDoOperador())).token;
    await expect(plataforma.verificar(deEstabelecimento)).rejects.toBeInstanceOf(
      SessaoInvalidaError,
    );
    await expect(estabelecimento.verificar(deOperador)).rejects.toBeInstanceOf(SessaoInvalidaError);
  });

  it("recusa assinatura adulterada, lixo e token sem assinatura (alg none)", async () => {
    const { estabelecimento } = emissores();
    const { token } = await estabelecimento.emitir(sessaoDoDono());
    const adulterado = token.slice(0, -3) + (token.endsWith("AAA") ? "BBB" : "AAA");
    await expect(estabelecimento.verificar(adulterado)).rejects.toBeInstanceOf(SessaoInvalidaError);
    await expect(estabelecimento.verificar("nao-e-um-jwt")).rejects.toBeInstanceOf(
      SessaoInvalidaError,
    );
    const semAssinatura = [
      Buffer.from('{"alg":"none"}').toString("base64url"),
      token.split(".")[1],
      "",
    ].join(".");
    await expect(estabelecimento.verificar(semAssinatura)).rejects.toBeInstanceOf(
      SessaoInvalidaError,
    );
  });

  it("recusa token assinado com o segredo certo mas audiencia errada", async () => {
    const { estabelecimento } = emissores();
    const forjado = await new SignJWT({ papel: "dono", tenant: TENANT.valor })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(USUARIO.valor)
      .setAudience("console-plataforma")
      .setIssuer("marquei-api")
      .setIssuedAt(AGORA.epochMs / 1000)
      .setExpirationTime(AGORA.epochMs / 1000 + 600)
      .sign(new TextEncoder().encode(SEGREDO_ESTABELECIMENTO));
    await expect(estabelecimento.verificar(forjado)).rejects.toBeInstanceOf(SessaoInvalidaError);
  });

  it("distingue token expirado de token invalido", async () => {
    const { estabelecimento, relogio } = emissores();
    const { token } = await estabelecimento.emitir(sessaoDoDono());
    relogio.avancar(30);
    await expect(estabelecimento.verificar(token)).rejects.toBeInstanceOf(SessaoExpiradaError);
  });

  it("papel incoerente com o tenant no token e recusado", async () => {
    const { estabelecimento } = emissores();
    const semTenant = await new SignJWT({ papel: "dono" })
      .setProtectedHeader({ alg: "HS256" })
      .setSubject(USUARIO.valor)
      .setAudience("console-estabelecimento")
      .setIssuer("marquei-api")
      .setIssuedAt(AGORA.epochMs / 1000)
      .setExpirationTime(AGORA.epochMs / 1000 + 600)
      .sign(new TextEncoder().encode(SEGREDO_ESTABELECIMENTO));
    await expect(estabelecimento.verificar(semTenant)).rejects.toBeInstanceOf(SessaoInvalidaError);
  });
});
