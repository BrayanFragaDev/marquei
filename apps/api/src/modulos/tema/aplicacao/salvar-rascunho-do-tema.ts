import type {
  AutorDaAlteracao,
  RegistradorDeRascunho,
  TemaDoEstabelecimento,
  TemaVersionado,
} from "@marquei/design-tokens";

export interface EntradaSalvarRascunho {
  readonly autor: AutorDaAlteracao;
  readonly tema: TemaDoEstabelecimento;
}

/** Dono/gestor salva o rascunho do tema. Nao altera o que o cliente ve. */
export class SalvarRascunhoDoTema {
  constructor(private readonly registrador: RegistradorDeRascunho) {}

  execute(entrada: EntradaSalvarRascunho): Promise<TemaVersionado> {
    return this.registrador.registrar(entrada.autor, entrada.tema);
  }
}
