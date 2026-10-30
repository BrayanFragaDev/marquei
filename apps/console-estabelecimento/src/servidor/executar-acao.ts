import type { EstadoDaAcao } from "../aplicacao/estado-da-acao";
import { FalhaDaApi } from "../api/falha-da-api";
import { mensagens } from "../i18n/mensagens-pt-br";
import type { SecaoDoConsole } from "../sessao/permissoes-do-papel";
import { aoFalharNaSessao, obterContexto, type ContextoDoServidor } from "./contexto";

interface Opcoes {
  readonly secao: SecaoDoConsole;
  /** Texto de sucesso (pode ter vocabulario). */
  readonly sucesso: string;
}

/**
 * Executa uma mutacao de tela: confere a permissao de interface, chama o caso de uso e traduz
 * falhas da API (401 -> login, 403 -> aviso). A API continua sendo a autoridade.
 */
export async function executarAcao(
  opcoes: Opcoes,
  corpo: (contexto: ContextoDoServidor) => Promise<void>,
): Promise<EstadoDaAcao> {
  const contexto = await obterContexto();
  const m = mensagens.erros;
  if (!contexto.permissoes.podeEditar(opcoes.secao)) {
    return { status: "erro", mensagem: m.semPermissao };
  }
  try {
    await corpo(contexto);
    return { status: "ok", mensagem: contexto.linguagem.aplicar(opcoes.sucesso) };
  } catch (erro) {
    if (erro instanceof FalhaDaApi && !erro.ehSessaoInvalida()) {
      return { status: "erro", mensagem: erro.ehSemPermissao() ? m.semPermissao : m.generico };
    }
    return aoFalharNaSessao(erro);
  }
}
