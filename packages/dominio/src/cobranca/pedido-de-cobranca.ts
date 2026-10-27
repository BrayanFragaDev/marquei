import type { Dinheiro } from "../compartilhado/dinheiro";
import type { EstabelecimentoId, Identificador } from "../compartilhado/identificador";
import type { Instante } from "../compartilhado/instante";
import { PedidoDeCobrancaInvalidoError } from "./pedido-de-cobranca-invalido-error";

const TAMANHO_MAXIMO_DA_DESCRICAO = 140;

export interface DadosDoPedidoDeCobranca {
  /** Chave de idempotencia: repetir o mesmo pedido nunca cria uma segunda cobranca. */
  readonly id: Identificador<"cobranca">;
  readonly estabelecimentoId: EstabelecimentoId;
  readonly valor: Dinheiro;
  readonly venceEm: Instante;
  /** Texto curto exibido na fatura; sem dado pessoal. */
  readonly descricao: string;
}

/** Pedido de cobranca avulsa (ex.: fatura de ciclo, ajuste pro-rata). Imutavel. */
export class PedidoDeCobranca {
  private constructor(private readonly dados: DadosDoPedidoDeCobranca) {}

  static criar(dados: DadosDoPedidoDeCobranca): PedidoDeCobranca {
    if (dados.valor.ehZero()) {
      throw new PedidoDeCobrancaInvalidoError("o valor da cobranca deve ser maior que zero");
    }
    const descricao = dados.descricao.trim();
    if (descricao.length === 0 || descricao.length > TAMANHO_MAXIMO_DA_DESCRICAO) {
      throw new PedidoDeCobrancaInvalidoError("a descricao deve ter de 1 a 140 caracteres");
    }
    return new PedidoDeCobranca({ ...dados, descricao });
  }

  get id(): Identificador<"cobranca"> {
    return this.dados.id;
  }

  get estabelecimentoId(): EstabelecimentoId {
    return this.dados.estabelecimentoId;
  }

  get valor(): Dinheiro {
    return this.dados.valor;
  }

  get venceEm(): Instante {
    return this.dados.venceEm;
  }

  get descricao(): string {
    return this.dados.descricao;
  }
}
