import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { carregarEnv } from "@marquei/config/env";
import { AppModule } from "./app.module";

async function iniciar(): Promise<void> {
  const env = carregarEnv(process.env);
  const app = await NestFactory.create(AppModule);
  await app.listen(env.API_PORT);
}

void iniciar();
