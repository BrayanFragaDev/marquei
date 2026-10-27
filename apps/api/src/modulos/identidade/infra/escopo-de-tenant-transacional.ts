import type { EstabelecimentoId } from "@marquei/dominio";
import type { ExecutorTransacional } from "../../../nucleo";
import type { EscopoDeTenant } from "../aplicacao/escopo-de-tenant";

export class EscopoDeTenantTransacional implements EscopoDeTenant {
  constructor(private readonly executor: ExecutorTransacional) {}

  noTenant<T>(tenant: EstabelecimentoId, acao: () => Promise<T>): Promise<T> {
    return this.executor.executar({ papel: "app_usuario", tenant }, acao);
  }
}
