import type { ClienteDeTeste } from "./cliente-de-teste.js";
import type { EstabelecimentoDeTeste } from "./estabelecimento-de-teste.js";
import type { ProfissionalDeTeste } from "./profissional-de-teste.js";
import type { ServicoDeTeste } from "./servico-de-teste.js";

/** Tudo o que pertence a um unico estabelecimento de teste. */
export class CenarioDeTeste {
  constructor(
    readonly estabelecimento: EstabelecimentoDeTeste,
    readonly servico: ServicoDeTeste,
    readonly profissional: ProfissionalDeTeste,
    readonly cliente: ClienteDeTeste,
  ) {}

  /** Todos os ids do cenario, para provar que cenarios nao compartilham identificadores. */
  ids(): readonly string[] {
    return [this.estabelecimento.id, this.servico.id, this.profissional.id, this.cliente.id];
  }
}
