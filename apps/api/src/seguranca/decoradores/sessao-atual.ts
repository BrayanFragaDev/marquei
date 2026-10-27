import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import { SessaoInvalidaError, type Sessao } from "@marquei/dominio";
import type { RequisicaoHttp } from "../requisicao-http";

/** Injeta a sessao verificada no parametro do handler. Falha em rota publica (nao ha sessao). */
export const SessaoAtual = createParamDecorator(
  (_dados: unknown, contexto: ExecutionContext): Sessao => {
    const sessao = contexto.switchToHttp().getRequest<RequisicaoHttp>().sessao;
    if (!sessao) throw new SessaoInvalidaError();
    return sessao;
  },
);
