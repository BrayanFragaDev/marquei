/**
 * Folha de estilos dos componentes. TODO valor de cor, fonte, raio, espacamento e sombra vem das
 * variaveis CSS geradas por `paraVariaveisCss` (CLAUDE.md, secao 6). O teste `estilos.test.ts`
 * reprova qualquer cor literal. Unidades fixas aqui sao apenas estrutura (alvo de toque, bordas).
 */
export const ESTILOS_DA_UI = `
.mq-pagina { --mq-alvo-toque: 44px; min-height: 100dvh; background: var(--cor-fundo); color: var(--cor-texto); font-family: var(--fonte-familia); line-height: 1.5; }
.mq-pagina *, .mq-pagina *::before, .mq-pagina *::after { box-sizing: border-box; }
.mq-pagina :focus-visible { outline: 3px solid var(--cor-primaria); outline-offset: 2px; }
.mq-conteudo { max-width: 40rem; margin: 0 auto; padding: var(--espaco-md); display: flex; flex-direction: column; gap: var(--espaco-md); }
.mq-conteudo:focus { outline: none; }
.mq-pular { position: absolute; left: -9999px; top: 0; padding: var(--espaco-sm) var(--espaco-md); background: var(--cor-superficie); color: var(--cor-texto); }
.mq-pular:focus { left: var(--espaco-md); top: var(--espaco-md); z-index: 10; }

.mq-botao { display: inline-flex; align-items: center; justify-content: center; gap: var(--espaco-sm); min-height: max(var(--mq-alvo-toque), var(--altura-campo)); min-width: var(--mq-alvo-toque); padding: 0 var(--espaco-lg); border: 2px solid var(--cor-primaria); border-radius: var(--raio-botao); font: inherit; font-weight: 600; text-decoration: none; cursor: pointer; }
.mq-botao--primario { background: var(--cor-primaria); color: var(--cor-texto-sobre-primaria); }
.mq-botao--secundario { background: var(--cor-superficie); color: var(--cor-texto); }
.mq-botao--texto { background: transparent; border-color: transparent; color: var(--cor-texto); text-decoration: underline; }
.mq-botao--total { width: 100%; }
.mq-botao:disabled, .mq-botao[aria-disabled="true"] { opacity: 0.6; cursor: not-allowed; }

.mq-navegacao { list-style: none; margin: 0; padding: var(--espaco-xs) var(--espaco-md); display: flex; flex-wrap: wrap; gap: var(--espaco-xs); background: var(--cor-superficie); border-bottom: 1px solid var(--cor-texto-suave); }
.mq-navegacao [aria-current="page"] { border-color: var(--cor-primaria); text-decoration: none; font-weight: 700; }
.mq-secao { display: flex; flex-direction: column; gap: var(--espaco-sm); }
.mq-secao__titulo { margin: 0; font-size: 1.125em; }
.mq-aviso { margin: 0; padding: var(--espaco-md); background: var(--cor-apoio); color: var(--cor-texto); border-radius: var(--raio-cartao); }

.mq-campo { display: flex; flex-direction: column; gap: var(--espaco-xs); }
.mq-campo__rotulo { font-weight: 600; }
.mq-campo__entrada { min-height: max(var(--mq-alvo-toque), var(--altura-campo)); padding: 0 var(--espaco-md); border: 2px solid var(--cor-texto-suave); border-radius: var(--raio-campo); background: var(--cor-superficie); color: var(--cor-texto); font: inherit; }
.mq-campo__entrada[aria-invalid="true"] { border-color: var(--cor-texto); border-style: dashed; }
.mq-campo__ajuda { color: var(--cor-texto-suave); font-size: 0.875em; margin: 0; }
.mq-campo__erro { color: var(--cor-texto); font-weight: 600; font-size: 0.875em; margin: 0; }

.mq-cabecalho { display: flex; gap: var(--espaco-md); align-items: center; padding: var(--espaco-md); background: var(--cor-superficie); color: var(--cor-texto); border-bottom: 1px solid var(--cor-texto-suave); }
.mq-cabecalho--centralizado { flex-direction: column; text-align: center; }
.mq-cabecalho--capa { flex-direction: column; align-items: flex-start; justify-content: flex-end; min-height: 12rem; position: relative; overflow: hidden; background: var(--cor-primaria); color: var(--cor-texto-sobre-primaria); border-radius: 0 0 var(--raio-cartao) var(--raio-cartao); }
.mq-cabecalho__capa { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
.mq-cabecalho__texto { position: relative; display: flex; flex-direction: column; gap: var(--espaco-xs); }
.mq-cabecalho__nome { margin: 0; font-size: 1.5em; line-height: 1.2; }
.mq-cabecalho__descricao { margin: 0; }
.mq-cabecalho__logo { width: 4rem; height: 4rem; flex: none; border-radius: var(--raio-cartao); object-fit: cover; position: relative; }
.mq-cabecalho__monograma { display: inline-flex; align-items: center; justify-content: center; width: 4rem; height: 4rem; flex: none; border-radius: var(--raio-cartao); background: var(--cor-primaria); color: var(--cor-texto-sobre-primaria); font-size: 1.75em; font-weight: 700; position: relative; }
.mq-cabecalho--capa .mq-cabecalho__monograma { background: var(--cor-texto-sobre-primaria); color: var(--cor-primaria); }

.mq-lista-cartoes { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: var(--espaco-sm); }
.mq-lista-cartoes--grade { display: grid; grid-template-columns: repeat(auto-fill, minmax(10rem, 1fr)); gap: var(--espaco-md); }
.mq-lista-cartoes--destaque { gap: var(--espaco-md); }
.mq-cartao { display: flex; width: 100%; min-height: var(--mq-alvo-toque); align-items: center; justify-content: space-between; gap: var(--espaco-md); padding: var(--espaco-md); border: 2px solid var(--cor-texto-suave); border-radius: var(--raio-cartao); background: var(--cor-superficie); color: var(--cor-texto); font: inherit; text-align: start; text-decoration: none; }
button.mq-cartao, a.mq-cartao { cursor: pointer; }
.mq-cartao[aria-pressed="true"] { border-color: var(--cor-primaria); border-width: 4px; }
.mq-cartao__nome { display: block; font-weight: 600; }
.mq-cartao__detalhe { display: block; color: var(--cor-texto-suave); font-size: 0.875em; }
.mq-cartao__preco { font-weight: 700; white-space: nowrap; }
.mq-cartao__marca { font-weight: 700; }
.mq-cartao--destaque { flex-direction: column; align-items: flex-start; padding: var(--espaco-lg); border-inline-start: 8px solid var(--cor-primaria); }
.mq-cartao--destaque .mq-cartao__nome { font-size: 1.25em; }
.mq-cartao--grade { flex-direction: column; align-items: flex-start; justify-content: flex-start; height: 100%; }

.mq-horarios { border: 0; margin: 0; padding: 0; min-width: 0; }
.mq-horarios__legenda { font-weight: 600; padding: 0; margin-bottom: var(--espaco-sm); }
.mq-horarios__lista { display: flex; flex-wrap: wrap; gap: var(--espaco-sm); }
.mq-horarios__opcao { position: relative; }
.mq-horarios__entrada { position: absolute; inset: 0; width: 100%; height: 100%; margin: 0; opacity: 0; cursor: pointer; }
.mq-horarios__rotulo { display: inline-flex; align-items: center; justify-content: center; min-width: 5rem; min-height: max(var(--mq-alvo-toque), var(--altura-campo)); padding: 0 var(--espaco-md); border: 2px solid var(--cor-texto-suave); border-radius: var(--raio-botao); background: var(--cor-superficie); color: var(--cor-texto); font-weight: 600; }
.mq-horarios__entrada:checked + .mq-horarios__rotulo { background: var(--cor-primaria); border-color: var(--cor-primaria); color: var(--cor-texto-sobre-primaria); }
.mq-horarios__entrada:focus-visible + .mq-horarios__rotulo { outline: 3px solid var(--cor-primaria); outline-offset: 2px; }
.mq-horarios__vazio { margin: 0; padding: var(--espaco-md); background: var(--cor-apoio); color: var(--cor-texto); border-radius: var(--raio-cartao); }
`;
