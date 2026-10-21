const CACHE = "zusda-v2";

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return; // never touch the API or fonts

  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req)
        .then((r) => {
          if (r.ok) {
            const copy = r.clone();
            return caches.open(CACHE).then((c) => c.put("/", copy)).then(() => r);
          }
          return r;
        })
        .catch(() => caches.match("/"))
    );
    return;
  }

  if (url.pathname.startsWith("/assets/")) {
    e.respondWith(
      caches.match(req).then((hit) => {
        if (hit) return hit;
        return fetch(req).then((r) => {
          if (r.ok) {
            const copy = r.clone();
            return caches.open(CACHE).then((c) => c.put(req, copy)).then(() => r);
          }
          return r;
        });
      })
    );
    return;
  }

  e.respondWith(
    caches.match(req).then((hit) => {
      const net = fetch(req)
        .then((r) => {
          if (r.ok) {
            const copy = r.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return r;
        })
        .catch(() => hit);
      return hit || net;
    })
  );
});
