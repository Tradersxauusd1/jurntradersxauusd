/* =====================================================
   ✅ Service Worker — TradersXauusd Journal (Final Stable Build v5)
   ===================================================== */

const CACHE_NAME = "tradersxauusd-journal-v5";
const ASSETS_TO_CACHE = [
  "/", 
  "/index.html",
  "/manifest.json",
  "/popup-ads.js",
  "/service-worker.js",
  "/icon-192.png",
  "/icon-512.png",
  "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2",
  "https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"
];

// ===== INSTALL CACHE =====
self.addEventListener("install", (event) => {
  console.log("⚙️ SW: Installing and caching essential assets...");
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// ===== ACTIVATE CACHE =====
self.addEventListener("activate", (event) => {
  console.log("♻️ SW: Activating new cache...");
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log("🧹 SW: Deleting old cache:", key);
            return caches.delete(key);
          }
        })
      );
      await self.clients.claim();
    })()
  );
});

// ===== FETCH HANDLER =====
self.addEventListener("fetch", (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // ⛔ Jangan cache halaman login
  if (url.pathname.startsWith("/login")) {
    console.log("🚫 SW: Bypass caching for", url.pathname);
    return;
  }

  // Tangani permintaan GET saja
  if (req.method !== "GET") return;

  // Prioritaskan cache → fallback ke network
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;

      return fetch(req)
        .then((res) => {
          if (!res || res.status !== 200 || res.type !== "basic") return res;
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone));
          return res;
        })
        .catch(() => caches.match("/index.html"));
    })
  );
});

// ===== MANUAL CLEAR CACHE =====
self.addEventListener("message", (event) => {
  if (event.data === "clearCache") {
    caches.keys().then((keys) => keys.forEach((key) => caches.delete(key)));
    console.log("🧽 SW: Cache cleared manually.");
  }
});

// ===== URL CLEANUP (hapus index.html dari address bar) =====
self.addEventListener("fetch", (event) => {
  if (event.request.mode === "navigate") {
    event.respondWith(
      (async () => {
        const response = await fetch(event.request).catch(() => caches.match("/index.html"));
        if (response && response.redirected) {
          // Biar URL gak nempel index.html
          const newUrl = response.url.replace("/index.html", "/");
          if (newUrl !== response.url) {
            return Response.redirect(newUrl, 301);
          }
        }
        return response;
      })()
    );
  }
});
