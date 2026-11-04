"use client";

import { Botao } from "@marquei/ui";
import { useInstalacaoDoApp } from "../ganchos/use-instalacao-do-app";
import { useServicos } from "../composicao/contexto-de-servicos";

/** Discreto: só aparece quando o navegador oferece a instalação. */
export function BotaoAdicionarATelaInicial() {
  const { mensagens } = useServicos();
  const { disponivel, instalar } = useInstalacaoDoApp();
  if (!disponivel) return null;
  return (
    <Botao variante="texto" onClick={instalar}>
      {mensagens.t("pwa.adicionarATelaInicial")}
    </Botao>
  );
}
