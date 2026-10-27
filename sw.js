/* Knochenkabinett · Service-Worker: das Spiel läuft nach dem ersten Besuch auch offline.
   Seiten: zuerst das Netz (damit Updates sofort ankommen), sonst der Speicher. Bilder/Symbole: zuerst der Speicher.
   Keine Daten verlassen das Gerät; der Spielstand liegt im Browser (localStorage), nicht hier. */
const CACHE = "kk-release-candidate-24-202610271253";
const CORE = ["/", "/spielen/", "/manifest.webmanifest", "/icons/icon-192.png", "/icons/icon-512.png", "/icons/apple-touch-icon.png", "/icons/favicon-48.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const r = e.request; if (r.method !== "GET" || new URL(r.url).origin !== location.origin) return;
  const page = r.mode === "navigate" || (r.headers.get("accept") || "").includes("text/html");
  if (page) e.respondWith(fetch(r).then(res => { const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)); return res; }).catch(() => caches.match(r).then(m => m || caches.match("/spielen/"))));
  else e.respondWith(caches.match(r).then(m => m || fetch(r).then(res => { const cp = res.clone(); caches.open(CACHE).then(c => c.put(r, cp)); return res; })));
});
