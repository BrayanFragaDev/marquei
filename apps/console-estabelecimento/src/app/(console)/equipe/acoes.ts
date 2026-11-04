"use server";

import { revalidatePath } from "next/cache";
import type { EstadoDaAcao } from "../../../aplicacao/estado-da-acao";
import { lerMembro } from "../../../aplicacao/leitores-de-formulario";
import { mensagens } from "../../../i18n/mensagens-pt-br";
import { executarAcao } from "../../../servidor/executar-acao";

const invalido: EstadoDaAcao = { status: "erro", mensagem: mensagens.login.dadosInvalidos };

async function aplicar(corpo: Parameters<typeof executarAcao>[1]): Promise<EstadoDaAcao> {
  const estado = await executarAcao({ secao: "equipe", sucesso: mensagens.comum.salvo }, corpo);
  revalidatePath("/equipe");
  return estado;
}

export async function criarMembro(_: EstadoDaAcao, dados: FormData): Promise<EstadoDaAcao> {
  const membro = lerMembro(dados);
  if (!membro) return invalido;
  return aplicar(async (c) => void (await c.equipe.criar(membro)));
}

export async function atualizarMembro(
  id: string,
  _: EstadoDaAcao,
  dados: FormData,
): Promise<EstadoDaAcao> {
  const membro = lerMembro(dados);
  if (!membro) return invalido;
  return aplicar(async (c) => void (await c.equipe.atualizar(id, membro)));
}

export async function desativarMembro(
  id: string,
): Promise<EstadoDaAcao> {
  return aplicar((c) => c.equipe.desativar(id));
}
