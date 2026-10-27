import { describe, expect, it } from "vitest";
import {
  ContatoDeMensagem,
  EstabelecimentoId,
  GeradorSequencialDeIdentificador,
  Instante,
  MensagemParaEnviar,
  ModeloDeMensagem,
  ProvedorDeMensagemEmMemoria,
  ProvedorDeMensagemIndisponivelError,
  RelogioFixo,
  TransicaoDeEnvioInvalidaError,
} from "../../src/index";
import { testarContratoDoProvedorDeMensagem } from "./contrato-do-provedor-de-mensagem";

const relogio = new RelogioFixo(Instante.deIso("2026-03-10T12:00:00Z"));

testarContratoDoProvedorDeMensagem(
  "em memoria (todos os canais)",
  () => new ProvedorDeMensagemEmMemoria(relogio),
);
testarContratoDoProvedorDeMensagem(
  "em memoria (apenas e-mail)",
  () => new ProvedorDeMensagemEmMemoria(relogio, ["email"]),
);

describe("ProvedorDeMensagemEmMemoria", () => {
  const gerador = new GeradorSequencialDeIdentificador();
  const nova = (): MensagemParaEnviar =>
    MensagemParaEnviar.criar({
      id: gerador.novo("mensagem"),
      estabelecimentoId: EstabelecimentoId.de("11111111-1111-4111-8111-111111111111"),
      contato: ContatoDeMensagem.deEmail("a@b.com"),
      modelo: ModeloDeMensagem.criar("boas_vindas"),
    });

  it("falha com erro retentavel enquanto estiver indisponivel e volta a enviar depois", async () => {
    const provedor = new ProvedorDeMensagemEmMemoria(relogio);
    provedor.tornarIndisponivel();
    await expect(provedor.enviar(nova())).rejects.toThrow(ProvedorDeMensagemIndisponivelError);
    provedor.tornarDisponivel();
    await expect(provedor.enviar(nova())).resolves.toBeDefined();
  });

  it("nao registra duas vezes a mesma mensagem reenviada", async () => {
    const provedor = new ProvedorDeMensagemEmMemoria(relogio);
    const mensagem = nova();
    await provedor.enviar(mensagem);
    await provedor.enviar(mensagem);
    expect(provedor.enviadas()).toHaveLength(1);
  });

  it("reflete entrega simulada na consulta e no reenvio idempotente", async () => {
    const provedor = new ProvedorDeMensagemEmMemoria(relogio);
    const mensagem = nova();
    const enviado = await provedor.enviar(mensagem);
    provedor.simularEntrega(enviado.idNoProvedor);
    expect((await provedor.consultar(enviado.idNoProvedor)).estado).toBe("entregue");
    expect((await provedor.enviar(mensagem)).estado).toBe("entregue");
  });

  it("registra o motivo quando a falha e simulada e nao permite mudar um estado final", async () => {
    const provedor = new ProvedorDeMensagemEmMemoria(relogio);
    const enviado = await provedor.enviar(nova());
    provedor.simularFalha(enviado.idNoProvedor, "numero inexistente");
    const consultado = await provedor.consultar(enviado.idNoProvedor);
    expect(consultado.estado).toBe("falhou");
    expect(consultado.motivoDaFalha).toBe("numero inexistente");
    expect(() => provedor.simularEntrega(enviado.idNoProvedor)).toThrow(
      TransicaoDeEnvioInvalidaError,
    );
  });
});
