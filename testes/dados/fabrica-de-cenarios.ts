import { CenarioDeTeste } from "./cenario-de-teste.js";
import { ClienteDeTeste } from "./cliente-de-teste.js";
import { EstabelecimentoDeTeste } from "./estabelecimento-de-teste.js";
import { ProfissionalDeTeste } from "./profissional-de-teste.js";
import { ServicoDeTeste } from "./servico-de-teste.js";

/** Instante fixo de referencia para testes (UTC). Nunca leia o relogio real. */
export const INSTANTE_DE_REFERENCIA = "2030-01-15T12:00:00.000Z";

/**
 * Fabrica deterministica: sem aleatoriedade e sem relogio. Chamar duas vezes
 * produz exatamente os mesmos dados. Base da futura suite de vazamento entre tenants.
 */
export class FabricaDeCenarios {
  estabelecimentoA(): CenarioDeTeste {
    return this.montar({
      sufixo: "a",
      prefixoDeId: "aaaaaaaa",
      nome: "Barbearia Alfa",
      servico: { nome: "Corte masculino", duracao: 30, preco: 4500 },
      profissional: "Ana Alfa",
      cliente: { nome: "Carlos Cliente Alfa", telefone: "+5511999990001" },
    });
  }

  estabelecimentoB(): CenarioDeTeste {
    return this.montar({
      sufixo: "b",
      prefixoDeId: "bbbbbbbb",
      nome: "Studio Beta",
      servico: { nome: "Manicure", duracao: 45, preco: 6000 },
      profissional: "Beatriz Beta",
      cliente: { nome: "Daniela Cliente Beta", telefone: "+5511999990002" },
    });
  }

  private montar(dados: DadosDoCenario): CenarioDeTeste {
    const estabelecimentoId = idFixo(dados.prefixoDeId, "0001");
    return new CenarioDeTeste(
      new EstabelecimentoDeTeste(
        estabelecimentoId,
        dados.nome,
        `teste-${dados.sufixo}`,
        "America/Sao_Paulo",
      ),
      new ServicoDeTeste({
        id: idFixo(dados.prefixoDeId, "0002"),
        estabelecimentoId,
        nome: dados.servico.nome,
        duracaoEmMinutos: dados.servico.duracao,
        precoEmCentavos: dados.servico.preco,
      }),
      new ProfissionalDeTeste(
        idFixo(dados.prefixoDeId, "0003"),
        estabelecimentoId,
        dados.profissional,
      ),
      new ClienteDeTeste(
        idFixo(dados.prefixoDeId, "0004"),
        estabelecimentoId,
        dados.cliente.nome,
        dados.cliente.telefone,
      ),
    );
  }
}

interface DadosDoCenario {
  readonly sufixo: string;
  readonly prefixoDeId: string;
  readonly nome: string;
  readonly servico: { readonly nome: string; readonly duracao: number; readonly preco: number };
  readonly profissional: string;
  readonly cliente: { readonly nome: string; readonly telefone: string };
}

/** Monta um UUID v4 valido e fixo a partir de um prefixo de 8 hex e um sufixo de 4 hex. */
function idFixo(prefixo: string, sequencia: string): string {
  return `${prefixo}-0000-4000-8000-00000000${sequencia}`;
}
