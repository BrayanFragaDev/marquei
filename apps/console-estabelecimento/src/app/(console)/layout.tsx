import { MenuPrincipal } from "../../componentes/menu-principal";
import { mensagens } from "../../i18n/mensagens-pt-br";
import { itensDoMenu } from "../../servidor/itens-do-menu";
import { obterContexto } from "../../servidor/contexto";
import { sair } from "../login/acoes";

export default async function LayoutDoConsole({ children }: { readonly children: React.ReactNode }) {
  const { permissoes, linguagem } = await obterContexto();
  const papel = linguagem.aplicar(mensagens.papeis[permissoes.chaveDoRotulo()]);
  return (
    <div className="casca">
      <aside className="menu">
        <span className="menu__marca">{mensagens.comum.marca}</span>
        <MenuPrincipal
          itens={itensDoMenu(permissoes, linguagem)}
          rotuloDoMenu={mensagens.comum.menuPrincipal}
        />
        <div className="menu__usuario">
          <p className="texto-suave">{papel}</p>
          <form action={sair}>
            <button type="submit" className="botao botao--secundario menu__sair">
              {mensagens.comum.sair}
            </button>
          </form>
        </div>
      </aside>
      <main className="conteudo">{children}</main>
    </div>
  );
}
