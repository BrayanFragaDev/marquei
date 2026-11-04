"use client";

import { useEffect, useState } from "react";
import { useServicos } from "../composicao/contexto-de-servicos";
import type { SessaoDoCliente } from "../portas/autenticador-do-cliente";

/** Sessão do cliente, lida só no navegador (evita divergência entre servidor e cliente). */
export function useSessaoDoCliente(): { pronto: boolean; sessao: SessaoDoCliente | null } {
  const { autenticador, estabelecimento } = useServicos();
  const [estado, definir] = useState<{ pronto: boolean; sessao: SessaoDoCliente | null }>({
    pronto: false,
    sessao: null,
  });
  useEffect(() => {
    definir({ pronto: true, sessao: autenticador.sessao(estabelecimento.slug) });
  }, [autenticador, estabelecimento.slug]);
  return estado;
}
