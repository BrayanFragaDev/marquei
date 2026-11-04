"use client";

import { mensagens } from "../i18n/mensagens-pt-br";

interface Props {
  readonly reset: () => void;
}

export default function ErroDoConsole({ reset }: Props) {
  return (
    <main className="conteudo">
      <h1>{mensagens.erros.tituloDaPagina}</h1>
      <p className="aviso aviso--erro" role="alert">
        {mensagens.erros.apiIndisponivel}
      </p>
      <button type="button" className="botao" onClick={reset}>
        {mensagens.comum.tentarNovamente}
      </button>
    </main>
  );
}
