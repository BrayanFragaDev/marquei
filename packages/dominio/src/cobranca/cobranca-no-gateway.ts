import type { Dinheiro } from "../compartilhado/dinheiro";
import type { EstabelecimentoId, Identificador } from "../compartilhado/identificador";
import type { Instante } from "../compartilhado/instante";
import type { EstadoDaCobranca } from "./estado-da-cobranca";
import type { IdNoGateway } from "./id-no-gateway";
import { TransicaoDeCobrancaInvalidaError } from "./transicao-de-cobranca-invalida-error";

export interface DadosDaCobrancaNoGateway {
  readonly idNoGateway: IdNoGateway;
  readonly pedidoId: Identificador<"cobranca">;
  readonly estabelecimentoId: EstabelecimentoId;
  readonly valor: Dinheiro;
  readonly venceEm: Instante;
  readonly estado: EstadoDaCobranca;
  readonly pagaEm: Instante | null;
}

/** Cobranca avulsa como o gateway a conhece. Imutavel; mudancas devolvem nova instancia. */
export class CobrancaNoGateway {
  private constructor(private readonly dados: DadosDaCobrancaNoGateway) {}

  /** Usada pelos adaptadores ao traduzir a resposta do gateway. */
  static reconstituir(dados: DadosDaCobrancaNoGateway): CobrancaNoGateway {
    return new CobrancaNoGateway(dados);
  }

  get idNoGateway(): IdNoGateway {
    return this.dados.idNoGateway;
  }

  get pedidoId(): Identificador<"cobranca"> {
    return this.dados.pedidoId;
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

  get estado(): EstadoDaCobranca {
    return this.dados.estado;
  }

  get pagaEm(): Instante | null {
    return this.dados.pagaEm;
  }

  /** Pendente cujo vencimento ja passou. O gateway nao tem estado proprio para isso. */
  estaVencidaEm(agora: Instante): boolean {
    return this.dados.estado === "pendente" && this.dados.venceEm.antesDe(agora);
  }

  /** Idempotente para cobranca ja paga; cobranca cancelada nao pode ser paga. */
  marcarComoPaga(em: Instante): CobrancaNoGateway {
    if (this.dados.estado === "paga") return this;
    if (this.dados.estado === "cancelada") {
      throw new TransicaoDeCobrancaInvalidaError("cancelada", "paga");
    }
    return new CobrancaNoGateway({ ...this.dados, estado: "paga", pagaEm: em });
  }

  /** Idempotente para cobranca ja cancelada; cobranca paga nao pode ser cancelada. */
  cancelar(): CobrancaNoGateway {
    if (this.dados.estado === "cancelada") return this;
    if (this.dados.estado === "paga")
      throw new TransicaoDeCobrancaInvalidaError("paga", "cancelada");
    return new CobrancaNoGateway({ ...this.dados, estado: "cancelada" });
  }
}
