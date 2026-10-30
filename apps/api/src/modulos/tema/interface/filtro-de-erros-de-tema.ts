import { Catch, type ArgumentsHost, type ExceptionFilter } from "@nestjs/common";
import {
  ContrasteInsuficienteError,
  RascunhoDeTemaNaoEncontradoError,
  SemPermissaoParaAlterarTemaError,
  TemaInvalidoError,
} from "@marquei/design-tokens";
import type { ErroDeDominio } from "@marquei/dominio";
import type { RespostaHttp } from "../../../seguranca/requisicao-http";

type ErroDeTema =
  | ContrasteInsuficienteError
  | TemaInvalidoError
  | SemPermissaoParaAlterarTemaError
  | RascunhoDeTemaNaoEncontradoError;

interface Detalhe {
  readonly campo: string;
  readonly codigo: string;
  readonly mensagem?: string;
  readonly sugestao?: string;
}

const STATUS: Readonly<Record<string, number>> = {
  tema_invalido: 400,
  sem_permissao_para_alterar_tema: 403,
  rascunho_de_tema_nao_encontrado: 404,
  contraste_insuficiente: 422,
};

function detalhesDe(erro: ErroDeDominio): readonly Detalhe[] | undefined {
  if (erro instanceof ContrasteInsuficienteError) {
    return erro.problemas.map((p) => ({
      campo: p.campoAjustado,
      codigo: erro.codigo,
      mensagem: p.mensagem(),
      sugestao: p.corSugerida.valor,
    }));
  }
  if (erro instanceof TemaInvalidoError) {
    return erro.problemas.map((p) => ({
      campo: p.caminho,
      codigo: "valor_invalido",
      mensagem: p.mensagem,
    }));
  }
  return undefined;
}

/**
 * Erros do tema -> `{ codigo, mensagem, detalhes? }`. Em contraste reprovado, `detalhes` traz a
 * cor sugerida por campo para o editor aplicar a correcao.
 */
@Catch(
  ContrasteInsuficienteError,
  TemaInvalidoError,
  SemPermissaoParaAlterarTemaError,
  RascunhoDeTemaNaoEncontradoError,
)
export class FiltroDeErrosDeTema implements ExceptionFilter<ErroDeTema> {
  catch(erro: ErroDeTema, host: ArgumentsHost): void {
    const resposta = host.switchToHttp().getResponse<RespostaHttp>();
    const detalhes = detalhesDe(erro);
    resposta.status(STATUS[erro.codigo] ?? 422).json({
      codigo: erro.codigo,
      mensagem: erro.message,
      ...(detalhes ? { detalhes } : {}),
    });
  }
}
