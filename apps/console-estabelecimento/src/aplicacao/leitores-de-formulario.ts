import { centavosDoTexto } from "../apresentacao/formatador-de-dinheiro";
import { minutosDaHora } from "../apresentacao/hora-do-dia";
import type { FusoDoEstabelecimento } from "../apresentacao/fuso-do-estabelecimento";
import type { DadosDoMembro, DadosDoServico } from "../contratos/catalogo";

/** Leitura e validacao de borda dos formularios; `null` significa entrada invalida. */
export const texto = (dados: FormData, campo: string): string => {
  const valor = dados.get(campo);
  return typeof valor === "string" ? valor.trim() : "";
};

export function lerServico(dados: FormData): DadosDoServico | null {
  const nome = texto(dados, "nome");
  const duracaoMinutos = Number(texto(dados, "duracaoMinutos"));
  const precoCentavos = centavosDoTexto(texto(dados, "preco"));
  if (nome === "" || nome.length > 80) return null;
  if (!Number.isInteger(duracaoMinutos) || duracaoMinutos < 5 || duracaoMinutos > 600) return null;
  if (precoCentavos === null) return null;
  return { nome, duracaoMinutos, precoCentavos };
}

export function lerMembro(dados: FormData): DadosDoMembro | null {
  const nome = texto(dados, "nome");
  const papel = texto(dados, "papel");
  if (nome === "" || nome.length > 80) return null;
  if (papel !== "profissional" && papel !== "gestor") return null;
  return { nome, papel };
}

export function lerJanela(dados: FormData) {
  const diaDaSemana = Number(texto(dados, "diaDaSemana"));
  const inicioMinutos = minutosDaHora(texto(dados, "de"));
  const fimMinutos = minutosDaHora(texto(dados, "ate"));
  if (!Number.isInteger(diaDaSemana) || diaDaSemana < 0 || diaDaSemana > 6) return null;
  if (inicioMinutos === null || fimMinutos === null || fimMinutos <= inicioMinutos) return null;
  return { diaDaSemana, inicioMinutos, fimMinutos };
}

const DIA_CIVIL = /^\d{4}-\d{2}-\d{2}$/;

export function lerFolga(dados: FormData) {
  const dia = texto(dados, "data");
  if (!DIA_CIVIL.test(dia)) return null;
  return { dia, motivo: texto(dados, "motivo") };
}

export function lerBloqueio(dados: FormData, fuso: FusoDoEstabelecimento) {
  const inicio = fuso.paraUtc(texto(dados, "inicio"));
  const fim = fuso.paraUtc(texto(dados, "fim"));
  if (inicio === null || fim === null || fim <= inicio) return null;
  return { inicio, fim, motivo: texto(dados, "motivo") };
}
