import { createServer, type IncomingMessage, type Server, type ServerResponse } from "node:http";
import { AGORA_PADRAO } from "./dados.ts";
import { EstadoDoMock } from "./rotas.ts";

export interface MockEmExecucao {
  readonly url: string;
  readonly servidor: Server;
  fechar(): Promise<void>;
}

function lerCorpo(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve) => {
    const pedacos: Buffer[] = [];
    req.on("data", (p: Buffer) => pedacos.push(p));
    req.on("end", () => {
      const texto = Buffer.concat(pedacos).toString("utf8");
      try {
        resolve(texto === "" ? undefined : (JSON.parse(texto) as unknown));
      } catch {
        resolve(undefined);
      }
    });
  });
}

function tokenDe(req: IncomingMessage): string | null {
  const cabecalho = req.headers.authorization;
  if (typeof cabecalho !== "string" || !cabecalho.startsWith("Bearer ")) return null;
  return cabecalho.slice("Bearer ".length).trim() || null;
}

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "authorization, content-type",
  "access-control-allow-methods": "GET, POST, PUT, OPTIONS",
};

async function atender(
  estado: EstadoDoMock,
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  if (req.method === "OPTIONS") {
    res.writeHead(204, CORS).end();
    return;
  }
  const url = new URL(req.url ?? "/", "http://mock.local");
  const resposta = estado.tratar({
    metodo: req.method ?? "GET",
    caminho: url.pathname,
    consulta: url.searchParams,
    corpo: await lerCorpo(req),
    token: tokenDe(req),
  });
  res.writeHead(resposta.status, { ...CORS, "content-type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(resposta.corpo));
}

/** Servidor HTTP do mock (so `node:http`). `porta: 0` escolhe uma porta livre (usado nos testes). */
export async function iniciarMock(opcoes: {
  porta: number;
  agora?: string;
}): Promise<MockEmExecucao> {
  const estado = new EstadoDoMock(new Date(opcoes.agora ?? AGORA_PADRAO));
  const servidor = createServer((req, res) => {
    void atender(estado, req, res);
  });
  await new Promise<void>((ok) => servidor.listen(opcoes.porta, ok));
  const endereco = servidor.address();
  const porta = typeof endereco === "object" && endereco ? endereco.port : opcoes.porta;
  return {
    url: `http://localhost:${porta}`,
    servidor,
    fechar: () => new Promise((ok, falha) => servidor.close((e) => (e ? falha(e) : ok()))),
  };
}
