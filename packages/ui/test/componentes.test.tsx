import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  Botao,
  CabecalhoDoEstabelecimento,
  CampoDeTexto,
  CartaoDeServico,
  EscopoDeTema,
  ListaDeCartoes,
  Pagina,
  SeletorDeHorario,
} from "../src/index";

describe("Botao", () => {
  it("dispara o clique e usa type=button por padrao", () => {
    const aoClicar = vi.fn();
    render(<Botao onClick={aoClicar}>Confirmar</Botao>);
    const botao = screen.getByRole("button", { name: "Confirmar" });
    expect(botao).toHaveAttribute("type", "button");
    fireEvent.click(botao);
    expect(aoClicar).toHaveBeenCalledOnce();
  });

  it("aplica variante e largura total e nao clica quando desabilitado", () => {
    const aoClicar = vi.fn();
    render(
      <Botao variante="secundario" larguraTotal disabled onClick={aoClicar}>
        Voltar
      </Botao>,
    );
    const botao = screen.getByRole("button", { name: "Voltar" });
    expect(botao).toHaveClass("mq-botao--secundario", "mq-botao--total");
    fireEvent.click(botao);
    expect(aoClicar).not.toHaveBeenCalled();
  });
});

describe("CampoDeTexto", () => {
  it("associa o rotulo ao campo e repassa a digitacao", () => {
    const aoMudar = vi.fn();
    render(<CampoDeTexto rotulo="Telefone" value="" onChange={aoMudar} />);
    fireEvent.change(screen.getByLabelText("Telefone"), { target: { value: "1199" } });
    expect(aoMudar).toHaveBeenCalledOnce();
  });

  it("liga ajuda e erro ao campo e marca como invalido", () => {
    render(
      <CampoDeTexto rotulo="Telefone" ajuda="Com DDD" erro="Numero invalido" readOnly value="" />,
    );
    const campo = screen.getByLabelText("Telefone");
    expect(campo).toBeInvalid();
    expect(campo).toHaveAccessibleDescription("Com DDD Numero invalido");
    expect(screen.getByRole("alert")).toHaveTextContent("Numero invalido");
  });
});

describe("CabecalhoDoEstabelecimento", () => {
  it.each(["simples", "centralizado", "capa"] as const)(
    "renderiza o preset %s com o nome",
    (preset) => {
      render(
        <CabecalhoDoEstabelecimento nome="Studio Aurora" preset={preset} rotuloDoLogo="Logo" />,
      );
      expect(screen.getByRole("heading", { level: 1, name: "Studio Aurora" })).toBeVisible();
      expect(screen.getByRole("banner")).toHaveAttribute("data-preset", preset);
    },
  );

  it("mostra o logo com texto alternativo quando ha url e monograma quando nao ha", () => {
    const { rerender } = render(
      <CabecalhoDoEstabelecimento
        nome="Aurora"
        preset="simples"
        rotuloDoLogo="Logo do Aurora"
        logoUrl="/logo.png"
      />,
    );
    expect(screen.getByRole("img", { name: "Logo do Aurora" })).toHaveAttribute("src", "/logo.png");
    rerender(
      <CabecalhoDoEstabelecimento nome="Aurora" preset="simples" rotuloDoLogo="Logo do Aurora" />,
    );
    expect(screen.queryByRole("img")).toBeNull();
    expect(screen.getByText("A")).toHaveAttribute("aria-hidden", "true");
  });

  it("exibe a descricao e a imagem de capa so no preset capa", () => {
    const { container, rerender } = render(
      <CabecalhoDoEstabelecimento
        nome="A"
        preset="capa"
        descricao="Bem-vindo"
        capaUrl="/capa.jpg"
        rotuloDoLogo="Logo"
      />,
    );
    expect(screen.getByText("Bem-vindo")).toBeVisible();
    expect(container.querySelector(".mq-cabecalho__capa")).not.toBeNull();
    rerender(
      <CabecalhoDoEstabelecimento
        nome="A"
        preset="simples"
        capaUrl="/capa.jpg"
        rotuloDoLogo="Logo"
      />,
    );
    expect(container.querySelector(".mq-cabecalho__capa")).toBeNull();
  });
});

describe("CartaoDeServico", () => {
  it.each(["lista", "destaque", "grade"] as const)("renderiza o preset %s", (preset) => {
    render(
      <ListaDeCartoes preset={preset}>
        <CartaoDeServico nome="Corte" duracao="30 min" preco="R$ 45,00" preset={preset} />
      </ListaDeCartoes>,
    );
    const lista = screen.getByRole("list");
    expect(lista).toHaveClass(`mq-lista-cartoes--${preset}`);
    expect(within(lista).getByText("Corte")).toBeVisible();
    expect(within(lista).getByText("R$ 45,00")).toBeVisible();
  });

  it("vira botao com estado quando e selecionavel e marca a selecao por texto", () => {
    const aoSelecionar = vi.fn();
    render(
      <ListaDeCartoes preset="lista">
        <CartaoDeServico
          nome="Corte"
          duracao="30 min"
          preco="R$ 45,00"
          preset="lista"
          selecionado
          aoSelecionar={aoSelecionar}
          rotuloDaAcao="Escolher Corte"
          rotuloDeSelecionado="Selecionado:"
        />
      </ListaDeCartoes>,
    );
    const botao = screen.getByRole("button", { name: "Escolher Corte" });
    expect(botao).toHaveAttribute("aria-pressed", "true");
    expect(botao).toHaveTextContent("Selecionado:");
    fireEvent.click(botao);
    expect(aoSelecionar).toHaveBeenCalledOnce();
  });

  it("sem acao e apenas informativo (nao e botao)", () => {
    render(
      <ListaDeCartoes preset="lista">
        <CartaoDeServico nome="Corte" duracao="30 min" preco="R$ 1,00" preset="lista" />
      </ListaDeCartoes>,
    );
    expect(screen.queryByRole("button")).toBeNull();
  });
});

describe("SeletorDeHorario", () => {
  const opcoes = [
    { valor: "a", rotulo: "09:00" },
    { valor: "b", rotulo: "09:30" },
  ];

  it("agrupa com legenda, marca o escolhido e avisa a selecao", () => {
    const aoSelecionar = vi.fn();
    render(
      <SeletorDeHorario
        legenda="Horario"
        opcoes={opcoes}
        valor="a"
        aoSelecionar={aoSelecionar}
        mensagemSemHorarios="Nada"
      />,
    );
    const grupo = screen.getByRole("group", { name: "Horario" });
    expect(within(grupo).getByRole("radio", { name: "09:00" })).toBeChecked();
    fireEvent.click(within(grupo).getByRole("radio", { name: "09:30" }));
    expect(aoSelecionar).toHaveBeenCalledWith("b");
  });

  it("explica quando nao ha horarios", () => {
    render(
      <SeletorDeHorario
        legenda="Horario"
        opcoes={[]}
        valor={null}
        aoSelecionar={vi.fn()}
        mensagemSemHorarios="Sem horarios neste dia"
      />,
    );
    expect(screen.getByRole("status")).toHaveTextContent("Sem horarios neste dia");
    expect(screen.queryByRole("radio")).toBeNull();
  });
});

describe("Pagina e EscopoDeTema", () => {
  it("oferece atalho para o conteudo e regiao principal", () => {
    render(
      <Pagina rotuloDePularParaOConteudo="Pular">
        <p>Conteudo</p>
      </Pagina>,
    );
    expect(screen.getByRole("link", { name: "Pular" })).toHaveAttribute("href", "#mq-conteudo");
    expect(within(screen.getByRole("main")).getByText("Conteudo")).toBeVisible();
  });

  it("aplica as variaveis do tema na subarvore", () => {
    render(
      <EscopoDeTema variaveis={{ "--cor-primaria": "#123456" }}>
        <span>x</span>
      </EscopoDeTema>,
    );
    expect(screen.getByText("x").parentElement?.style.getPropertyValue("--cor-primaria")).toBe(
      "#123456",
    );
  });
});
