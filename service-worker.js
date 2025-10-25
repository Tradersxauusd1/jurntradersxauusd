/* =====================================================
   Service Worker - TradersXauusd Journal (Final Stable Build)
   ===================================================== */

const CACHE_NAME = "tradersxauusd-journal-v4";

const ASSETS_TO_CACHE = [
  "/", 
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

// ======= INSTALL CACHE =======
self.addEventListener("install", (event) => {
  console.log("⚙️ SW: Installing & caching assets...");
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting()) // langsung aktif
  );
});

// ======= ACTIVATE (CLEAR OLD CACHE) =======
self.addEventListener("activate", (event) => {
  console.log("♻️ SW: Activating & cleaning old cache...");
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("🧹 SW: Menghapus cache lama:", key);
            return caches.delete(key);
          }
        })
      );
      await self.clients.claim(); // ambil kontrol penuh tab aktif
    })()
  );
});

// Fetch handler
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request)
        .then((response) => {
          if (!response || response.status !== 200) return response;
          const cloned = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, cloned));
          return response;
        })
        .catch(() => caches.match("/index.html"));
    })
  );
});

// Clear cache manual
self.addEventListener("message", (event) => {
  if (event.data === "clearCache") {
    caches.keys().then((keys) => keys.forEach((key) => caches.delete(key)));
    console.log("🧽 SW: Cache dibersihkan manual.");
  }
});

// 🔔 Notifikasi online/offline otomatis
self.addEventListener("sync", () => {
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({ status: "online" });
    });
  });
});

self.addEventListener("fetch", (event) => {
  if (!navigator.onLine) {
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({ status: "offline" });
      });
    });
  }
});

