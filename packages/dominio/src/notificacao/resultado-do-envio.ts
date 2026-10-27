import type { Instante } from "../compartilhado/instante";
import type { CanalDeMensagem } from "./canal-de-mensagem";
import type { EstadoDaMensagem } from "./estado-da-mensagem";
import type { IdDaMensagemNoProvedor } from "./id-da-mensagem-no-provedor";
import { TransicaoDeEnvioInvalidaError } from "./transicao-de-envio-invalida-error";

export interface DadosDoResultado {
  readonly idNoProvedor: IdDaMensagemNoProvedor;
  readonly canal: CanalDeMensagem;
  readonly estado: EstadoDaMensagem;
  readonly atualizadoEm: Instante;
  readonly motivoDaFalha: string | null;
}

/** Situacao de um envio no provedor. Imutavel; cada mudanca de estado devolve nova instancia. */
export class ResultadoDoEnvio {
  private constructor(private readonly dados: DadosDoResultado) {}

  static aceito(
    idNoProvedor: IdDaMensagemNoProvedor,
    canal: CanalDeMensagem,
    em: Instante,
  ): ResultadoDoEnvio {
    return new ResultadoDoEnvio({
      idNoProvedor,
      canal,
      estado: "aceita",
      atualizadoEm: em,
      motivoDaFalha: null,
    });
  }

  /** Para adaptadores que leem o estado atual do provedor (ex.: webhook, consulta). */
  static reconstituir(dados: DadosDoResultado): ResultadoDoEnvio {
    if ((dados.estado === "falhou") !== (dados.motivoDaFalha !== null)) {
      throw new TransicaoDeEnvioInvalidaError(dados.estado, "falhou");
    }
    return new ResultadoDoEnvio(dados);
  }

  get idNoProvedor(): IdDaMensagemNoProvedor {
    return this.dados.idNoProvedor;
  }

  get canal(): CanalDeMensagem {
    return this.dados.canal;
  }

  get estado(): EstadoDaMensagem {
    return this.dados.estado;
  }

  get atualizadoEm(): Instante {
    return this.dados.atualizadoEm;
  }

  get motivoDaFalha(): string | null {
    return this.dados.motivoDaFalha;
  }

  ehFinal(): boolean {
    return this.dados.estado !== "aceita";
  }

  marcarComoEntregue(em: Instante): ResultadoDoEnvio {
    if (this.dados.estado === "entregue") return this;
    this.exigirNaoFinal("entregue");
    return new ResultadoDoEnvio({ ...this.dados, estado: "entregue", atualizadoEm: em });
  }

  marcarComoFalha(motivo: string, em: Instante): ResultadoDoEnvio {
    this.exigirNaoFinal("falhou");
    return new ResultadoDoEnvio({
      ...this.dados,
      estado: "falhou",
      atualizadoEm: em,
      motivoDaFalha: motivo,
    });
  }

  private exigirNaoFinal(para: EstadoDaMensagem): void {
    if (this.ehFinal()) throw new TransicaoDeEnvioInvalidaError(this.dados.estado, para);
  }
}
