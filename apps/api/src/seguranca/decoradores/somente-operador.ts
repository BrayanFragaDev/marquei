import { SetMetadata } from "@nestjs/common";

export const ROTA_SOMENTE_OPERADOR = "marquei:rota-somente-operador";

/** A rota pertence ao console da plataforma: exige token da audiencia `console-plataforma`. */
export const SomenteOperador = (): MethodDecorator & ClassDecorator =>
  SetMetadata(ROTA_SOMENTE_OPERADOR, true);
