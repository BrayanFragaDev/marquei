import { Controller, Get } from "@nestjs/common";
import { Publica } from "../../../seguranca/decoradores/publica";

@Controller("v1/saude")
export class SaudeController {
  @Publica()
  @Get()
  verificar(): { status: "ok" } {
    return { status: "ok" };
  }
}
