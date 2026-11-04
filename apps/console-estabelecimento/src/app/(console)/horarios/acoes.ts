"use server";

import { revalidatePath } from "next/cache";
import type { EstadoDaAcao } from "../../../aplicacao/estado-da-acao";
import { lerBloqueio, lerFolga, lerJanela } from "../../../aplicacao/leitores-de-formulario";
import { FusoDoEstabelecimento } from "../../../apresentacao/fuso-do-estabelecimento";
import { mensagens } from "../../../i18n/mensagens-pt-br";
import { executarAcao } from "../../../servidor/executar-acao";

const invalido: EstadoDaAcao = { status: "erro", mensagem: mensagens.login.dadosInvalidos };

async function aplicar(corpo: Parameters<typeof executarAcao>[1]): Promise<EstadoDaAcao> {
  const estado = await executarAcao({ secao: "horarios", sucesso: mensagens.comum.salvo }, corpo);
  revalidatePath("/horarios");
  return estado;
}

export async function adicionarJanela(
  profissionalId: string,
  _: EstadoDaAcao,
  dados: FormData,
): Promise<EstadoDaAcao> {
  const janela = lerJanela(dados);
  if (!janela) return invalido;
  return aplicar((c) => c.horarios.adicionarJanela({ profissionalId, ...janela }));
}

export async function adicionarFolga(
  profissionalId: string,
  _: EstadoDaAcao,
  dados: FormData,
): Promise<EstadoDaAcao> {
  const folga = lerFolga(dados);
  if (!folga) return invalido;
  return aplicar((c) => c.horarios.adicionarFolga({ profissionalId, ...folga }));
}

export async function adicionarBloqueio(
  profissionalId: string,
  _: EstadoDaAcao,
  dados: FormData,
): Promise<EstadoDaAcao> {
  const bloqueio = lerBloqueio(dados, new FusoDoEstabelecimento());
  if (!bloqueio) return invalido;
  return aplicar((c) => c.horarios.adicionarBloqueio({ profissionalId, ...bloqueio }));
}

export async function removerItem(
  tipo: "janela" | "folga" | "bloqueio",
  profissionalId: string,
  id: string,
): Promise<EstadoDaAcao> {
  return aplicar(async (c) => {
    if (tipo === "janela") await c.horarios.removerJanela(profissionalId, id);
    else if (tipo === "folga") await c.horarios.removerFolga(profissionalId, id);
    else await c.horarios.removerBloqueio(profissionalId, id);
  });
}
