import Link from "next/link";
import { VocabularioDoEstabelecimento } from "../../apresentacao/vocabulario-do-estabelecimento";
import { Mensagens } from "../../mensagens/mensagens";

export default function EstabelecimentoNaoEncontrado() {
  const mensagens = new Mensagens(VocabularioDoEstabelecimento.criar({}));
  return (
    <main>
      <h1>{mensagens.t("estado.naoEncontradoTitulo")}</h1>
      <p>{mensagens.t("estado.naoEncontradoTexto")}</p>
      <Link href="/">{mensagens.t("estado.voltarAoInicio")}</Link>
    </main>
  );
}
