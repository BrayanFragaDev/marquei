import { BadRequestException } from "@nestjs/common";
import { DiaCivil, ProfissionalId, ServicoId, type HorarioLivre } from "@marquei/dominio";
import type { EntradaDeConsultarHorariosLivres } from "../aplicacao/consultar-horarios-livres";
import type { SaidaDeConsultarHorariosLivres } from "../aplicacao/consultar-horarios-livres";

export interface HorariosLivresDto {
  data: string;
  fusoHorario: string;
  itens: { profissionalId: string; inicio: string; fim: string }[];
}

function texto(
  consulta: Record<string, unknown>,
  campo: string,
  obrigatorio: boolean,
): string | null {
  const valor = consulta[campo];
  if (valor === undefined && !obrigatorio) return null;
  if (typeof valor !== "string" || valor === "") {
    throw new BadRequestException({
      codigo: "requisicao_invalida",
      mensagem: "Parametros invalidos.",
      detalhes: [{ campo, codigo: "invalido" }],
    });
  }
  return valor;
}

/** Valida a query na borda e converte em objetos de valor. O tenant NAO vem daqui: vem do token. */
export function entradaDeHorariosLivres(
  consulta: unknown,
  estabelecimentoId: EntradaDeConsultarHorariosLivres["estabelecimentoId"],
): EntradaDeConsultarHorariosLivres {
  const dados = (typeof consulta === "object" && consulta !== null ? consulta : {}) as Record<
    string,
    unknown
  >;
  const profissional = texto(dados, "profissionalId", false);
  return {
    estabelecimentoId,
    servicoId: ServicoId.de(texto(dados, "servicoId", true) ?? ""),
    profissionalId: profissional === null ? null : ProfissionalId.de(profissional),
    dia: DiaCivil.deTexto(texto(dados, "data", true) ?? ""),
  };
}

function itemParaDto(h: HorarioLivre): HorariosLivresDto["itens"][number] {
  return {
    profissionalId: h.profissionalId.valor,
    inicio: h.inicio.paraIso(),
    fim: h.fim.paraIso(),
  };
}

export function horariosLivresParaDto(s: SaidaDeConsultarHorariosLivres): HorariosLivresDto {
  return {
    data: s.dia.paraTexto(),
    fusoHorario: s.fusoHorario,
    itens: s.horarios.map(itemParaDto),
  };
}
