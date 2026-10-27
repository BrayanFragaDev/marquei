import { Module } from "@nestjs/common";
import { NucleoModule } from "./nucleo/nucleo.module";
import { SaudeModule } from "./modulos/saude/saude.module";
import { IdentidadeModule } from "./modulos/identidade/identidade.module";
import { TemaModule } from "./modulos/tema/tema.module";

// Registro de modulos: cada subagente acrescenta APENAS a sua linha em `imports`.
@Module({ imports: [NucleoModule, SaudeModule, IdentidadeModule, TemaModule] })
export class AppModule {}
