import { ErroDeDominio } from "../compartilhado/erro-de-dominio";

export class ProfissionalNaoExecutaServicoError extends ErroDeDominio {
  readonly codigo = "profissional_nao_executa_servico";

  constructor() {
    super("Este profissional nao realiza o servico escolhido.");
  }
}
