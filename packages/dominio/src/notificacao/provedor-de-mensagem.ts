import type { CanalDeMensagem } from "./canal-de-mensagem";
import type { IdDaMensagemNoProvedor } from "./id-da-mensagem-no-provedor";
import type { MensagemParaEnviar } from "./mensagem-para-enviar";
import type { ResultadoDoEnvio } from "./resultado-do-envio";

/**
 * Porta de envio de mensagens (push, WhatsApp, SMS/OTP, e-mail). Cada adaptador real vive na
 * infraestrutura e roda o teste de contrato `testarContratoDoProvedorDeMensagem`.
 *
 * Contrato:
 * - `enviar` e idempotente por `mensagem.id`: repetir devolve o mesmo envio, sem reenviar.
 * - Canal fora de `canais` lanca `CanalNaoSuportadoError`.
 * - Falha transitoria lanca `ProvedorDeMensagemIndisponivelError`; falha definitiva,
 *   `MensagemRejeitadaPeloProvedorError`.
 * - `consultar` de id desconhecido lanca `EnvioNaoEncontradoError`.
 */
export interface ProvedorDeMensagem {
  readonly canais: readonly CanalDeMensagem[];
  enviar(mensagem: MensagemParaEnviar): Promise<ResultadoDoEnvio>;
  consultar(id: IdDaMensagemNoProvedor): Promise<ResultadoDoEnvio>;
}
