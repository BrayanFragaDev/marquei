import { Controller, Get } from "@nestjs/common";

@Controller("v1/saude")
export class SaudeController {
  @Get()
  verificar(): { status: "ok" } {
    return { status: "ok" };
  }
}
