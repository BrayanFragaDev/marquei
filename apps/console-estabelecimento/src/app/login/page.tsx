import { mensagens } from "../../i18n/mensagens-pt-br";
import { Campo } from "../../componentes/campo";
import { FormularioDeAcao } from "../../componentes/formulario-de-acao";
import { entrar } from "./acoes";

export default function PaginaDeLogin() {
  const m = mensagens.login;
  return (
    <main className="login">
      <section className="cartao login__cartao">
        <h1>{m.titulo}</h1>
        <FormularioDeAcao acao={entrar} rotuloDoBotao={m.entrar} classe="login__formulario">
          <Campo id="estabelecimento" rotulo={m.estabelecimento} autoComplete="organization" />
          <Campo id="email" rotulo={m.email} type="email" autoComplete="username" />
          <Campo id="senha" rotulo={m.senha} type="password" autoComplete="current-password" />
        </FormularioDeAcao>
      </section>
    </main>
  );
}
