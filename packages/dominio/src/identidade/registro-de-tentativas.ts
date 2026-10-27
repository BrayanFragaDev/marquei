import type { Instante } from "../compartilhado/instante";
import type { ContadorDeTentativas } from "./contador-de-tentativas";

/**
 * Porta do estado de tentativas de login por chave. `registrarFalha` deve ser atomica
 * (implementacoes distribuidas usam operacao atomica do armazenamento).
 */
export interface RegistroDeTentativas {
  obter(chave: string): Promise<ContadorDeTentativas>;
  registrarFalha(chave: string, agora: Instante): Promise<void>;
  zerar(chave: string): Promise<void>;
}
