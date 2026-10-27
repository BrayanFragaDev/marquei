import type { components } from "../src/gerado/schema.ts";
import type { TenantDoMock } from "./dados.ts";

type Esquemas = components["schemas"];
type Resposta = { readonly status: number; readonly corpo: unknown };

const PUBLICADO_EM = "2026-10-20T12:00:00.000Z";

const OPCOES: Esquemas["OpcoesDeTema"] = {
  familias: [
    { id: "inter", nome: "Inter", pilhaCss: "Inter, system-ui, sans-serif" },
    { id: "poppins", nome: "Poppins", pilhaCss: "Poppins, system-ui, sans-serif" },
    { id: "montserrat", nome: "Montserrat", pilhaCss: "Montserrat, system-ui, sans-serif" },
    { id: "playfair-display", nome: "Playfair Display", pilhaCss: "'Playfair Display', serif" },
    { id: "roboto-slab", nome: "Roboto Slab", pilhaCss: "'Roboto Slab', serif" },
  ],
  raios: [
    { id: "reto", escala: { campo: 0, botao: 0, cartao: 0 } },
    { id: "suave", escala: { campo: 6, botao: 8, cartao: 12 } },
    { id: "arredondado", escala: { campo: 12, botao: 24, cartao: 20 } },
  ],
  densidades: [
    { id: "compacta", espacamento: { xs: 2, sm: 4, md: 8, lg: 12, xl: 20, alturaDoCampo: 40 } },
    { id: "confortavel", espacamento: { xs: 4, sm: 8, md: 12, lg: 20, xl: 32, alturaDoCampo: 48 } },
  ],
  cabecalhos: ["simples", "centralizado", "capa"],
  cartoesDeServico: ["lista", "destaque", "grade"],
  camposDeCor: [
    "primaria",
    "textoSobrePrimaria",
    "apoio",
    "fundo",
    "superficie",
    "texto",
    "textoSuave",
  ],
  verticais: ["manicure", "cabeleireiro", "barbearia", "estetica", "outro"],
  contrasteMinimo: { textoNormal: 4.5, componente: 3 },
};

interface TemaDoTenant {
  rascunho: Esquemas["TemaTokens"] | null;
  rascunhoVersao: number;
  publicadoVersao: number;
  publicado: Esquemas["TemaTokens"];
}

/**
 * Rotas de tema do mock: guardam rascunho e publicado em memoria. NAO validam contraste nem
 * esquema alem do basico (a validacao real e de `packages/design-tokens` na API).
 */
export class TemasDoMock {
  private readonly porTenant = new Map<TenantDoMock, TemaDoTenant>();

  private readonly agora: Date;

  constructor(agora: Date) {
    this.agora = agora;
  }

  tratar(tenant: TenantDoMock, metodo: string, caminho: string, corpo: unknown): Resposta | null {
    if (metodo === "GET" && caminho === "/v1/tema") return this.publicado(tenant);
    if (metodo === "GET" && caminho === "/v1/tema/opcoes") return { status: 200, corpo: OPCOES };
    if (metodo === "GET" && caminho === "/v1/tema/rascunho") return this.rascunho(tenant);
    if (metodo === "PUT" && caminho === "/v1/tema/rascunho") return this.salvar(tenant, corpo);
    if (metodo === "POST" && caminho === "/v1/tema/rascunho/restaurar-padrao")
      return this.salvar(tenant, estado(this.porTenant, tenant).publicado);
    if (metodo === "POST" && caminho === "/v1/tema/publicar") return this.publicar(tenant);
    return null;
  }

  private publicado(tenant: TenantDoMock): Resposta {
    const e = estado(this.porTenant, tenant);
    return resposta(e.publicadoVersao, PUBLICADO_EM, "publicado", e.publicado);
  }

  private rascunho(tenant: TenantDoMock): Resposta {
    const e = estado(this.porTenant, tenant);
    if (!e.rascunho) return this.publicado(tenant);
    return resposta(e.rascunhoVersao, this.agora.toISOString(), "rascunho", e.rascunho);
  }

  private salvar(tenant: TenantDoMock, corpo: unknown): Resposta {
    if (typeof corpo !== "object" || corpo === null || !("cores" in corpo)) {
      return {
        status: 400,
        corpo: {
          codigo: "tema_invalido",
          mensagem: "Tema fora do esquema.",
        } satisfies Esquemas["ErroDeTema"],
      };
    }
    const e = estado(this.porTenant, tenant);
    e.rascunho = corpo as Esquemas["TemaTokens"];
    e.rascunhoVersao += 1;
    return this.rascunho(tenant);
  }

  private publicar(tenant: TenantDoMock): Resposta {
    const e = estado(this.porTenant, tenant);
    if (!e.rascunho) {
      return {
        status: 404,
        corpo: {
          codigo: "rascunho_nao_encontrado",
          mensagem: "Nao ha rascunho para publicar.",
        } satisfies Esquemas["ErroDeTema"],
      };
    }
    e.publicado = e.rascunho;
    e.publicadoVersao += 1;
    e.rascunho = null;
    return this.publicado(tenant);
  }
}

function estado(mapa: Map<TenantDoMock, TemaDoTenant>, tenant: TenantDoMock): TemaDoTenant {
  const existente = mapa.get(tenant);
  if (existente) return existente;
  const novo: TemaDoTenant = {
    rascunho: null,
    rascunhoVersao: 0,
    publicadoVersao: tenant.estabelecimento.tema.versao,
    publicado: tenant.estabelecimento.tema.tokens as Esquemas["TemaTokens"],
  };
  mapa.set(tenant, novo);
  return novo;
}

function resposta(
  versao: number,
  atualizadoEm: string,
  origem: Esquemas["RespostaDeTema"]["origem"],
  tokens: Esquemas["TemaTokens"],
): Resposta {
  return {
    status: 200,
    corpo: { versao, atualizadoEm, origem, tokens } satisfies Esquemas["RespostaDeTema"],
  };
}
