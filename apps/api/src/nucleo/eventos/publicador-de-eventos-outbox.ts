import type { EventoDeDominio, PublicadorDeEventos } from "@marquei/dominio";
import type { ProvedorDeTransacao } from "../transacao/provedor-de-transacao";

/** Grava o evento em `evento_analitico` na transacao corrente: rollback descarta fato e evento. */
export class PublicadorDeEventosOutbox implements PublicadorDeEventos {
  constructor(private readonly transacao: ProvedorDeTransacao) {}

  async publicar(evento: EventoDeDominio): Promise<void> {
    await this.transacao.atual().consultar(
      `INSERT INTO evento_analitico (estabelecimento_id, nome, ocorrido_em, propriedades)
       VALUES ($1, $2, $3, $4)`,
      [
        evento.estabelecimentoId.valor,
        evento.nome,
        evento.ocorridoEm.paraIso(),
        JSON.stringify(evento.propriedades),
      ],
    );
  }
}
