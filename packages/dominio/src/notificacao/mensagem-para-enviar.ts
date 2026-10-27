import type { EstabelecimentoId, Identificador } from "../compartilhado/identificador";
import type { CanalDeMensagem } from "./canal-de-mensagem";
import type { ContatoDeMensagem } from "./contato-de-mensagem";
import type { ModeloDeMensagem } from "./modelo-de-mensagem";

export interface DadosDaMensagem {
  /** Chave de idempotencia: reenviar a mesma mensagem (retry) nunca duplica o envio. */
  readonly id: Identificador<"mensagem">;
  readonly estabelecimentoId: EstabelecimentoId;
  readonly contato: ContatoDeMensagem;
  readonly modelo: ModeloDeMensagem;
}

/** Pedido de envio ja validado. Imutavel. */
export class MensagemParaEnviar {
  private constructor(
    readonly id: Identificador<"mensagem">,
    readonly estabelecimentoId: EstabelecimentoId,
    readonly contato: ContatoDeMensagem,
    readonly modelo: ModeloDeMensagem,
  ) {}

  static criar(dados: DadosDaMensagem): MensagemParaEnviar {
    return new MensagemParaEnviar(dados.id, dados.estabelecimentoId, dados.contato, dados.modelo);
  }

  get canal(): CanalDeMensagem {
    return this.contato.canal;
  }

  /** Mesma mensagem para outro contato (ex.: fallback de WhatsApp para SMS), com novo id. */
  paraContato(id: Identificador<"mensagem">, contato: ContatoDeMensagem): MensagemParaEnviar {
    return new MensagemParaEnviar(id, this.estabelecimentoId, contato, this.modelo);
  }
}
