import type { Dinheiro } from "../compartilhado/dinheiro";
import type { EstabelecimentoId, Identificador } from "../compartilhado/identificador";
import type { Instante } from "../compartilhado/instante";
import type { EstadoDaAssinatura } from "./estado-da-assinatura";
import type { IdNoGateway } from "./id-no-gateway";
import type { PeriodicidadeDeCobranca } from "./periodicidade-de-cobranca";

export interface DadosDaAssinaturaNoGateway {
  readonly idNoGateway: IdNoGateway;
  readonly pedidoId: Identificador<"assinatura">;
  readonly estabelecimentoId: EstabelecimentoId;
  readonly valor: Dinheiro;
  readonly periodicidade: PeriodicidadeDeCobranca;
  readonly estado: EstadoDaAssinatura;
  readonly proximaCobrancaEm: Instante | null;
  readonly canceladaEm: Instante | null;
}

/** Assinatura como o gateway a conhece. Imutavel; mudancas devolvem nova instancia. */
export class AssinaturaNoGateway {
  private constructor(private readonly dados: DadosDaAssinaturaNoGateway) {}

  /** Usada pelos adaptadores ao traduzir a resposta do gateway. */
  static reconstituir(dados: DadosDaAssinaturaNoGateway): AssinaturaNoGateway {
    return new AssinaturaNoGateway(dados);
  }

  get idNoGateway(): IdNoGateway {
    return this.dados.idNoGateway;
  }

  get pedidoId(): Identificador<"assinatura"> {
    return this.dados.pedidoId;
  }

  get estabelecimentoId(): EstabelecimentoId {
    return this.dados.estabelecimentoId;
  }

  get valor(): Dinheiro {
    return this.dados.valor;
  }

  get periodicidade(): PeriodicidadeDeCobranca {
    return this.dados.periodicidade;
  }

  get estado(): EstadoDaAssinatura {
    return this.dados.estado;
  }

  get proximaCobrancaEm(): Instante | null {
    return this.dados.proximaCobrancaEm;
  }

  get canceladaEm(): Instante | null {
    return this.dados.canceladaEm;
  }

  ehCancelada(): boolean {
    return this.dados.estado === "cancelada";
  }

  estaEmAtraso(): boolean {
    return this.dados.estado === "em_atraso";
  }

  /** Idempotente: cancelar uma assinatura ja cancelada devolve a mesma, sem mudar a data. */
  cancelar(em: Instante): AssinaturaNoGateway {
    if (this.ehCancelada()) return this;
    return new AssinaturaNoGateway({
      ...this.dados,
      estado: "cancelada",
      proximaCobrancaEm: null,
      canceladaEm: em,
    });
  }
}
