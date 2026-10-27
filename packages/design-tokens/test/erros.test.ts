import { ErroDeDominio } from "@marquei/dominio";
import { describe, expect, it } from "vitest";
import {
  CorHex,
  CorInvalidaError,
  ContrasteInsuficienteError,
  TemaDoEstabelecimento,
  TemaInvalidoError,
  ValidadorDeContraste,
  temaPadraoDaVertical,
} from "../src";

function capturar(acao: () => unknown): unknown {
  try {
    acao();
  } catch (erro) {
    return erro;
  }
  throw new Error("a acao deveria ter falhado");
}

describe("erros do tema sao erros de dominio", () => {
  it("cor invalida e ErroDeDominio com codigo estavel", () => {
    const erro = capturar(() => CorHex.criar("azul"));
    expect(erro).toBeInstanceOf(CorInvalidaError);
    expect(erro).toBeInstanceOf(ErroDeDominio);
    expect(erro).toMatchObject({ codigo: "cor_invalida" });
  });

  it("tema invalido e ErroDeDominio com codigo estavel", () => {
    const erro = capturar(() => TemaDoEstabelecimento.criar({}));
    expect(erro).toBeInstanceOf(TemaInvalidoError);
    expect(erro).toBeInstanceOf(ErroDeDominio);
    expect(erro).toMatchObject({ codigo: "tema_invalido" });
  });

  it("contraste insuficiente e ErroDeDominio com codigo estavel", () => {
    const base = temaPadraoDaVertical("outro");
    const ruim = base.comCores(base.cores.comCor("textoSuave", CorHex.criar("#dddddd")));
    const erro = capturar(() => ruim.validarParaPublicacao(new ValidadorDeContraste()));
    expect(erro).toBeInstanceOf(ContrasteInsuficienteError);
    expect(erro).toBeInstanceOf(ErroDeDominio);
    expect(erro).toMatchObject({ codigo: "contraste_insuficiente" });
  });

  it("o nome da classe identifica o erro", () => {
    expect(capturar(() => CorHex.criar("x"))).toMatchObject({ name: "CorInvalidaError" });
  });
});
