"use server";

import { criarClienteDaApi } from "@marquei/api-client";
import { redirect } from "next/navigation";
import type { EstadoDaAcao } from "../../aplicacao/estado-da-acao";
import {
  ServicoDeAutenticacao,
  type MotivoDeFalhaNoLogin,
} from "../../aplicacao/servico-de-autenticacao";
import { urlDaApi } from "../../configuracao/ambiente";
import { mensagens } from "../../i18n/mensagens-pt-br";
import { PermissoesDoPapel } from "../../sessao/permissoes-do-papel";
import { apagarSessao, gravarSessao } from "../../servidor/cookie-da-sessao";

const TEXTO_POR_MOTIVO: Readonly<Record<MotivoDeFalhaNoLogin, string>> = {
  credenciais_invalidas: mensagens.login.credenciaisInvalidas,
  conta_bloqueada: mensagens.login.contaBloqueada,
  dados_invalidos: mensagens.login.dadosInvalidos,
};

const texto = (dados: FormData, campo: string): string => {
  const valor = dados.get(campo);
  return typeof valor === "string" ? valor.trim() : "";
};

export async function entrar(_anterior: EstadoDaAcao, dados: FormData): Promise<EstadoDaAcao> {
  const servico = new ServicoDeAutenticacao(criarClienteDaApi({ urlBase: urlDaApi() }));
  const resultado = await servico.entrar({
    estabelecimento: texto(dados, "estabelecimento").toLowerCase(),
    email: texto(dados, "email"),
    senha: String(dados.get("senha") ?? ""),
  });
  if (!resultado.ok) return { status: "erro", mensagem: TEXTO_POR_MOTIVO[resultado.motivo] };
  await gravarSessao(resultado.sessao);
  return redirect(new PermissoesDoPapel(resultado.sessao.papel).rotaInicial());
}

export async function sair(): Promise<void> {
  await apagarSessao();
  redirect("/login");
}
