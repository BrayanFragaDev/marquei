"use server";

import type { DadosDoTema } from "@marquei/design-tokens";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { ResultadoDaAcaoDeTema } from "../../../aplicacao/servico-de-tema";
import { ROTA_DE_LOGIN } from "../../../sessao/protecao-de-rotas";
import { obterContexto, type ContextoDoServidor } from "../../../servidor/contexto";

const SEM_PERMISSAO: ResultadoDaAcaoDeTema = {
  ok: false,
  motivo: "sem_permissao",
  detalhes: [],
};

async function executar(
  chamada: (contexto: ContextoDoServidor) => Promise<ResultadoDaAcaoDeTema>,
): Promise<ResultadoDaAcaoDeTema> {
  const contexto = await obterContexto();
  if (!contexto.permissoes.podeEditar("tema")) return SEM_PERMISSAO;
  const resultado = await chamada(contexto);
  if (!resultado.ok && resultado.motivo === "sessao_expirada") redirect(ROTA_DE_LOGIN);
  revalidatePath("/tema");
  return resultado;
}

export async function salvarRascunho(tema: DadosDoTema): Promise<ResultadoDaAcaoDeTema> {
  return executar((c) => c.temas.salvarRascunho(tema));
}

export async function publicarTema(): Promise<ResultadoDaAcaoDeTema> {
  return executar((c) => c.temas.publicar());
}

export async function restaurarPadrao(): Promise<ResultadoDaAcaoDeTema> {
  return executar((c) => c.temas.restaurarPadrao());
}
