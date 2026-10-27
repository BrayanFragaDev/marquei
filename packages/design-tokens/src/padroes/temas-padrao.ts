import type { DadosDoTema } from "../esquema/esquema-do-tema";
import { TemaDoEstabelecimento } from "../tema/tema-do-estabelecimento";
import type { Vertical } from "./vertical";

const termo = (singular: string, plural: string) => ({ singular, plural });

const DADOS_PADRAO: Readonly<Record<Vertical, DadosDoTema>> = {
  manicure: {
    cores: {
      primaria: "#b8325f",
      textoSobrePrimaria: "#ffffff",
      apoio: "#f9d5e2",
      fundo: "#fff7fa",
      superficie: "#ffffff",
      texto: "#2b1620",
      textoSuave: "#6b4a58",
    },
    familia: "poppins",
    raio: "arredondado",
    densidade: "confortavel",
    cabecalho: "centralizado",
    cartaoDeServico: "destaque",
    textos: {
      boasVindas: "Unhas lindas, no seu horário.",
      confirmacao: "Tudo certo! Seu horário está reservado. Te esperamos.",
    },
    vocabulario: {
      profissional: termo("manicure", "manicures"),
      servico: termo("serviço", "serviços"),
      agendamento: termo("agendamento", "agendamentos"),
    },
  },
  cabeleireiro: {
    cores: {
      primaria: "#7b3f8c",
      textoSobrePrimaria: "#ffffff",
      apoio: "#e8d5ee",
      fundo: "#fbf8fc",
      superficie: "#ffffff",
      texto: "#241a28",
      textoSuave: "#5f4d66",
    },
    familia: "montserrat",
    raio: "suave",
    densidade: "confortavel",
    cabecalho: "capa",
    cartaoDeServico: "lista",
    textos: {
      boasVindas: "Escolha o serviço e o melhor horário para você.",
      confirmacao: "Agendamento confirmado! Qualquer mudança, avise com antecedência.",
    },
    vocabulario: {
      profissional: termo("cabeleireiro", "cabeleireiros"),
      servico: termo("serviço", "serviços"),
      agendamento: termo("agendamento", "agendamentos"),
    },
  },
  barbearia: {
    cores: {
      primaria: "#d4a24c",
      textoSobrePrimaria: "#14161a",
      apoio: "#3a3f4a",
      fundo: "#14161a",
      superficie: "#1f2228",
      texto: "#f2f2f0",
      textoSuave: "#b4b8c0",
    },
    familia: "roboto-slab",
    raio: "reto",
    densidade: "compacta",
    cabecalho: "simples",
    cartaoDeServico: "lista",
    textos: {
      boasVindas: "Corte e barba sem fila. Marque seu horário.",
      confirmacao: "Fechado! Seu horário está garantido. Até lá.",
    },
    vocabulario: {
      profissional: termo("barbeiro", "barbeiros"),
      servico: termo("serviço", "serviços"),
      agendamento: termo("horário", "horários"),
    },
  },
  estetica: {
    cores: {
      primaria: "#2a7461",
      textoSobrePrimaria: "#ffffff",
      apoio: "#cfe8e0",
      fundo: "#f4f8f6",
      superficie: "#ffffff",
      texto: "#1b2a26",
      textoSuave: "#4c625b",
    },
    familia: "playfair-display",
    raio: "suave",
    densidade: "confortavel",
    cabecalho: "centralizado",
    cartaoDeServico: "grade",
    textos: {
      boasVindas: "Cuide de você com calma. Reserve seu atendimento.",
      confirmacao: "Atendimento confirmado. Chegue com 10 minutos de antecedência.",
    },
    vocabulario: {
      profissional: termo("esteticista", "esteticistas"),
      servico: termo("procedimento", "procedimentos"),
      agendamento: termo("agendamento", "agendamentos"),
    },
  },
  outro: {
    cores: {
      primaria: "#2457c5",
      textoSobrePrimaria: "#ffffff",
      apoio: "#dce6fa",
      fundo: "#f7f8fa",
      superficie: "#ffffff",
      texto: "#1a1d23",
      textoSuave: "#565c69",
    },
    familia: "inter",
    raio: "suave",
    densidade: "confortavel",
    cabecalho: "simples",
    cartaoDeServico: "lista",
    textos: {
      boasVindas: "Agende seu horário em poucos toques.",
      confirmacao: "Agendamento confirmado! Você receberá um lembrete.",
    },
    vocabulario: {
      profissional: termo("profissional", "profissionais"),
      servico: termo("serviço", "serviços"),
      agendamento: termo("agendamento", "agendamentos"),
    },
  },
};

/** Tema inicial da vertical (paleta, fonte, formas e vocabulario proprios). */
export function temaPadraoDaVertical(vertical: Vertical): TemaDoEstabelecimento {
  return TemaDoEstabelecimento.reconstituir(DADOS_PADRAO[vertical]);
}
