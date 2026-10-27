import { SetMetadata } from "@nestjs/common";

export const ROTA_PUBLICA = "marquei:rota-publica";

/**
 * Marca a rota (ou o controller) como aberta, sem autenticacao. Toda rota SEM esta marca exige
 * sessao valida (guard global). A varredura de rotas lista as publicas: acrescentar uma e uma
 * decisao explicita de revisao.
 */
export const Publica = (): MethodDecorator & ClassDecorator => SetMetadata(ROTA_PUBLICA, true);
