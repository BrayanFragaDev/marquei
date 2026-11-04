/* global self, caches, fetch, Response, URL */
/* Service worker do app do cliente: cache do shell e do tema, fallback offline.
   Mantido em JavaScript simples porque roda fora do bundle do Next. */
const VERSAO = "v1";
const CACHE_DO_SHELL = `marquei-shell-${VERSAO}`;
const CACHE_DO_TEMA = `marquei-tema-${VERSAO}`;
const CACHE_ESTATICO = `marquei-estatico-${VERSAO}`;
const PAGINA_OFFLINE = "/offline.html";
const ROTA_DO_TEMA = /\/v1\/estabelecimentos\/[^/]+$/;

self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches
      .open(CACHE_DO_SHELL)
      .then((cache) => cache.add(PAGINA_OFFLINE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (evento) => {
  const atuais = [CACHE_DO_SHELL, CACHE_DO_TEMA, CACHE_ESTATICO];
  evento.waitUntil(
    caches
      .keys()
      .then((nomes) =>
        Promise.all(nomes.filter((n) => !atuais.includes(n)).map((n) => caches.delete(n))),
      )
      .then(() => self.clients.claim()),
  );
});

async function redeComCache(pedido, nomeDoCache) {
  const cache = await caches.open(nomeDoCache);
  try {
    const resposta = await fetch(pedido);
    if (resposta.ok) await cache.put(pedido, resposta.clone());
    return resposta;
  } catch (erro) {
    const guardada = await cache.match(pedido);
    if (guardada) return guardada;
    throw erro;
  }
}

async function cachePrimeiro(pedido) {
  const cache = await caches.open(CACHE_ESTATICO);
  const guardada = await cache.match(pedido);
  if (guardada) return guardada;
  const resposta = await fetch(pedido);
  if (resposta.ok) await cache.put(pedido, resposta.clone());
  return resposta;
}

async function navegacao(pedido) {
  try {
    return await redeComCache(pedido, CACHE_DO_SHELL);
  } catch {
    return (await caches.match(PAGINA_OFFLINE)) ?? Response.error();
  }
}

self.addEventListener("fetch", (evento) => {
  const pedido = evento.request;
  if (pedido.method !== "GET") return;
  const url = new URL(pedido.url);
  if (pedido.mode === "navigate") evento.respondWith(navegacao(pedido));
  else if (ROTA_DO_TEMA.test(url.pathname)) evento.respondWith(redeComCache(pedido, CACHE_DO_TEMA));
  else if (url.origin === self.location.origin && url.pathname.startsWith("/_next/static/"))
    evento.respondWith(cachePrimeiro(pedido));
});
