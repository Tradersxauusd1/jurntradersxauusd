/* =====================================================
   Service Worker - TradersXauusd Journal (Offline + Login Ready)
   ===================================================== */

const CACHE_NAME = "tradersxauusd-journal-v3";

const ASSETS_TO_CACHE = [
  "/", // root
  "/index.html",
  "/manifest.json",
  "/popup-ads.js",
  "/service-worker.js",
  "/login/",
  "/login/index.html",
  "/login/supabase.js",
  "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2",
  "https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"
];

// INSTALL — cache assets penting
self.addEventListener("install", (event) => {
  console.log("⚙️ Service Worker: installing...");
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// ACTIVATE — hapus cache lama
self.addEventListener("activate", (event) => {
  console.log("🔄 Service Worker: activating...");
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("🧹 Menghapus cache lama:", key);
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// FETCH — ambil cache dulu, baru ke network
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200) return response;
          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, cloned);
          });
          return response;
        })
        .catch(() => {
          if (event.request.destination === "document") {
            return caches.match("/index.html");
          }
        });
    })
  );
});

// CLEAR CACHE MANUAL
self.addEventListener("message", (event) => {
  if (event.data === "clearCache") {
    caches.keys().then((keys) => keys.forEach((key) => caches.delete(key)));
    console.log("🧽 Cache dibersihkan manual.");
  }
});
