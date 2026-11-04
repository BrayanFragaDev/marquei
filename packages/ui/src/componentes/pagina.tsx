import type { ReactNode } from "react";
import { EstilosDaUi } from "./estilos-da-ui";

export interface PropriedadesDaPagina {
  readonly children: ReactNode;
  readonly cabecalho?: ReactNode;
  readonly rodape?: ReactNode;
  /** Texto do atalho "pular para o conteudo" (catalogo de mensagens). */
  readonly rotuloDePularParaOConteudo: string;
}

/** Moldura da tela: fundo e tipografia do tema, atalho de teclado e regiao principal. */
export function Pagina({
  children,
  cabecalho,
  rodape,
  rotuloDePularParaOConteudo,
}: PropriedadesDaPagina) {
  return (
    <div className="mq-pagina">
      <EstilosDaUi />
      <a className="mq-pular" href="#mq-conteudo">
        {rotuloDePularParaOConteudo}
      </a>
      {cabecalho}
      <main id="mq-conteudo" className="mq-conteudo" tabIndex={-1}>
        {children}
      </main>
      {rodape}
    </div>
  );
}
