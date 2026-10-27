import {
  Credencial,
  Email,
  EstabelecimentoId,
  Papel,
  Usuario,
  UsuarioId,
  type UsuarioRepositorio,
} from "@marquei/dominio";
import type { ProvedorDeTransacao } from "../../../nucleo";

interface LinhaDeUsuario {
  readonly id: string;
  readonly estabelecimento_id: string;
  readonly email: string;
  readonly nome: string;
  readonly papel: string;
  readonly senha_hash: string;
  readonly ativo: boolean;
}

/** Exige transacao com tenant (ProvedorDeTransacao); a RLS do banco e a segunda trava alem do WHERE. */
export class UsuarioRepositorioPostgres implements UsuarioRepositorio {
  constructor(private readonly transacao: ProvedorDeTransacao) {}

  async obterPorEmail(estabelecimentoId: EstabelecimentoId, email: Email): Promise<Usuario | null> {
    const r = await this.transacao.atual().consultar<LinhaDeUsuario>(
      `SELECT id, estabelecimento_id, email, nome, papel, senha_hash, ativo
         FROM usuario
        WHERE estabelecimento_id = $1 AND lower(email) = $2`,
      [estabelecimentoId.valor, email.valor],
    );
    const linha = r.linhas[0];
    return linha ? this.paraDominio(linha) : null;
  }

  private paraDominio(linha: LinhaDeUsuario): Usuario {
    return Usuario.reconstituir({
      id: UsuarioId.de(linha.id),
      estabelecimentoId: EstabelecimentoId.de(linha.estabelecimento_id),
      email: Email.de(linha.email),
      nome: linha.nome,
      papel: Papel.de(linha.papel),
      credencial: Credencial.reconstituir(linha.senha_hash),
      ativo: linha.ativo,
    });
  }
}
