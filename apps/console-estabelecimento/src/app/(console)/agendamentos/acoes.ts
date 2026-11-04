"use server";

import { revalidatePath } from "next/cache";
import type { EstadoDaAcao } from "../../../aplicacao/estado-da-acao";
import { mensagens } from "../../../i18n/mensagens-pt-br";
import { executarAcao } from "../../../servidor/executar-acao";

/** Dono, gestor e profissional cancelam; a API decide (403/404/409) e o prazo nao vale para eles. */
export async function cancelarAgendamento(
  id: string,
): Promise<EstadoDaAcao> {
  const estado = await executarAcao(
    { secao: "agendamentos", sucesso: mensagens.agendamentos.cancelado },
    async (contexto) => void (await contexto.agendamentos.cancelar(id)),
  );
  revalidatePath("/agendamentos");
  return estado;
}
