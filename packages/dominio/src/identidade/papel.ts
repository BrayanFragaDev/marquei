import { Audiencia } from "./audiencia";
import { PapelInvalidoError } from "./papel-invalido-error";

export type NomeDoPapel =
  "cliente_final" | "profissional" | "gestor" | "dono" | "operador_plataforma";

/** Papel de quem acessa o sistema. Objeto de valor com instancias unicas (compare com `===`). */
export class Papel {
  static readonly ClienteFinal = new Papel("cliente_final", Audiencia.AppCliente, true);
  static readonly Profissional = new Papel("profissional", Audiencia.ConsoleEstabelecimento, true);
  static readonly Gestor = new Papel("gestor", Audiencia.ConsoleEstabelecimento, true);
  static readonly Dono = new Papel("dono", Audiencia.ConsoleEstabelecimento, true);
  static readonly OperadorPlataforma = new Papel(
    "operador_plataforma",
    Audiencia.ConsolePlataforma,
    false,
  );

  private static readonly TODOS: readonly Papel[] = [
    Papel.ClienteFinal,
    Papel.Profissional,
    Papel.Gestor,
    Papel.Dono,
    Papel.OperadorPlataforma,
  ];

  private constructor(
    readonly nome: NomeDoPapel,
    private readonly _audiencia: Audiencia,
    private readonly _exigeTenant: boolean,
  ) {}

  static de(texto: string): Papel {
    const papel = Papel.TODOS.find((p) => p.nome === texto);
    if (!papel) throw new PapelInvalidoError();
    return papel;
  }

  audiencia(): Audiencia {
    return this._audiencia;
  }

  /** Todo papel, exceto o operador da plataforma, vive dentro de um estabelecimento. */
  exigeTenant(): boolean {
    return this._exigeTenant;
  }

  pertenceAoConsoleDoEstabelecimento(): boolean {
    return this._audiencia === Audiencia.ConsoleEstabelecimento;
  }

  gerenciaEstabelecimento(): boolean {
    return this === Papel.Dono || this === Papel.Gestor;
  }

  toString(): string {
    return this.nome;
  }
}
