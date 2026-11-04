"use client";

import { useActionState } from "react";
import { ESTADO_INICIAL, type EstadoDaAcao } from "../aplicacao/estado-da-acao";
import { Aviso } from "./aviso";

export type AcaoDeFormulario = (estado: EstadoDaAcao, dados: FormData) => Promise<EstadoDaAcao>;

interface Props {
  readonly acao: AcaoDeFormulario;
  readonly rotuloDoBotao: string;
  readonly variante?: "primario" | "secundario" | "perigo";
  readonly children?: React.ReactNode;
  readonly classe?: string;
}

const CLASSE_DO_BOTAO = {
  primario: "botao",
  secundario: "botao botao--secundario",
  perigo: "botao botao--perigo",
} as const;

/** Formulario ligado a uma Server Action, com retorno de sucesso/erro. Sem regra de negocio. */
export function FormularioDeAcao({ acao, rotuloDoBotao, variante = "primario", children, classe }: Props) {
  const [estado, enviar, pendente] = useActionState(acao, ESTADO_INICIAL);
  return (
    <form action={enviar} className={classe ?? "formulario"}>
      {children}
      <button type="submit" className={CLASSE_DO_BOTAO[variante]} disabled={pendente}>
        {rotuloDoBotao}
      </button>
      {estado.status === "erro" ? <Aviso tipo="erro">{estado.mensagem}</Aviso> : null}
      {estado.status === "ok" ? <Aviso tipo="sucesso">{estado.mensagem}</Aviso> : null}
    </form>
  );
}
