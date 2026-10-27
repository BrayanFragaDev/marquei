# @marquei/design-tokens

Esquema, valores padrão, validação de contraste (WCAG AA) e geradores dos temas por
estabelecimento. Tema é dado, nunca código por cliente (CLAUDE.md, seção 6). Sem dependência de
React, React Native ou Next.js; roda em web e mobile.

## Uso

```ts
import {
  TemaDoEstabelecimento, ValidadorDeContraste, temaPadraoDaVertical,
  paraVariaveisCss, paraTemaNativo,
} from "@marquei/design-tokens";

const rascunho = temaPadraoDaVertical("barbearia").comRaio("reto"); // imutável: nova instância
const validador = new ValidadorDeContraste();

validador.validar(rascunho);                // lista de problemas, com sugestão (rascunho pode ter)
rascunho.validarParaPublicacao(validador);  // lança ContrasteInsuficienteError se reprovar em AA
validador.corrigir(rascunho);               // aplica as sugestões e devolve novo tema

const { variaveis, css } = paraVariaveisCss(rascunho); // Next.js: --cor-primaria, --raio-cartao...
const nativo = paraTemaNativo(rascunho);               // React Native: cores, raios, espaçamentos, fonte
```

Entrada não confiável (formulário, API) entra por `TemaDoEstabelecimento.criar(entrada)`; ela
falha com `TemaInvalidoError` para cor fora de `#rrggbb`, opção fora da lista curada ou campo
desconhecido. `paraDados()` / `reconstituir()` fazem a ida e volta para o banco.

## Contraste

Pares verificados: `texto` sobre `fundo`, `superficie` e `apoio`; `textoSuave` sobre `fundo` e
`superficie`; `textoSobrePrimaria` sobre `primaria` (todos 4,5:1); `primaria` sobre `fundo` e
`superficie` como componente (3:1). A sugestão mantém o matiz e a saturação e muda só a
luminosidade, em passos de 0,5%, até atingir a razão.

## Como adicionar uma opção curada

1. Adicione o id e os valores no arquivo de `src/opcoes/` correspondente (`familias-tipograficas`,
   `raios`, `densidades`, `presets`). O esquema (`src/esquema/esquema-do-tema.ts`) lê as listas de
   lá, então o id passa a ser aceito automaticamente.
2. Se for família tipográfica, mantenha entre 4 e 6 e inclua fallback genérico na pilha.
3. Rode `pnpm --filter @marquei/design-tokens test`: o teste combinatório cobre a nova opção.
4. Avise AC e CE para implementarem o preset de cabeçalho/cartão ou carregarem a fonte.
