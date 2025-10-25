/* ==========================================================
   Supabase Sync Module — TradersXAUUSD (Final GitHub Pages Fix)
   ========================================================== */

if (!window._supabaseInitialized) {
  window._supabaseInitialized = true;

  // ===== KONFIGURASI SUPABASE =====
  const SUPABASE_URL = "https://zejfddhbvqzuzjnxaqcy.supabase.co";
  const SUPABASE_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplamZkZGhidnF6dXpqbnhhcWN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5MzEwNzIsImV4cCI6MjA3NjUwNzA3Mn0.YMYUSHarC5aVLVuXTvi3QmgJ7ZlUOVGHYoueixSffUQ";

  // ===== INISIALISASI CLIENT =====
  const { createClient } = window.supabase;
  window.supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: localStorage,
      storageKey: "sb-tradersxauusd-session",
    },
  });

  // ===== UTIL: TOAST STATUS =====
  function showToast(msg, emoji = "💡") {
    const el = document.createElement("div");
    el.textContent = `${emoji} ${msg}`;
    Object.assign(el.style, {
      position: "fixed",
      bottom: "20px",
      left: "50%",
      transform: "translateX(-50%)",
      background: "rgba(25,25,25,0.9)",
      color: "#ffd65a",
      padding: "10px 18px",
      border: "1px solid rgba(255,214,90,0.5)",
      borderRadius: "10px",
      fontWeight: "600",
      opacity: "0",
      zIndex: 9999,
      transition: "all 0.4s ease",
    });
    document.body.appendChild(el);
    setTimeout(() => (el.style.opacity = "1"), 50);
    setTimeout(() => {
      el.style.opacity = "0";
      el.style.transform = "translateY(20px)";
      setTimeout(() => el.remove(), 400);
    }, 2500);
  }

  // ===== AUTH: LOGIN EMAIL / PASSWORD =====
  async function loginWithEmail(email, password) {
    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      showToast("Login sukses, mengarahkan...", "✅");
      setTimeout(() => window.location.replace("https://jurnaltradersxauusd.my.id/"), 1000);
    } catch (err) {
      console.error("Login error:", err.message);
      showToast("Terjadi kesalahan koneksi.", "⚠️");
    }
  }

  // ===== CEK USER SUDAH LOGIN =====
  async function checkSession() {
    try {
      const { data } = await supabaseClient.auth.getUser();
      if (data.user) {
        console.log("🔒 Sudah login sebagai:", data.user.email);
        window.location.href = "/index.html";
      }
    } catch (err) {
      console.warn("Belum login:", err.message);
    }
  }

  window.loginWithEmail = loginWithEmail;
  window.checkSession = checkSession;

  document.addEventListener("DOMContentLoaded", checkSession);
}

