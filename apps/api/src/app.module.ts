import { Module } from "@nestjs/common";
import { SaudeModule } from "./modulos/saude/saude.module";

// Registro de modulos: cada subagente acrescenta APENAS a sua linha em `imports`.
@Module({ imports: [SaudeModule] })
export class AppModule {}
