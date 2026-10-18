// Network first for the game page (always get the newest version when online),
// cache for everything when offline.
const CACHE = "bubbles-v5";
const FILES = ["./", "index.html", "manifest.webmanifest",
  "icons/icon-192.png", "icons/icon-512.png", "icons/maskable-512.png", "icons/apple-180.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(FILES.map(f =>
    fetch(new Request(f, {cache: "reload"})).then(r => r.ok && c.put(f, r)).catch(() => {})))));
  self.skipWaiting();
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
function timeout(ms, p) { return new Promise((res, rej) => { const t = setTimeout(() => rej(new Error("timeout")), ms); p.then(v => { clearTimeout(t); res(v); }, err => { clearTimeout(t); rej(err); }); }); }
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const isPage = req.mode === "navigate" || req.destination === "document" || /\/(index\.html)?$/.test(new URL(req.url).pathname);
  if (isPage) {
    e.respondWith(timeout(6000, fetch(req, {cache: "no-store"})).then(res => {
      const copy = res.clone(); caches.open(CACHE).then(c => { c.put("./", copy.clone()); c.put("index.html", copy); }); return res;
    }).catch(() => caches.match("./").then(r => r || caches.match("index.html"))));
    return;
  }
  e.respondWith(caches.match(req, {ignoreSearch: true}).then(hit => hit || fetch(req).then(res => {
    const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res;
  })));
});
