"use server";

import { revalidatePath } from "next/cache";
import type { EstadoDaAcao } from "../../../aplicacao/estado-da-acao";
import { lerServico } from "../../../aplicacao/leitores-de-formulario";
import { mensagens } from "../../../i18n/mensagens-pt-br";
import { executarAcao } from "../../../servidor/executar-acao";

const invalido: EstadoDaAcao = { status: "erro", mensagem: mensagens.login.dadosInvalidos };

async function aplicar(
  corpo: Parameters<typeof executarAcao>[1],
): Promise<EstadoDaAcao> {
  const estado = await executarAcao({ secao: "servicos", sucesso: mensagens.comum.salvo }, corpo);
  revalidatePath("/servicos");
  return estado;
}

export async function criarServico(_: EstadoDaAcao, dados: FormData): Promise<EstadoDaAcao> {
  const servico = lerServico(dados);
  if (!servico) return invalido;
  return aplicar(async (c) => void (await c.servicos.criar(servico)));
}

export async function atualizarServico(
  id: string,
  _: EstadoDaAcao,
  dados: FormData,
): Promise<EstadoDaAcao> {
  const servico = lerServico(dados);
  if (!servico) return invalido;
  return aplicar(async (c) => void (await c.servicos.atualizar(id, servico)));
}

export async function desativarServico(
  id: string,
): Promise<EstadoDaAcao> {
  return aplicar((c) => c.servicos.desativar(id));
}
