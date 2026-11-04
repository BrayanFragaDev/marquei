"use client";

import { useEffect, useMemo, type CSSProperties, type ReactNode } from "react";
import {
  EstabelecimentoNaTela,
  type EstabelecimentoPublico,
} from "../apresentacao/estabelecimento-na-tela";

/**
 * Aplica o tema PUBLICADO: variáveis CSS na raiz do documento (e no invólucro, para já sair
 * pintado do servidor) e carrega a família tipográfica curada por <link>, em tempo de execução.
 */
export function ProvedorDeTema({
  dados,
  children,
}: {
  dados: EstabelecimentoPublico;
  children: ReactNode;
}) {
  const estabelecimento = useMemo(() => EstabelecimentoNaTela.criar(dados), [dados]);
  const { variaveisCss } = estabelecimento;
  useEffect(() => {
    const raiz = document.documentElement;
    for (const [nome, valor] of Object.entries(variaveisCss)) raiz.style.setProperty(nome, valor);
    return () => {
      for (const nome of Object.keys(variaveisCss)) raiz.style.removeProperty(nome);
    };
  }, [variaveisCss]);
  return (
    <div data-tema={dados.slug} style={variaveisCss as CSSProperties}>
      <link rel="stylesheet" href={estabelecimento.urlDaFonte} precedence="tema" />
      {children}
    </div>
  );
}
