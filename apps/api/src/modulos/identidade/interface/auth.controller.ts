import { Body, Controller, HttpCode, Post } from "@nestjs/common";
import { Publica } from "../../../seguranca/decoradores/publica";
import { LoginPorEmailESenha } from "../aplicacao/login-por-email-e-senha";
import { entradaDeLoginDoCorpo } from "./login.dto";

interface RespostaDeLogin {
  token: string;
  expiraEm: string;
  usuarioId: string;
  papel: string;
  estabelecimentoId: string;
}

@Controller("v1/auth")
export class AuthController {
  constructor(private readonly login: LoginPorEmailESenha) {}

  @Publica()
  @HttpCode(200)
  @Post("login")
  async entrar(@Body() corpo: unknown): Promise<RespostaDeLogin> {
    const saida = await this.login.execute(entradaDeLoginDoCorpo(corpo));
    return {
      token: saida.token,
      expiraEm: saida.expiraEm.paraIso(),
      usuarioId: saida.usuarioId.valor,
      papel: saida.papel.nome,
      estabelecimentoId: saida.estabelecimentoId.valor,
    };
  }
}
