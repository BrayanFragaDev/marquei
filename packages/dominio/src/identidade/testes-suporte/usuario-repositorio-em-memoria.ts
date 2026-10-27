import type { EstabelecimentoId } from "../../compartilhado/identificador";
import type { Email } from "../email";
import type { Usuario } from "../usuario";
import type { UsuarioRepositorio } from "../usuario-repositorio";

export class UsuarioRepositorioEmMemoria implements UsuarioRepositorio {
  private readonly usuarios: Usuario[] = [];

  adicionar(usuario: Usuario): void {
    this.usuarios.push(usuario);
  }

  obterPorEmail(estabelecimentoId: EstabelecimentoId, email: Email): Promise<Usuario | null> {
    const achado = this.usuarios.find(
      (u) => u.estabelecimentoId.igual(estabelecimentoId) && u.email.igual(email),
    );
    return Promise.resolve(achado ?? null);
  }
}
