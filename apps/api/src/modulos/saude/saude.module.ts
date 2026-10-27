import { Module } from "@nestjs/common";
import { SaudeController } from "./interface/saude.controller";

@Module({ controllers: [SaudeController] })
export class SaudeModule {}
