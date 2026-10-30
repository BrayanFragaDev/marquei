"use client";

import { useCallback, useEffect, useState } from "react";
import { ErroDaApi } from "../api/erro-da-api";

export type EstadoDeCarregamento<T> =
  | { readonly situacao: "carregando" }
  | { readonly situacao: "erro"; readonly codigo: string }
  | { readonly situacao: "pronto"; readonly dados: T };

export function codigoDoErro(erro: unknown): string {
  return erro instanceof ErroDaApi ? erro.codigo : "erro_desconhecido";
}

/** Executa uma leitura assíncrona e expõe carregando/erro/pronto. Sem regra: só orquestra. */
export function useCarregamento<T>(
  carregar: (() => Promise<T>) | null,
): readonly [EstadoDeCarregamento<T>, () => void] {
  const [estado, definir] = useState<EstadoDeCarregamento<T>>({ situacao: "carregando" });
  const [tentativa, definirTentativa] = useState(0);
  useEffect(() => {
    if (carregar === null) return;
    let ativo = true;
    definir({ situacao: "carregando" });
    carregar().then(
      (dados) => ativo && definir({ situacao: "pronto", dados }),
      (erro: unknown) => ativo && definir({ situacao: "erro", codigo: codigoDoErro(erro) }),
    );
    return () => {
      ativo = false;
    };
  }, [carregar, tentativa]);
  const recarregar = useCallback(() => definirTentativa((n) => n + 1), []);
  return [estado, recarregar];
}
