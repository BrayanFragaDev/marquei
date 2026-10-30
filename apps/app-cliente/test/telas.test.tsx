import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { TelaAgendar } from "../src/telas/agendar/tela-agendar";
import { TelaDeProfissionais } from "../src/telas/tela-de-profissionais";
import { TelaEntrar } from "../src/telas/tela-entrar";
import { TelaMeusAgendamentos } from "../src/telas/tela-meus-agendamentos";
import { TelaModoProfissional } from "../src/telas/tela-modo-profissional";
import { TelaVitrine } from "../src/telas/tela-vitrine";
import { CODIGO_DE_TESTE } from "../src/adaptadores/autenticador-simulado";
import { AGORA_DOS_TESTES, EstadoDoMock, estabelecimentoDoMock } from "./suporte/fetch-do-mock";
import { definirParametros, navegacao } from "./suporte/navegacao";
import { renderizarTela } from "./suporte/renderizar";

const SLUG = "barbearia-do-ze";
const SERVICO = estabelecimentoDoMock(SLUG).servicos[0];

describe("vitrine", () => {
  it("lista os serviços do mock e um toque abre o agendamento com o serviço escolhido", async () => {
    renderizarTela(<TelaVitrine />);
    const botao = await screen.findByRole("button", { name: "Agendar Corte masculino" });
    expect(botao).toHaveTextContent("R$ 45,00");
    expect(botao).toHaveTextContent("30 min");
    await userEvent.click(botao);
    expect(navegacao.push).toHaveBeenCalledWith(`/${SLUG}/agendar?servico=${SERVICO?.id}`);
  });

  it("usa o vocabulário do estabelecimento nos textos fixos", async () => {
    renderizarTela(<TelaVitrine />, { slug: "studio-aurora" });
    expect(await screen.findByRole("link", { name: "Conhecer cabeleireiras" })).toBeVisible();
  });

  it("mostra erro traduzido e permite tentar de novo quando a API está fora", async () => {
    const semRede = (): Promise<Response> => Promise.reject(new TypeError("falha de rede"));
    renderizarTela(<TelaVitrine />, { fetch: semRede });
    expect(await screen.findByRole("alert")).toHaveTextContent("Sem conexão com o servidor");
    expect(screen.getByRole("button", { name: "Tentar de novo" })).toBeVisible();
  });
});

describe("profissionais", () => {
  it("deduz os profissionais dos horários livres e leva ao agendamento com eles", async () => {
    renderizarTela(<TelaDeProfissionais />);
    const primeiro = await screen.findByRole("button", { name: /Agendar com Barbeiro 1/ });
    await userEvent.click(primeiro);
    expect(navegacao.push).toHaveBeenCalledWith(
      expect.stringContaining(`/${SLUG}/agendar?profissional=`),
    );
    expect(screen.getByRole("button", { name: /Barbeiro 2/ })).toBeVisible();
  });
});

describe("agendar", () => {
  it("serviço -> horário -> confirmar: sem sessão leva ao login guardando a escolha na URL", async () => {
    definirParametros(`servico=${SERVICO?.id}`);
    renderizarTela(<TelaAgendar />);
    const horario = await screen.findByRole("radio", { name: "09:00" });
    await userEvent.click(horario);
    await userEvent.click(await screen.findByRole("button", { name: "Entrar para confirmar" }));
    const destino = String(navegacao.push.mock.calls[0]?.[0]);
    expect(destino).toContain(`/${SLUG}/entrar?voltar=`);
    expect(decodeURIComponent(destino)).toContain("inicio=2026-10-26T12%3A00%3A00.000Z");
  });

  it("com sessão, confirma em 2 toques (horário + confirmar) e mostra a mensagem do tema", async () => {
    definirParametros(`servico=${SERVICO?.id}`);
    const { armazenamento, chamadas } = renderizarTela(<TelaAgendar />);
    armazenamento.gravar(
      `marquei:cliente:${SLUG}`,
      JSON.stringify({ token: `mock-token-${SLUG}`, telefoneMascarado: "(11) ****-0000" }),
    );
    await userEvent.click(await screen.findByRole("radio", { name: "09:00" }));
    await userEvent.click(await screen.findByRole("button", { name: "Confirmar horario" }));
    expect(await screen.findByText("Agendamento confirmado. Te esperamos!")).toBeVisible();
    expect(chamadas).toContain("POST /v1/agendamentos");
    expect(armazenamento.ler(`marquei:agendamentos:${SLUG}`)).toContain("confirmado");
  });

  it("horário ocupado por outro cliente mostra aviso claro e atualiza a lista", async () => {
    const estado = new EstadoDoMock(AGORA_DOS_TESTES);
    definirParametros(`servico=${SERVICO?.id}`);
    const { armazenamento } = renderizarTela(<TelaAgendar />, { estado });
    armazenamento.gravar(
      `marquei:cliente:${SLUG}`,
      JSON.stringify({ token: `mock-token-${SLUG}`, telefoneMascarado: "x" }),
    );
    await userEvent.click(await screen.findByRole("radio", { name: "09:00" }));
    const profissional = estabelecimentoDoMock(SLUG).profissionais[0];
    const concorrente = renderizarTela(<span />, { estado });
    await concorrente.servicos.gatewayDoCliente.criarAgendamento({
      servicoId: SERVICO?.id ?? "",
      profissionalId: profissional?.id ?? "",
      inicio: "2026-10-26T12:00:00.000Z",
    });
    await userEvent.click(await screen.findByRole("button", { name: "Confirmar horario" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("acabou de ser ocupado");
  });

  it("deixa escolher outro profissional e outro dia", async () => {
    definirParametros(`servico=${SERVICO?.id}`);
    renderizarTela(<TelaAgendar />);
    const profissionais = await screen.findByRole("group", { name: "Barbeiro" });
    expect(within(profissionais).getByRole("radio", { name: "Qualquer barbeiro" })).toBeChecked();
    await userEvent.click(await within(profissionais).findByRole("radio", { name: "Barbeiro 2" }));
    const dias = screen.getByRole("group", { name: "Dia" });
    expect(within(dias).getAllByRole("radio")).toHaveLength(7);
  });
});

describe("entrar", () => {
  it("celular, código de teste e volta para o destino seguro", async () => {
    definirParametros(`voltar=${encodeURIComponent(`/${SLUG}/agendar?servico=1`)}`);
    const { servicos } = renderizarTela(<TelaEntrar />);
    await userEvent.type(screen.getByLabelText("Celular com DDD"), "11912344321");
    await userEvent.click(screen.getByRole("button", { name: "Receber código" }));
    await userEvent.type(await screen.findByLabelText("Código de 6 dígitos"), CODIGO_DE_TESTE);
    await userEvent.click(screen.getByRole("button", { name: "Entrar" }));
    await waitFor(() =>
      expect(navegacao.replace).toHaveBeenCalledWith(`/${SLUG}/agendar?servico=1`),
    );
    expect(servicos.autenticador.sessao(SLUG)?.telefoneMascarado).toBe("(11) ****-4321");
  });

  it("recusa celular inválido e código errado com mensagem", async () => {
    renderizarTela(<TelaEntrar />);
    await userEvent.type(screen.getByLabelText("Celular com DDD"), "123");
    await userEvent.click(screen.getByRole("button", { name: "Receber código" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("celular com DDD");
  });

  it("não aceita destino externo vindo da URL", async () => {
    definirParametros("voltar=https%3A%2F%2Fmalicioso.test");
    renderizarTela(<TelaEntrar />);
    await userEvent.type(screen.getByLabelText("Celular com DDD"), "11912344321");
    await userEvent.click(screen.getByRole("button", { name: "Receber código" }));
    await userEvent.type(await screen.findByLabelText("Código de 6 dígitos"), CODIGO_DE_TESTE);
    await userEvent.click(screen.getByRole("button", { name: "Entrar" }));
    await waitFor(() => expect(navegacao.replace).toHaveBeenCalledWith(`/${SLUG}`));
  });
});

describe("meus agendamentos", () => {
  async function agendarEListar(estado: EstadoDoMock) {
    const tela = renderizarTela(<TelaMeusAgendamentos />, { estado });
    tela.armazenamento.gravar(
      `marquei:cliente:${SLUG}`,
      JSON.stringify({ token: `mock-token-${SLUG}`, telefoneMascarado: "x" }),
    );
    const criado = await tela.servicos.gatewayDoCliente.criarAgendamento({
      servicoId: SERVICO?.id ?? "",
      profissionalId: estabelecimentoDoMock(SLUG).profissionais[0]?.id ?? "",
      inicio: "2026-10-28T13:00:00.000Z",
    });
    tela.servicos.agendamentosDoCliente.registrar(SLUG, criado);
    tela.unmount();
    return renderizarTela(<TelaMeusAgendamentos />, { estado, armazenamento: tela.armazenamento });
  }

  it("pede para entrar quando não há sessão", async () => {
    renderizarTela(<TelaMeusAgendamentos />);
    expect(await screen.findByText("Entre para ver seus horarios.")).toBeVisible();
  });

  it("cancela dentro do prazo e mostra o status atualizado", async () => {
    await agendarEListar(new EstadoDoMock(AGORA_DOS_TESTES));
    await userEvent.click(await screen.findByRole("button", { name: /Cancelar Corte masculino/ }));
    expect(await screen.findByText("Cancelamento realizado.")).toBeVisible();
    expect(screen.getByText(/Cancelado/)).toBeVisible();
    expect(screen.queryByRole("button", { name: /Cancelar Corte/ })).toBeNull();
  });

  it("respeita a política do servidor: fora do prazo o cancelamento é recusado com explicação", async () => {
    const umaHoraAntes = new Date("2026-10-28T12:00:00.000Z");
    await agendarEListar(new EstadoDoMock(umaHoraAntes));
    await userEvent.click(await screen.findByRole("button", { name: /Cancelar Corte masculino/ }));
    expect(await screen.findByText("O prazo para cancelar já passou.")).toBeVisible();
    expect(screen.getByRole("button", { name: /Cancelar Corte masculino/ })).toBeVisible();
  });
});

describe("modo profissional", () => {
  it("entra com e-mail e senha pela API e mostra a agenda do dia; concluir marca o atendimento", async () => {
    renderizarTela(<TelaModoProfissional />);
    await userEvent.type(
      await screen.findByLabelText("E-mail"),
      "dono@barbearia-do-ze.exemplo.test",
    );
    await userEvent.type(screen.getByLabelText("Senha"), "senha-mock-123");
    await userEvent.click(screen.getByRole("button", { name: "Entrar" }));
    const concluir = await screen.findAllByRole("button", { name: /Concluir/ });
    await userEvent.click(concluir[0] as HTMLElement);
    await waitFor(() => expect(screen.getAllByText(/Concluído/).length).toBe(1));
  });

  it("senha errada mostra o erro estável da API", async () => {
    renderizarTela(<TelaModoProfissional />);
    await userEvent.type(
      await screen.findByLabelText("E-mail"),
      "dono@barbearia-do-ze.exemplo.test",
    );
    await userEvent.type(screen.getByLabelText("Senha"), "errada");
    await userEvent.click(screen.getByRole("button", { name: "Entrar" }));
    expect(await screen.findByText("E-mail ou senha incorretos.")).toBeVisible();
  });
});
