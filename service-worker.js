/* =====================================================
   Service Worker - TradersXauusd Journal (Offline Ready)
   ===================================================== */

const CACHE_NAME = "tradersxauusd-journal-v2";

// Daftar file penting yang akan dicache untuk offline
const ASSETS_TO_CACHE = [
  "/",                     // root
  "/index.html",
  "/manifest.json",
  "/supabase.js",
  "/popup-ads.js",
  "/service-worker.js",
  "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js",
  "https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"
];

// INSTALL EVENT — caching file statis
self.addEventListener("install", (event) => {
  console.log("⚙️ Service Worker: installing...");
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log("📦 Caching assets...");
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// ACTIVATE EVENT — hapus cache lama
self.addEventListener("activate", (event) => {
  console.log("🔄 Service Worker: activating...");
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("🧹 Menghapus cache lama:", key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// FETCH EVENT — ambil dari cache dulu, baru ke network
self.addEventListener("fetch", (event) => {
  // skip POST (misal request ke Supabase)
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // kalau ada di cache → pakai
        if (cachedResponse) return cachedResponse;

        // kalau gak ada → ambil dari network & simpan ke cache
        return fetch(event.request)
          .then((networkResponse) => {
            if (!networkResponse || networkResponse.status !== 200) {
              return networkResponse;
            }

            const clonedResponse = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, clonedResponse);
            });
            return networkResponse;
          })
          .catch(() => {
            // fallback kalau offline
            if (event.request.destination === "document") {
              return caches.match("/index.html");
            }
          });
      })
  );
});

// Pesan manual clear cache
self.addEventListener("message", (event) => {
  if (event.data === "clearCache") {
    caches.keys().then(keys => keys.forEach(key => caches.delete(key)));
    console.log("🧽 Cache dibersihkan manual oleh user.");
  }
});
