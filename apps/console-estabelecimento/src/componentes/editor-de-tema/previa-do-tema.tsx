import {
  Botao,
  CabecalhoDoEstabelecimento,
  CartaoDeServico,
  EscopoDeTema,
  ListaDeCartoes,
  Pagina,
} from "@marquei/ui";
import type { DadosDoTema } from "@marquei/design-tokens";

export interface TextosDaPrevia {
  readonly titulo: string;
  readonly nomeDeExemplo: string;
  readonly logo: string;
  readonly pularParaOConteudo: string;
  readonly servicos: readonly { readonly nome: string; readonly duracao: string; readonly preco: string }[];
  readonly reservar: string;
}

interface Props {
  readonly tema: DadosDoTema;
  readonly variaveis: Readonly<Record<string, string>>;
  readonly textos: TextosDaPrevia;
}

/**
 * Pre-visualizacao em moldura de celular com os MESMOS componentes do app do cliente
 * (`@marquei/ui`), alimentados pelo rascunho. Nenhum estilo proprio: tudo vem das variaveis.
 */
export function PreviaDoTema({ tema, variaveis, textos }: Props) {
  return (
    <section aria-label={textos.titulo} className="moldura-de-celular" data-testid="previa-do-tema">
      <EscopoDeTema variaveis={variaveis}>
        <Pagina
          rotuloDePularParaOConteudo={textos.pularParaOConteudo}
          cabecalho={
            <CabecalhoDoEstabelecimento
              nome={textos.nomeDeExemplo}
              preset={tema.cabecalho}
              descricao={tema.textos.boasVindas}
              rotuloDoLogo={textos.logo}
            />
          }
        >
          <ListaDeCartoes preset={tema.cartaoDeServico}>
            {textos.servicos.map((s) => (
              <CartaoDeServico
                key={s.nome}
                nome={s.nome}
                duracao={s.duracao}
                preco={s.preco}
                preset={tema.cartaoDeServico}
              />
            ))}
          </ListaDeCartoes>
          <Botao larguraTotal>{textos.reservar}</Botao>
        </Pagina>
      </EscopoDeTema>
    </section>
  );
}
