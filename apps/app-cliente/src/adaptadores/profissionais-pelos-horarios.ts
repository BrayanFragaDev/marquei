import type { GatewayDaApi } from "../api/gateway-da-api";
import type { CalendarioDoEstabelecimento } from "../apresentacao/formatadores";
import type {
  CatalogoDeProfissionais,
  ProfissionalDoCatalogo,
} from "../portas/catalogo-de-profissionais";

const DIAS_CONSULTADOS = 7;

/** Adaptador SIMULADO: deduz os profissionais dos horários livres da próxima semana. */
export class ProfissionaisPelosHorarios implements CatalogoDeProfissionais {
  constructor(
    private readonly gateway: GatewayDaApi,
    private readonly calendario: CalendarioDoEstabelecimento,
    private readonly agora: () => Date,
    private readonly nomear: (numero: number) => string,
  ) {}

  async listar(entrada: { servicoId: string | null }): Promise<readonly ProfissionalDoCatalogo[]> {
    const servicoId = entrada.servicoId ?? (await this.gateway.listarServicos())[0]?.id;
    if (servicoId === undefined) return [];
    const dias = this.calendario.proximosDias(this.agora(), DIAS_CONSULTADOS);
    const respostas = await Promise.all(
      dias.map((data) =>
        this.gateway.listarHorariosLivres({ servicoId, profissionalId: null, data }),
      ),
    );
    const ids = [...new Set(respostas.flatMap((r) => r.itens.map((h) => h.profissionalId)))];
    return ids.map((id, i) => ({ id, nome: this.nomear(i + 1) }));
  }
}
