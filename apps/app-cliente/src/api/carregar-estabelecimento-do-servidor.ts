import { criarClienteDaApi } from "@marquei/api-client";
import { cache } from "react";
import { urlDaApi } from "../configuracao";
import { CarregadorDoEstabelecimento } from "./carregador-do-estabelecimento";

/** Leitura no servidor, memorizada por requisição (layout, metadados e página usam o mesmo dado). */
export const carregarEstabelecimentoDoServidor = cache((slug: string) =>
  new CarregadorDoEstabelecimento(criarClienteDaApi({ urlBase: urlDaApi() })).carregar(slug),
);
