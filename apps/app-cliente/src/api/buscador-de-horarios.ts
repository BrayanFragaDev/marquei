import type { GatewayDaApi } from "./gateway-da-api";

/** Procura o primeiro dia com horário livre, consultando os dias candidatos em paralelo. */
export class BuscadorDeHorarios {
  constructor(private readonly gateway: GatewayDaApi) {}

  async primeiroDiaComHorarios(entrada: {
    servicoId: string;
    profissionalId: string | null;
    dias: readonly string[];
  }): Promise<string | null> {
    const { servicoId, profissionalId, dias } = entrada;
    const respostas = await Promise.all(
      dias.map((data) => this.gateway.listarHorariosLivres({ servicoId, profissionalId, data })),
    );
    const posicao = respostas.findIndex((r) => r.itens.length > 0);
    return dias[posicao] ?? null;
  }
}
