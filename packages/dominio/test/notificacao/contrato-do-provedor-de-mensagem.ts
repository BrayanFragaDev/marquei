import { describe, expect, it } from "vitest";
import {
  CANAIS_DE_MENSAGEM,
  CanalNaoSuportadoError,
  ContatoDeMensagem,
  EnvioNaoEncontradoError,
  EstabelecimentoId,
  GeradorSequencialDeIdentificador,
  IdDaMensagemNoProvedor,
  MensagemParaEnviar,
  ModeloDeMensagem,
  Telefone,
} from "../../src/index";
import type { CanalDeMensagem, ProvedorDeMensagem } from "../../src/index";

const ESTABELECIMENTO = EstabelecimentoId.de("11111111-1111-4111-8111-111111111111");

function contatoPara(canal: CanalDeMensagem): ContatoDeMensagem {
  switch (canal) {
    case "sms":
    case "whatsapp":
      return ContatoDeMensagem.deTelefone(canal, Telefone.de("+55 (11) 98765-4321"));
    case "email":
      return ContatoDeMensagem.deEmail("cliente@exemplo.com.br");
    case "push":
      return ContatoDeMensagem.dePush("ExponentPushToken[abc123]");
  }
}

/**
 * Teste de contrato reutilizavel da porta `ProvedorDeMensagem`. Todo adaptador (fake ou real,
 * apontado para sandbox) deve passar. `fabrica` devolve um provedor novo e vazio a cada teste.
 */
export function testarContratoDoProvedorDeMensagem(
  nome: string,
  fabrica: () => ProvedorDeMensagem,
): void {
  describe(`contrato de ProvedorDeMensagem: ${nome}`, () => {
    const gerador = new GeradorSequencialDeIdentificador();
    const novaMensagem = (canal: CanalDeMensagem): MensagemParaEnviar =>
      MensagemParaEnviar.criar({
        id: gerador.novo("mensagem"),
        estabelecimentoId: ESTABELECIMENTO,
        contato: contatoPara(canal),
        modelo: ModeloDeMensagem.criar("lembrete_agendamento_24h", { hora: "14:30" }),
      });

    it("declara ao menos um canal suportado", () => {
      expect(fabrica().canais.length).toBeGreaterThan(0);
    });

    it("aceita o envio e devolve id do provedor, canal e estado valido", async () => {
      const provedor = fabrica();
      const canal = provedor.canais[0] as CanalDeMensagem;
      const resultado = await provedor.enviar(novaMensagem(canal));
      expect(resultado.idNoProvedor.valor.length).toBeGreaterThan(0);
      expect(resultado.canal).toBe(canal);
      expect(["aceita", "entregue"]).toContain(resultado.estado);
    });

    it("e idempotente: repetir a mesma mensagem devolve o mesmo envio", async () => {
      const provedor = fabrica();
      const mensagem = novaMensagem(provedor.canais[0] as CanalDeMensagem);
      const primeiro = await provedor.enviar(mensagem);
      const segundo = await provedor.enviar(mensagem);
      expect(segundo.idNoProvedor.igual(primeiro.idNoProvedor)).toBe(true);
    });

    it("mensagens diferentes geram envios diferentes", async () => {
      const provedor = fabrica();
      const canal = provedor.canais[0] as CanalDeMensagem;
      const a = await provedor.enviar(novaMensagem(canal));
      const b = await provedor.enviar(novaMensagem(canal));
      expect(a.idNoProvedor.igual(b.idNoProvedor)).toBe(false);
    });

    it("consulta um envio existente pelo id do provedor", async () => {
      const provedor = fabrica();
      const enviado = await provedor.enviar(novaMensagem(provedor.canais[0] as CanalDeMensagem));
      const consultado = await provedor.consultar(enviado.idNoProvedor);
      expect(consultado.idNoProvedor.igual(enviado.idNoProvedor)).toBe(true);
    });

    it("recusa consultar envio desconhecido com EnvioNaoEncontradoError", async () => {
      const provedor = fabrica();
      await expect(provedor.consultar(IdDaMensagemNoProvedor.de("nao-existe-999"))).rejects.toThrow(
        EnvioNaoEncontradoError,
      );
    });

    it("recusa canal nao suportado com CanalNaoSuportadoError", async () => {
      const provedor = fabrica();
      const ausente = CANAIS_DE_MENSAGEM.find((c) => !provedor.canais.includes(c));
      if (ausente === undefined) return;
      await expect(provedor.enviar(novaMensagem(ausente))).rejects.toThrow(CanalNaoSuportadoError);
    });
  });
}
