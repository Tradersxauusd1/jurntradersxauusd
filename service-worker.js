/* =====================================================
   ⚡ FINAL SERVICE WORKER — TradersXauusd Journal v6
   ===================================================== */

const CACHE_NAME = "tradersxauusd-final-v6";
const ASSETS = [
  "/", 
  "/index.html",
  "/login/index.html",      // ← Path ke login
  "/app/index.html",        // ← Path ke app dashboard
  "/manifest.json",
  "/popup-ads.js", 
  "/icon-192.png", 
  "/icon-512.png",
  "/telegram.html",
  "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2",
  "https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"
];

// ========== INSTALL ==========
self.addEventListener("install", e => {
  console.log("⚙️ [SW] Installing...");
  e.waitUntil(
    caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

// ========== ACTIVATE ==========
self.addEventListener("activate", e => {
  console.log("♻️ [SW] Activating...");
  e.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(keys.map(k => k !== CACHE_NAME && caches.delete(k)));
      await self.clients.claim();
      console.log("✅ [SW] Ready & controlling all clients");
    })()
  );
});

// ========== FETCH ==========
self.addEventListener("fetch", e => {
  const req = e.request;
  const url = new URL(req.url);

  // 🚫 Jangan cache halaman login & Supabase
  if (url.pathname.startsWith("/login") || url.hostname.includes("supabase")) {
    return; // langsung lewati biar fresh
  }

  // 🔁 Untuk halaman utama
  if (req.mode === "navigate") {
    e.respondWith(
      (async () => {
        try {
          const netRes = await fetch(req);
          const cache = await caches.open(CACHE_NAME);
          cache.put(req, netRes.clone());
          return netRes;
        } catch {
          const cache = await caches.match("/index.html");
          return cache;
        }
      })()
    );
    return;
  }

  // 🗂️ Untuk file statis
  e.respondWith(
    caches.match(req).then(res => res || fetch(req).then(netRes => {
      if (!netRes || netRes.status !== 200 || netRes.type !== "basic") return netRes;
      const clone = netRes.clone();
      caches.open(CACHE_NAME).then(c => c.put(req, clone));
      return netRes;
    }).catch(() => caches.match("/index.html")))
  );
});

// ========== CLEAR CACHE MANUAL ==========
self.addEventListener("message", e => {
  if (e.data === "clearCache") {
    caches.keys().then(keys => keys.forEach(k => caches.delete(k)));
    console.log("🧹 [SW] Cache cleared manually");
  }
});

