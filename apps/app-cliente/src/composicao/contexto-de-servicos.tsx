"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { ArmazenamentoLocal } from "../adaptadores/armazenamento-local";
import {
  EstabelecimentoNaTela,
  type EstabelecimentoPublico,
} from "../apresentacao/estabelecimento-na-tela";
import { urlDaApi } from "../configuracao";
import { criarServicos, type Servicos } from "./servicos";

const Contexto = createContext<Servicos | null>(null);

export function ProvedorDeServicosPronto({
  servicos,
  children,
}: {
  servicos: Servicos;
  children: ReactNode;
}) {
  return <Contexto.Provider value={servicos}>{children}</Contexto.Provider>;
}

/** Monta os serviços do estabelecimento (api, sessão, mensagens) uma vez por navegação. */
export function ProvedorDeServicos({
  dados,
  children,
}: {
  dados: EstabelecimentoPublico;
  children: ReactNode;
}) {
  const servicos = useMemo(
    () =>
      criarServicos({
        estabelecimento: EstabelecimentoNaTela.criar(dados),
        urlDaApi: urlDaApi(),
        armazenamento: new ArmazenamentoLocal(),
      }),
    [dados],
  );
  return <ProvedorDeServicosPronto servicos={servicos}>{children}</ProvedorDeServicosPronto>;
}

export function useServicos(): Servicos {
  const servicos = useContext(Contexto);
  if (servicos === null) throw new TypeError("useServicos fora do ProvedorDeServicos.");
  return servicos;
}
