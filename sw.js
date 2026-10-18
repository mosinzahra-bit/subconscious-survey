// Start screen + game: use the newest version when the internet answers quickly,
// otherwise the saved copy. With no saved copy yet, always wait for the download.
const CACHE = "bubbles-v6";
const FILES = ["./", "index.html", "game.html", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png", "icons/maskable-512.png", "icons/apple-180.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => Promise.all(FILES.map(f =>
    fetch(new Request(f, {cache: "reload"})).then(r => r.ok && c.put(f, r)).catch(() => {})))));
  self.skipWaiting();
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
function keyFor(url) {
  const p = new URL(url).pathname;
  if (/\/game\.html$/.test(p)) return "game.html";
  if (/\/(index\.html)?$/.test(p)) return "./";
  return null;
}
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const key = keyFor(req.url);
  if (key) {
    e.respondWith(caches.open(CACHE).then(c => c.match(key).then(saved => {
      const net = fetch(req, {cache: "no-store"}).then(res => { if (res.ok) c.put(key, res.clone()); return res; });
      if (!saved) return net;                                   // first time: wait for the real download
      return new Promise(resolve => {                           // saved copy exists: newest if quick, else saved
        const t = setTimeout(() => resolve(saved), 3000);
        net.then(res => { clearTimeout(t); resolve(res.ok ? res : saved); }, () => { clearTimeout(t); resolve(saved); });
      });
    })));
    return;
  }
  e.respondWith(caches.match(req, {ignoreSearch: true}).then(hit => hit || fetch(req).then(res => {
    const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res;
  })));
});
