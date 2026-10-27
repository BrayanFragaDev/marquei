import {
  Injectable,
  type CallHandler,
  type ExecutionContext,
  type NestInterceptor,
} from "@nestjs/common";
import { defer, from, lastValueFrom, type Observable } from "rxjs";
import type { Sessao } from "@marquei/dominio";
import { ExecutorTransacional, type ContextoDeAcesso } from "../nucleo";
import type { RequisicaoHttp } from "./requisicao-http";
import { exigirSemDivergencia } from "./tenant-informado";

function contextoDe(sessao: Sessao, requisicao: RequisicaoHttp): ContextoDeAcesso {
  const tenant = sessao.tenant;
  if (tenant === null) return { papel: "app_plataforma" };
  exigirSemDivergencia(requisicao, tenant);
  return { papel: "app_usuario", tenant };
}

/**
 * Em rota autenticada, o tenant e o papel vem SOMENTE da sessao verificada pelo guard. Abre a
 * transacao (`SET LOCAL ROLE` + `app.estabelecimento_id`) envolvendo o handler, de modo que a
 * RLS do banco vale para tudo que a rota fizer. Rota publica nao tem sessao: passa direto.
 */
@Injectable()
export class InterceptorDeTenant implements NestInterceptor {
  constructor(private readonly executor: ExecutorTransacional) {}

  intercept(contexto: ExecutionContext, proximo: CallHandler): Observable<unknown> {
    const requisicao = contexto.switchToHttp().getRequest<RequisicaoHttp>();
    const sessao = requisicao.sessao;
    if (!sessao) return proximo.handle();
    return defer(() => {
      const acesso = contextoDe(sessao, requisicao);
      return from(
        this.executor.executar(acesso, () =>
          lastValueFrom(proximo.handle(), { defaultValue: undefined }),
        ),
      );
    });
  }
}
