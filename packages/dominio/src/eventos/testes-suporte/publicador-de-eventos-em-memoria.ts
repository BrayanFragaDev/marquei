import type { EventoDeDominio } from "../../compartilhado/evento-de-dominio";
import type { PublicadorDeEventos } from "../../compartilhado/publicador-de-eventos";

export class PublicadorDeEventosEmMemoria implements PublicadorDeEventos {
  readonly publicados: EventoDeDominio[] = [];

  publicar(evento: EventoDeDominio): Promise<void> {
    this.publicados.push(evento);
    return Promise.resolve();
  }
}
