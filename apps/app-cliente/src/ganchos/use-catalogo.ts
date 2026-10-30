"use client";

import { useCallback } from "react";
import type { Servico } from "../api/gateway-da-api";
import { useServicos } from "../composicao/contexto-de-servicos";
import { useCarregamento, type EstadoDeCarregamento } from "./use-carregamento";

export function useServicosDoCatalogo(): readonly [
  EstadoDeCarregamento<readonly Servico[]>,
  () => void,
] {
  const { gatewayDoCliente } = useServicos();
  const carregar = useCallback(() => gatewayDoCliente.listarServicos(), [gatewayDoCliente]);
  return useCarregamento(carregar);
}
