import type { EventoDeDominio } from "./evento-de-dominio";

/**
 * Porta de publicacao. A implementacao grava o evento na mesma transacao do fato que o
 * originou (outbox), de modo que rollback descarta os dois.
 */
export interface PublicadorDeEventos {
  publicar(evento: EventoDeDominio): Promise<void>;
}
