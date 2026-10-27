import type { components } from "../src/gerado/schema.ts";
import {
  AGORA_PADRAO,
  MINUTOS_DE_ANTECEDENCIA_PARA_CANCELAR,
  PASSO_DA_AGENDA_MINUTOS,
  SENHA_DO_MOCK,
  TENANTS,
  agendamentosIniciais,
  idDoAgendamentoNovo,
  type TenantDoMock,
} from "./dados.ts";
import { TemasDoMock } from "./rotas-de-tema.ts";

type Esquemas = components["schemas"];

export interface PedidoDoMock {
  readonly metodo: string;
  readonly caminho: string;
  readonly consulta: URLSearchParams;
  readonly corpo: unknown;
  readonly token: string | null;
}

export interface RespostaDoMock {
  readonly status: number;
  readonly corpo: unknown;
}

const MS_POR_MINUTO = 60_000;
/** O mock simplifica o fuso: Sao Paulo fica em UTC-3 o ano todo (sem horario de verao). */
const DESLOCAMENTO_DO_FUSO_MINUTOS = -180;
const TURNOS_EM_MINUTOS: readonly (readonly [number, number])[] = [
  [9 * 60, 12 * 60],
  [14 * 60, 18 * 60],
];
const PADRAO_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PADRAO_DIA = /^\d{4}-\d{2}-\d{2}$/;

const erro = (status: number, codigo: string, mensagem: string): RespostaDoMock => ({
  status,
  corpo: { codigo, mensagem } satisfies Esquemas["Erro"],
});
const invalido = (campo: string): RespostaDoMock => ({
  status: 400,
  corpo: {
    codigo: "requisicao_invalida",
    mensagem: "Parametros invalidos.",
    detalhes: [{ campo, codigo: "invalido" }],
  } satisfies Esquemas["Erro"],
});
const naoAutenticado = (): RespostaDoMock =>
  erro(401, "sessao_invalida", "Sessao ausente ou invalida.");

interface Reserva {
  readonly agendamento: Esquemas["Agendamento"];
  readonly tenant: TenantDoMock;
}

/** Estado em memoria de UMA instancia do mock: agendamentos criados durante a execucao. */
export class EstadoDoMock {
  private readonly reservas: Reserva[];
  private contador = 0;
  private readonly temas: TemasDoMock;

  readonly agora: Date;

  constructor(agora: Date = new Date(AGORA_PADRAO)) {
    this.agora = agora;
    this.temas = new TemasDoMock(agora);
    this.reservas = agendamentosIniciais().map((agendamento, i) => ({
      agendamento,
      tenant: TENANTS[i] ?? tenantPadrao(),
    }));
  }

  tratar(pedido: PedidoDoMock): RespostaDoMock {
    const { metodo, caminho } = pedido;
    const slug = /^\/v1\/estabelecimentos\/([^/]+)$/.exec(caminho)?.[1];
    if (metodo === "GET" && slug !== undefined) return this.estabelecimento(slug);
    if (metodo === "POST" && caminho === "/v1/auth/login") return this.entrar(pedido.corpo);
    const tenant = this.tenantDoToken(pedido.token);
    if (!tenant) return naoAutenticado();
    if (metodo === "GET" && caminho === "/v1/servicos")
      return { status: 200, corpo: { itens: tenant.servicos } };
    if (metodo === "GET" && caminho === "/v1/horarios-livres")
      return this.horariosLivres(tenant, pedido.consulta);
    if (metodo === "POST" && caminho === "/v1/agendamentos")
      return this.criar(tenant, pedido.corpo);
    const cancelar = /^\/v1\/agendamentos\/([^/]+)\/cancelar$/.exec(caminho)?.[1];
    if (metodo === "POST" && cancelar !== undefined) return this.cancelar(tenant, cancelar);
    const tema = this.temas.tratar(tenant, metodo, caminho, pedido.corpo);
    return tema ?? erro(404, "nao_encontrado", "Rota inexistente no mock.");
  }

  private estabelecimento(slug: string): RespostaDoMock {
    const tenant = TENANTS.find((t) => t.estabelecimento.slug === slug);
    if (!tenant)
      return erro(404, "estabelecimento_nao_encontrado", "Estabelecimento nao encontrado.");
    return {
      status: 200,
      corpo: tenant.estabelecimento satisfies Esquemas["EstabelecimentoPublico"],
    };
  }

  private entrar(corpo: unknown): RespostaDoMock {
    const dados = (typeof corpo === "object" && corpo !== null ? corpo : {}) as Record<
      string,
      unknown
    >;
    const { estabelecimento, email, senha } = dados;
    if (
      typeof estabelecimento !== "string" ||
      typeof email !== "string" ||
      typeof senha !== "string"
    ) {
      return erro(400, "requisicao_invalida", "Corpo invalido.");
    }
    const tenant = TENANTS.find((t) => t.estabelecimento.slug === estabelecimento);
    if (!tenant || tenant.dono.email !== email.toLowerCase() || senha !== SENHA_DO_MOCK) {
      return erro(401, "credenciais_invalidas", "Credenciais invalidas.");
    }
    const expira = new Date(this.agora.getTime() + 8 * 60 * MS_POR_MINUTO);
    return {
      status: 200,
      corpo: {
        token: `mock-token-${estabelecimento}`,
        expiraEm: expira.toISOString(),
        usuarioId: tenant.dono.usuarioId,
        papel: "dono",
        estabelecimentoId: tenant.estabelecimento.id,
      } satisfies Esquemas["LoginResposta"],
    };
  }

  /** `mock-token-<slug>` escolhe o tenant; qualquer outro token nao vazio vale o primeiro. */
  private tenantDoToken(token: string | null): TenantDoMock | null {
    if (!token) return null;
    const slug = token.startsWith("mock-token-") ? token.slice("mock-token-".length) : null;
    return TENANTS.find((t) => t.estabelecimento.slug === slug) ?? tenantPadrao();
  }

  private horariosLivres(tenant: TenantDoMock, consulta: URLSearchParams): RespostaDoMock {
    const servicoId = consulta.get("servicoId");
    const profissionalId = consulta.get("profissionalId");
    const data = consulta.get("data");
    if (!servicoId || !PADRAO_UUID.test(servicoId)) return invalido("servicoId");
    if (profissionalId !== null && !PADRAO_UUID.test(profissionalId))
      return invalido("profissionalId");
    if (!data || !PADRAO_DIA.test(data) || Number.isNaN(Date.parse(`${data}T00:00:00Z`)))
      return invalido("data");
    const servico = tenant.servicos.find((s) => s.id === servicoId);
    if (!servico) return erro(404, "servico_nao_encontrado", "Servico nao encontrado.");
    const equipe = tenant.profissionais.filter(
      (p) => profissionalId === null || p.id === profissionalId,
    );
    if (equipe.length === 0)
      return erro(404, "profissional_nao_encontrado", "Profissional nao encontrado.");
    const itens = equipe.flatMap((p) => this.livresDe(tenant, p.id, servico.duracaoMinutos, data));
    itens.sort(
      (a, b) =>
        a.inicio.localeCompare(b.inicio) || a.profissionalId.localeCompare(b.profissionalId),
    );
    return {
      status: 200,
      corpo: { data, fusoHorario: "America/Sao_Paulo", itens } satisfies Esquemas["HorariosLivres"],
    };
  }

  private confirmadasDe(tenant: TenantDoMock, profissionalId: string) {
    return this.reservas.filter(
      (r) =>
        r.tenant === tenant &&
        r.agendamento.profissionalId === profissionalId &&
        r.agendamento.status === "confirmado",
    );
  }

  private livresDe(
    tenant: TenantDoMock,
    profissionalId: string,
    duracao: number,
    data: string,
  ): Esquemas["HorarioLivre"][] {
    const meiaNoiteUtc =
      Date.parse(`${data}T00:00:00Z`) - DESLOCAMENTO_DO_FUSO_MINUTOS * MS_POR_MINUTO;
    if (new Date(Date.parse(`${data}T00:00:00Z`)).getUTCDay() === 0) return []; // domingo fechado
    const ocupados = this.confirmadasDe(tenant, profissionalId);
    const livres: Esquemas["HorarioLivre"][] = [];
    for (const [de, ate] of TURNOS_EM_MINUTOS) {
      for (let minuto = de; minuto + duracao <= ate; minuto += PASSO_DA_AGENDA_MINUTOS) {
        const inicio = meiaNoiteUtc + minuto * MS_POR_MINUTO;
        const fim = inicio + duracao * MS_POR_MINUTO;
        if (inicio >= this.agora.getTime() && !colideCom(ocupados, inicio, fim)) {
          livres.push({
            profissionalId,
            inicio: new Date(inicio).toISOString(),
            fim: new Date(fim).toISOString(),
          });
        }
      }
    }
    return livres;
  }

  private estaLivre(
    tenant: TenantDoMock,
    profissionalId: string,
    duracao: number,
    inicioMs: number,
  ): boolean {
    const dia = new Date(inicioMs + DESLOCAMENTO_DO_FUSO_MINUTOS * MS_POR_MINUTO)
      .toISOString()
      .slice(0, 10);
    return this.livresDe(tenant, profissionalId, duracao, dia).some(
      (h) => Date.parse(h.inicio) === inicioMs,
    );
  }

  private criar(tenant: TenantDoMock, corpo: unknown): RespostaDoMock {
    const dados = (typeof corpo === "object" && corpo !== null ? corpo : {}) as Record<
      string,
      unknown
    >;
    const { servicoId, profissionalId, inicio } = dados;
    if (typeof servicoId !== "string" || !PADRAO_UUID.test(servicoId)) return invalido("servicoId");
    if (typeof profissionalId !== "string" || !PADRAO_UUID.test(profissionalId))
      return invalido("profissionalId");
    if (typeof inicio !== "string" || Number.isNaN(Date.parse(inicio)) || !inicio.endsWith("Z"))
      return invalido("inicio");
    const servico = tenant.servicos.find((s) => s.id === servicoId);
    if (!servico) return erro(404, "servico_nao_encontrado", "Servico nao encontrado.");
    if (!tenant.profissionais.some((p) => p.id === profissionalId)) {
      return erro(404, "profissional_nao_encontrado", "Profissional nao encontrado.");
    }
    const inicioMs = Date.parse(inicio);
    if (inicioMs < this.agora.getTime()) {
      return erro(
        422,
        "agendamento_no_passado",
        "Nao e possivel agendar em um horario que ja passou.",
      );
    }
    if (!this.estaLivre(tenant, profissionalId, servico.duracaoMinutos, inicioMs))
      return erro(409, "horario_indisponivel", "Este horario nao esta mais disponivel.");
    return this.reservar(tenant, { servicoId, profissionalId, inicioMs }, servico);
  }

  private reservar(
    tenant: TenantDoMock,
    pedido: { servicoId: string; profissionalId: string; inicioMs: number },
    servico: { duracaoMinutos: number; precoCentavos: number },
  ): RespostaDoMock {
    const { servicoId, profissionalId, inicioMs } = pedido;
    this.contador += 1;
    const agendamento: Esquemas["Agendamento"] = {
      id: idDoAgendamentoNovo(this.contador),
      servicoId,
      profissionalId,
      inicio: new Date(inicioMs).toISOString(),
      fim: new Date(inicioMs + servico.duracaoMinutos * MS_POR_MINUTO).toISOString(),
      status: "confirmado",
      precoCentavos: servico.precoCentavos,
    };
    this.reservas.push({ agendamento, tenant });
    return { status: 201, corpo: agendamento };
  }

  private cancelar(tenant: TenantDoMock, id: string): RespostaDoMock {
    if (!PADRAO_UUID.test(id))
      return erro(400, "identificador_invalido", "Identificador invalido.");
    const posicao = this.reservas.findIndex((r) => r.tenant === tenant && r.agendamento.id === id);
    const reserva = this.reservas[posicao];
    if (!reserva) return erro(404, "agendamento_nao_encontrado", "Agendamento nao encontrado.");
    if (reserva.agendamento.status !== "confirmado") {
      return erro(
        409,
        "agendamento_nao_cancelavel",
        `Agendamento com status "${reserva.agendamento.status}" nao pode ser cancelado.`,
      );
    }
    const antecedencia =
      (Date.parse(reserva.agendamento.inicio) - this.agora.getTime()) / MS_POR_MINUTO;
    if (antecedencia < MINUTOS_DE_ANTECEDENCIA_PARA_CANCELAR) {
      return erro(
        409,
        "fora_do_prazo_de_cancelamento",
        "O prazo para cancelar este agendamento ja passou.",
      );
    }
    const cancelado: Esquemas["Agendamento"] = { ...reserva.agendamento, status: "cancelado" };
    this.reservas[posicao] = { ...reserva, agendamento: cancelado };
    return { status: 200, corpo: cancelado };
  }
}

function tenantPadrao(): TenantDoMock {
  const primeiro = TENANTS[0];
  if (!primeiro) throw new TypeError("O mock precisa de ao menos um estabelecimento.");
  return primeiro;
}

function colideCom(
  ocupados: readonly { readonly agendamento: Esquemas["Agendamento"] }[],
  inicio: number,
  fim: number,
): boolean {
  return ocupados.some(
    (o) => inicio < Date.parse(o.agendamento.fim) && Date.parse(o.agendamento.inicio) < fim,
  );
}
