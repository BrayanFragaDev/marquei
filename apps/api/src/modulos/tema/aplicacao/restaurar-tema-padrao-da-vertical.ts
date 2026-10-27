import type {
  AutorDaAlteracao,
  LeitorDeTemas,
  RegistradorDeRascunho,
  TemaVersionado,
} from "@marquei/design-tokens";

/** Substitui o rascunho pelo tema padrao da vertical do estabelecimento (o publicado nao muda). */
export class RestaurarTemaPadraoDaVertical {
  constructor(
    private readonly leitor: LeitorDeTemas,
    private readonly registrador: RegistradorDeRascunho,
  ) {}

  async execute(entrada: { readonly autor: AutorDaAlteracao }): Promise<TemaVersionado> {
    const padrao = await this.leitor.padraoDa(entrada.autor.estabelecimentoId);
    return this.registrador.registrar(entrada.autor, padrao.tema);
  }
}
