"use client";

import { Botao } from "@marquei/ui";
import type { ReactNode } from "react";
import { useServicos } from "../composicao/contexto-de-servicos";
import type { EstadoDeCarregamento } from "../ganchos/use-carregamento";

/** Mostra carregando, erro (com "tentar de novo") ou o conteúdo pronto. */
export function Carregavel<T>({
  estado,
  aoTentarDeNovo,
  children,
}: {
  estado: EstadoDeCarregamento<T>;
  aoTentarDeNovo: () => void;
  children: (dados: T) => ReactNode;
}) {
  const { mensagens } = useServicos();
  if (estado.situacao === "carregando")
    return <p role="status">{mensagens.t("estado.carregando")}</p>;
  if (estado.situacao === "erro") {
    return (
      <div role="alert" className="mq-secao">
        <p className="mq-aviso">{mensagens.paraErro(estado.codigo)}</p>
        <Botao variante="secundario" onClick={aoTentarDeNovo}>
          {mensagens.t("estado.tentarDeNovo")}
        </Botao>
      </div>
    );
  }
  return <>{children(estado.dados)}</>;
}
