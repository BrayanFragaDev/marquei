import { Catch, type ArgumentsHost, type ExceptionFilter } from "@nestjs/common";
import { ContaBloqueadaPorTentativasError, ErroDeDominio } from "@marquei/dominio";
import type { RespostaHttp } from "./requisicao-http";
import { statusDoCodigo } from "./status-de-erro";

const ERRO_INTERNO = 500;

/** ErroDeDominio -> `{ codigo, mensagem }` com o status HTTP do codigo. Erro interno nao vaza detalhes. */
@Catch(ErroDeDominio)
export class FiltroDeErrosDeDominio implements ExceptionFilter<ErroDeDominio> {
  catch(erro: ErroDeDominio, host: ArgumentsHost): void {
    const resposta = host.switchToHttp().getResponse<RespostaHttp>();
    const status = statusDoCodigo(erro.codigo);
    if (status >= ERRO_INTERNO) {
      resposta.status(status).json({ codigo: "erro_interno", mensagem: "Erro interno." });
      return;
    }
    const extra =
      erro instanceof ContaBloqueadaPorTentativasError ? { bloqueadoAte: erro.ate.paraIso() } : {};
    resposta.status(status).json({ codigo: erro.codigo, mensagem: erro.message, ...extra });
  }
}
