import { describe, expect, it } from "vitest";
import {
  Audiencia,
  Instante,
  RelogioFixo,
  SegundoFatorObrigatorioError,
  UsuarioId,
  VerificadorDeSegundoFatorEmMemoria,
} from "@marquei/dominio";
import { EmitirSessaoDoOperador } from "../../src/modulos/identidade/aplicacao/emitir-sessao-do-operador";
import { EmissorDeTokenJose } from "../../src/seguranca/tokens/emissor-de-token-jose";
import { SEGREDO_PLATAFORMA } from "./suporte";

const OPERADOR = UsuarioId.de("00000000-0000-4000-8000-0000000000f1");

function montar() {
  const relogio = new RelogioFixo(Instante.deIso("2030-01-10T12:00:00Z"));
  const segundoFator = new VerificadorDeSegundoFatorEmMemoria();
  const emissor = new EmissorDeTokenJose({
    audiencia: "console-plataforma",
    segredo: () => SEGREDO_PLATAFORMA,
    relogio,
  });
  return {
    segundoFator,
    emissor,
    caso: new EmitirSessaoDoOperador({ segundoFator, emissor, relogio }),
  };
}

describe("EmitirSessaoDoOperador", () => {
  it("recusa emitir sessao quando o 2FA nao esta ativo", async () => {
    const { caso } = montar();
    await expect(caso.execute({ operadorId: OPERADOR })).rejects.toBeInstanceOf(
      SegundoFatorObrigatorioError,
    );
  });

  it("com 2FA ativo emite token na audiencia da plataforma, sem tenant", async () => {
    const { caso, segundoFator, emissor } = montar();
    segundoFator.ativarPara(OPERADOR);
    const { token } = await caso.execute({ operadorId: OPERADOR });
    const sessao = await emissor.verificar(token);
    expect(sessao.audiencia).toBe(Audiencia.ConsolePlataforma);
    expect(sessao.tenant).toBeNull();
    expect(sessao.expiraEm.minutosAte(sessao.emitidaEm)).toBe(-15);
  });
});
