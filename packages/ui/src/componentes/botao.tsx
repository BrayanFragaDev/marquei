import type { ButtonHTMLAttributes } from "react";

export type VarianteDoBotao = "primario" | "secundario" | "texto";

export interface PropriedadesDoBotao extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "className"
> {
  readonly variante?: VarianteDoBotao;
  readonly larguraTotal?: boolean;
}

/** Classes do botão, para links (`<a>`, `next/link`) que precisam do mesmo visual. */
export function classesDoBotao(
  variante: VarianteDoBotao = "primario",
  larguraTotal = false,
): string {
  return ["mq-botao", `mq-botao--${variante}`, larguraTotal ? "mq-botao--total" : ""]
    .filter(Boolean)
    .join(" ");
}

export function Botao({
  variante = "primario",
  larguraTotal = false,
  type = "button",
  ...resto
}: PropriedadesDoBotao) {
  return <button {...resto} type={type} className={classesDoBotao(variante, larguraTotal)} />;
}
