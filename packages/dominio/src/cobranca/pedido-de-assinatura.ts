import type { Dinheiro } from "../compartilhado/dinheiro";
import type { EstabelecimentoId, Identificador } from "../compartilhado/identificador";
import type { Instante } from "../compartilhado/instante";
import { PedidoDeCobrancaInvalidoError } from "./pedido-de-cobranca-invalido-error";
import type { PeriodicidadeDeCobranca } from "./periodicidade-de-cobranca";

export interface DadosDoPedidoDeAssinatura {
  /** Chave de idempotencia: repetir o mesmo pedido nunca cria uma segunda assinatura. */
  readonly id: Identificador<"assinatura">;
  readonly estabelecimentoId: EstabelecimentoId;
  readonly planoId: Identificador<"plano">;
  /** Valor de cada ciclo, em centavos. */
  readonly valor: Dinheiro;
  readonly periodicidade: PeriodicidadeDeCobranca;
  readonly iniciaEm: Instante;
}

/** Pedido de assinatura recorrente de um estabelecimento. Imutavel. */
export class PedidoDeAssinatura {
  private constructor(private readonly dados: DadosDoPedidoDeAssinatura) {}

  static criar(dados: DadosDoPedidoDeAssinatura): PedidoDeAssinatura {
    if (dados.valor.ehZero()) {
      throw new PedidoDeCobrancaInvalidoError("o valor da assinatura deve ser maior que zero");
    }
    return new PedidoDeAssinatura(dados);
  }

  get id(): Identificador<"assinatura"> {
    return this.dados.id;
  }

  get estabelecimentoId(): EstabelecimentoId {
    return this.dados.estabelecimentoId;
  }

  get planoId(): Identificador<"plano"> {
    return this.dados.planoId;
  }

  get valor(): Dinheiro {
    return this.dados.valor;
  }

  get periodicidade(): PeriodicidadeDeCobranca {
    return this.dados.periodicidade;
  }

  get iniciaEm(): Instante {
    return this.dados.iniciaEm;
  }
}
