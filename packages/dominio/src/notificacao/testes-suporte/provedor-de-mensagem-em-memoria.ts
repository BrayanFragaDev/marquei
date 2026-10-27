import type { Relogio } from "../../compartilhado/relogio";
import { CanalNaoSuportadoError } from "../canal-nao-suportado-error";
import type { CanalDeMensagem } from "../canal-de-mensagem";
import { EnvioNaoEncontradoError } from "../envio-nao-encontrado-error";
import { IdDaMensagemNoProvedor } from "../id-da-mensagem-no-provedor";
import type { MensagemParaEnviar } from "../mensagem-para-enviar";
import { ProvedorDeMensagemIndisponivelError } from "../provedor-de-mensagem-indisponivel-error";
import type { ProvedorDeMensagem } from "../provedor-de-mensagem";
import { ResultadoDoEnvio } from "../resultado-do-envio";

/** Fake de teste: guarda tudo em memoria e permite simular entrega, falha e indisponibilidade. */
export class ProvedorDeMensagemEmMemoria implements ProvedorDeMensagem {
  private readonly porMensagem = new Map<string, ResultadoDoEnvio>();
  private readonly porIdNoProvedor = new Map<string, ResultadoDoEnvio>();
  private readonly mensagens: MensagemParaEnviar[] = [];
  private indisponivel = false;
  private sequencia = 0;

  constructor(
    private readonly relogio: Relogio,
    readonly canais: readonly CanalDeMensagem[] = ["sms", "whatsapp", "push", "email"],
  ) {}

  async enviar(mensagem: MensagemParaEnviar): Promise<ResultadoDoEnvio> {
    if (!this.canais.includes(mensagem.canal)) throw new CanalNaoSuportadoError(mensagem.canal);
    if (this.indisponivel) throw new ProvedorDeMensagemIndisponivelError();
    const existente = this.porMensagem.get(mensagem.id.valor);
    if (existente) return existente;
    this.sequencia += 1;
    const id = IdDaMensagemNoProvedor.de(`fake-${this.sequencia}`);
    const resultado = ResultadoDoEnvio.aceito(id, mensagem.canal, this.relogio.agora());
    this.mensagens.push(mensagem);
    this.registrar(mensagem.id.valor, resultado);
    return resultado;
  }

  async consultar(id: IdDaMensagemNoProvedor): Promise<ResultadoDoEnvio> {
    const resultado = this.porIdNoProvedor.get(id.valor);
    if (!resultado) throw new EnvioNaoEncontradoError();
    return resultado;
  }

  /** Mensagens efetivamente aceitas, na ordem (sem duplicatas de retry). */
  enviadas(): readonly MensagemParaEnviar[] {
    return [...this.mensagens];
  }

  tornarIndisponivel(): void {
    this.indisponivel = true;
  }

  tornarDisponivel(): void {
    this.indisponivel = false;
  }

  simularEntrega(id: IdDaMensagemNoProvedor): void {
    this.atualizar(id, (atual) => atual.marcarComoEntregue(this.relogio.agora()));
  }

  simularFalha(id: IdDaMensagemNoProvedor, motivo: string): void {
    this.atualizar(id, (atual) => atual.marcarComoFalha(motivo, this.relogio.agora()));
  }

  private atualizar(
    id: IdDaMensagemNoProvedor,
    mudar: (atual: ResultadoDoEnvio) => ResultadoDoEnvio,
  ): void {
    const atual = this.porIdNoProvedor.get(id.valor);
    if (!atual) throw new EnvioNaoEncontradoError();
    const novo = mudar(atual);
    this.porIdNoProvedor.set(id.valor, novo);
    for (const [chave, resultado] of this.porMensagem) {
      if (resultado.idNoProvedor.igual(id)) this.porMensagem.set(chave, novo);
    }
  }

  private registrar(idDaMensagem: string, resultado: ResultadoDoEnvio): void {
    this.porMensagem.set(idDaMensagem, resultado);
    this.porIdNoProvedor.set(resultado.idNoProvedor.valor, resultado);
  }
}
