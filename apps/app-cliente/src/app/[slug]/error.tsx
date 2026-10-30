"use client";

import { VocabularioDoEstabelecimento } from "../../apresentacao/vocabulario-do-estabelecimento";
import { Mensagens } from "../../mensagens/mensagens";

export default function ErroDoEstabelecimento({ reset }: { error: Error; reset: () => void }) {
  const mensagens = new Mensagens(VocabularioDoEstabelecimento.criar({}));
  return (
    <main role="alert">
      <h1>{mensagens.t("estado.erroTitulo")}</h1>
      <p>{mensagens.paraErro("rede_indisponivel")}</p>
      <button type="button" onClick={reset}>
        {mensagens.t("estado.tentarDeNovo")}
      </button>
    </main>
  );
}
