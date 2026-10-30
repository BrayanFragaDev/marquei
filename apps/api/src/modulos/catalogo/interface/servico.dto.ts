import type { Servico } from "@marquei/dominio";

export interface ServicoDto {
  id: string;
  nome: string;
  duracaoMinutos: number;
  precoCentavos: number;
}

export function servicoParaDto(s: Servico): ServicoDto {
  return {
    id: s.id.valor,
    nome: s.nome,
    duracaoMinutos: s.duracaoMinutos,
    precoCentavos: s.preco.centavos,
  };
}
