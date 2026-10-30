import type { components } from "../src/gerado/schema.ts";

type Esquemas = components["schemas"];

/** Dados de exemplo FIXOS (sem sorteio, sem relogio): duas execucoes dao exatamente as mesmas respostas. */
export const AGORA_PADRAO = "2026-10-26T12:00:00.000Z"; // segunda-feira, 09:00 em Sao Paulo
export const MINUTOS_DE_ANTECEDENCIA_PARA_CANCELAR = 120;
export const PASSO_DA_AGENDA_MINUTOS = 30;
export const SENHA_DO_MOCK = "senha-mock-123";

const uuid = (bloco: string, n: number): string =>
  `${bloco}-0000-4000-8000-${String(n).padStart(12, "0")}`;

export interface TenantDoMock {
  readonly estabelecimento: Omit<Esquemas["EstabelecimentoPublico"], "tema"> & {
    tema: Esquemas["TemaPublicado"];
  };
  readonly dono: { readonly email: string; readonly usuarioId: string };
  readonly servicos: readonly Esquemas["Servico"][];
  readonly profissionais: readonly { readonly id: string; readonly nome: string }[];
}

function servicos(
  bloco: string,
  itens: readonly [string, number, number][],
): Esquemas["Servico"][] {
  return itens.map(([nome, duracaoMinutos, precoCentavos], i) => ({
    id: uuid(bloco, i + 1),
    nome,
    duracaoMinutos,
    precoCentavos,
  }));
}

const temaDoZe: Esquemas["TemaTokens"] = {
  cores: {
    primaria: "#1d3557",
    textoSobrePrimaria: "#ffffff",
    apoio: "#b3261e",
    fundo: "#f6f7f9",
    superficie: "#ffffff",
    texto: "#14181f",
    textoSuave: "#4a5260",
  },
  familia: "inter",
  raio: "suave",
  densidade: "confortavel",
  cabecalho: "simples",
  cartaoDeServico: "lista",
  textos: {
    boasVindas: "Bem-vindo a Barbearia do Ze",
    confirmacao: "Agendamento confirmado. Te esperamos!",
  },
  vocabulario: {
    profissional: { singular: "barbeiro", plural: "barbeiros" },
    servico: { singular: "servico", plural: "servicos" },
    agendamento: { singular: "horario", plural: "horarios" },
  },
};

const temaDaAurora: Esquemas["TemaTokens"] = {
  cores: {
    primaria: "#7a2e5c",
    textoSobrePrimaria: "#ffffff",
    apoio: "#b45309",
    fundo: "#fbf5f8",
    superficie: "#ffffff",
    texto: "#26171f",
    textoSuave: "#5b4551",
  },
  familia: "playfair-display",
  raio: "arredondado",
  densidade: "confortavel",
  cabecalho: "capa",
  cartaoDeServico: "destaque",
  textos: {
    boasVindas: "Studio Aurora, o seu momento",
    confirmacao: "Tudo certo! Seu horario esta reservado.",
  },
  vocabulario: {
    profissional: { singular: "cabeleireira", plural: "cabeleireiras" },
    servico: { singular: "procedimento", plural: "procedimentos" },
    agendamento: { singular: "horario", plural: "horarios" },
  },
};

export const TENANTS: readonly TenantDoMock[] = [
  {
    estabelecimento: {
      id: uuid("e1000000", 1),
      slug: "barbearia-do-ze",
      nome: "Barbearia do Ze",
      vertical: "barbearia",
      vocabulario: {
        profissional: "barbeiro",
        servico: "servico",
        cliente: "cliente",
        estabelecimento: "barbearia",
      },
      fusoHorario: "America/Sao_Paulo",
      tema: { versao: 2, tokens: temaDoZe },
    },
    dono: { email: "dono@barbearia-do-ze.exemplo.test", usuarioId: uuid("d1000000", 1) },
    servicos: servicos("51000000", [
      ["Corte masculino", 30, 4500],
      ["Barba", 30, 3500],
      ["Corte e barba", 60, 7500],
      ["Sobrancelha", 30, 1500],
    ]),
    profissionais: [
      { id: uuid("b1000000", 1), nome: "Ze" },
      { id: uuid("b1000000", 2), nome: "Beto" },
    ],
  },
  {
    estabelecimento: {
      id: uuid("e2000000", 1),
      slug: "studio-aurora",
      nome: "Studio Aurora",
      vertical: "cabeleireiro",
      vocabulario: {
        profissional: "cabeleireira",
        servico: "procedimento",
        cliente: "cliente",
        estabelecimento: "salao",
      },
      fusoHorario: "America/Sao_Paulo",
      tema: { versao: 1, tokens: temaDaAurora },
    },
    dono: { email: "dono@studio-aurora.exemplo.test", usuarioId: uuid("d2000000", 1) },
    servicos: servicos("52000000", [
      ["Corte feminino", 60, 9000],
      ["Escova", 60, 5500],
      ["Coloracao", 120, 18000],
      ["Hidratacao", 60, 8000],
    ]),
    profissionais: [
      { id: uuid("b2000000", 1), nome: "Aurora" },
      { id: uuid("b2000000", 2), nome: "Lia" },
    ],
  },
];

/** Agendamento ja existente em cada tenant, para as listas de horarios nao virem todas cheias. */
export function agendamentosIniciais(): Esquemas["Agendamento"][] {
  const [ze, aurora] = TENANTS;
  return [
    {
      id: uuid("a1000000", 1),
      servicoId: ze?.servicos[0]?.id ?? "",
      profissionalId: ze?.profissionais[0]?.id ?? "",
      inicio: "2026-10-27T13:00:00.000Z", // terca 10:00 local
      fim: "2026-10-27T13:30:00.000Z",
      status: "confirmado",
      precoCentavos: 4500,
    },
    {
      id: uuid("a2000000", 1),
      servicoId: aurora?.servicos[0]?.id ?? "",
      profissionalId: aurora?.profissionais[0]?.id ?? "",
      inicio: "2026-10-27T13:00:00.000Z",
      fim: "2026-10-27T14:00:00.000Z",
      status: "confirmado",
      precoCentavos: 9000,
    },
  ];
}

export function idDoAgendamentoNovo(n: number): string {
  return uuid("a9000000", n);
}
