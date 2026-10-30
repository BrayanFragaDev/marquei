import {
  EstabelecimentoId,
  Instante,
  Papel,
  Sessao,
  UsuarioId,
  ErroDeDominio,
} from "@marquei/dominio";
import { describe, expect, it } from "vitest";
import {
  AutorDaAlteracao,
  SemPermissaoParaAlterarTemaError,
  TemaPublicado,
  TemaRascunhoSalvo,
} from "../src";

const TENANT = EstabelecimentoId.de("00000000-0000-4000-8000-0000000000a1");
const USUARIO = UsuarioId.de("00000000-0000-4000-8000-000000000001");
const AGORA = Instante.deIso("2030-01-10T12:00:00Z");

const sessaoDe = (papel: Papel, tenant: EstabelecimentoId | null = TENANT): Sessao =>
  Sessao.criar({
    usuarioId: USUARIO,
    papel,
    tenant: papel === Papel.OperadorPlataforma ? null : tenant,
    emitidaEm: AGORA,
    validadeEmMinutos: 15,
  });

describe("autor da alteracao do tema", () => {
  it.each([Papel.Dono, Papel.Gestor])("%s pode alterar o tema do proprio estabelecimento", (p) => {
    const autor = AutorDaAlteracao.deSessao(sessaoDe(p));
    expect(autor.estabelecimentoId.igual(TENANT)).toBe(true);
    expect(autor.usuarioId.igual(USUARIO)).toBe(true);
    expect(autor.tipoDeAtor).toBe("gestor");
  });

  it.each([Papel.Profissional, Papel.ClienteFinal, Papel.OperadorPlataforma])(
    "%s nao pode alterar o tema",
    (p) => {
      const erro = (() => {
        try {
          AutorDaAlteracao.deSessao(sessaoDe(p));
        } catch (e) {
          return e;
        }
        return null;
      })();
      expect(erro).toBeInstanceOf(SemPermissaoParaAlterarTemaError);
      expect(erro).toBeInstanceOf(ErroDeDominio);
      expect(erro).toMatchObject({ codigo: "sem_permissao_para_alterar_tema" });
    },
  );
});

describe("eventos do tema", () => {
  const autor = AutorDaAlteracao.deSessao(sessaoDe(Papel.Dono));

  it("tema_rascunho_salvo carrega versao e campos alterados, sem dado pessoal", () => {
    const evento = new TemaRascunhoSalvo({
      autor,
      ocorridoEm: AGORA,
      versao: 3,
      camposAlterados: ["cores.primaria", "raio"],
    });
    expect(evento.nome).toBe("tema_rascunho_salvo");
    expect(evento.estabelecimentoId.igual(TENANT)).toBe(true);
    expect(evento.ocorridoEm).toBe(AGORA);
    expect(evento.propriedades).toEqual({
      versao: 3,
      campos_alterados: "cores.primaria,raio",
      ator_tipo: "gestor",
      ator_id: USUARIO.valor,
    });
  });

  it("tema_publicado carrega versao e o menor contraste arredondado a 2 casas", () => {
    const evento = new TemaPublicado({
      autor,
      ocorridoEm: AGORA,
      versao: 2,
      contrasteMinimo: 4.567891,
    });
    expect(evento.nome).toBe("tema_publicado");
    expect(evento.propriedades).toEqual({
      versao: 2,
      contraste_minimo: 4.56,
      ator_tipo: "gestor",
      ator_id: USUARIO.valor,
    });
  });
});
