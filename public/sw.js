const CACHE = "nexo-static-v1";

const OFFLINE_HTML = `<!doctype html><html lang="pt"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Nexo — sem ligação</title>
<style>
 body{margin:0;min-height:100vh;display:grid;place-items:center;background:#0b1b26;color:#e7f2f0;
 font-family:-apple-system,system-ui,sans-serif;text-align:center;padding:24px}
 .dot{width:56px;height:56px;border-radius:18px;background:linear-gradient(135deg,#0f766e,#0b1b26);
 display:grid;place-items:center;margin:0 auto 18px;font-weight:700;font-size:24px;color:#d9efec}
 p{color:#9fb6c2;max-width:280px;line-height:1.5}
</style></head><body><div><div class="dot">N</div><h1>Sem ligação</h1>
<p>O Nexo precisa de rede para sincronizar as tuas tarefas. Volta a tentar quando tiveres ligação.</p></div></body></html>`;

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then((c) => c.add("/icons/icon-192.png")).catch(() => {}));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (req.method !== "GET" || url.origin !== self.location.origin) return;
  if (url.pathname.startsWith("/api/")) return;

  // Navegação: rede primeiro, com página offline como recurso
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(async () => {
        const cached = await caches.match(req);
        if (cached) return cached;
        return new Response(OFFLINE_HTML, {
          headers: { "Content-Type": "text/html; charset=utf-8" },
        });
      })
    );
    return;
  }

  // Estáticos: serve da cache e atualiza em segundo plano
  if (["style", "script", "font", "image"].includes(req.destination)) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const network = fetch(req)
          .then((res) => {
            if (res.ok) {
              const copy = res.clone();
              caches.open(CACHE).then((c) => c.put(req, copy));
            }
            return res;
          })
          .catch(() => cached);
        return cached || network;
      })
    );
  }
});