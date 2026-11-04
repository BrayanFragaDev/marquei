import { Dinheiro } from "@marquei/dominio";

const formato = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function formatarDinheiro(centavos: number): string {
  return formato.format(Dinheiro.deCentavos(centavos).centavos / 100);
}

/** Converte o texto digitado ("45,50" ou "45.5") em centavos inteiros; `null` se invalido. */
export function centavosDoTexto(texto: string): number | null {
  const limpo = texto.trim().replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(limpo)) return null;
  const [reais = "0", fracao = ""] = limpo.split(".");
  return Number(reais) * 100 + Number(fracao.padEnd(2, "0"));
}

/** Valor editavel ("45,00") a partir de centavos inteiros, sem ponto flutuante. */
export function textoEditavelDeCentavos(centavos: number): string {
  const reais = Math.trunc(centavos / 100);
  const resto = String(centavos % 100).padStart(2, "0");
  return `${reais},${resto}`;
}
