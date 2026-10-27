import { RequestMethod, type INestApplication } from "@nestjs/common";
import { METHOD_METADATA, PATH_METADATA } from "@nestjs/common/constants";
import { DiscoveryService, MetadataScanner, ModulesContainer, Reflector } from "@nestjs/core";
import request from "supertest";
import { ROTA_PUBLICA } from "../../src/seguranca/decoradores/publica";

export interface RotaDescoberta {
  readonly metodo: string;
  readonly caminho: string;
  readonly publica: boolean;
}

export interface ResultadoDaAuditoria {
  readonly publicas: readonly string[];
  readonly protegidas: readonly string[];
  readonly desprotegidas: readonly string[];
}

const rotulo = (r: RotaDescoberta): string => `${r.metodo} ${r.caminho}`;

function juntar(base: unknown, rota: unknown): string {
  const partes = [base, rota].flatMap((p) => (typeof p === "string" ? [p] : []));
  return (
    "/" +
    partes
      .map((p) => p.replace(/^\/+|\/+$/g, ""))
      .filter(Boolean)
      .join("/")
  );
}

/** Percorre TODOS os controllers registrados e lista cada rota com a marca `@Publica()`. */
export function descobrirRotas(app: INestApplication): RotaDescoberta[] {
  const descoberta = new DiscoveryService(app.get(ModulesContainer));
  const escaner = new MetadataScanner();
  const reflector = new Reflector();
  const rotas: RotaDescoberta[] = [];
  for (const { metatype, instance } of descoberta.getControllers()) {
    if (!metatype || !instance) continue;
    const base: unknown = Reflect.getMetadata(PATH_METADATA, metatype);
    for (const nome of escaner.getAllMethodNames(Object.getPrototypeOf(instance))) {
      const manipulador = (instance as Record<string, unknown>)[nome] as () => unknown;
      const metodo: unknown = Reflect.getMetadata(METHOD_METADATA, manipulador);
      if (typeof metodo !== "number") continue;
      const caminho: unknown = Reflect.getMetadata(PATH_METADATA, manipulador);
      rotas.push({
        metodo: RequestMethod[metodo] ?? "?",
        caminho: juntar(base, caminho),
        publica:
          reflector.getAllAndOverride<boolean>(ROTA_PUBLICA, [manipulador, metatype]) === true,
      });
    }
  }
  return rotas;
}

/**
 * Rota publica: so conta se estiver marcada com `@Publica()`. Rota nao publica: precisa
 * responder 401 a uma requisicao sem credencial; qualquer outra resposta e "desprotegida".
 */
export async function auditarRotas(app: INestApplication): Promise<ResultadoDaAuditoria> {
  const publicas: string[] = [];
  const protegidas: string[] = [];
  const desprotegidas: string[] = [];
  for (const rota of descobrirRotas(app)) {
    if (rota.publica) {
      publicas.push(rotulo(rota));
      continue;
    }
    const caminho = rota.caminho.replace(/:[^/]+/g, "00000000-0000-4000-8000-000000000000");
    const resposta = await request(app.getHttpServer())[rota.metodo.toLowerCase() as "get"](
      caminho,
    );
    (resposta.status === 401 ? protegidas : desprotegidas).push(rotulo(rota));
  }
  return { publicas, protegidas, desprotegidas };
}
