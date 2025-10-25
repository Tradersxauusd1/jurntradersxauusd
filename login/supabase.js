v/* ==========================================================
   Supabase Sync Module — TradersXAUUSD (Final GitHub Pages Build)
   ========================================================== */

if (!window._supabaseInitialized) {
  window._supabaseInitialized = true;

  // ===== KONFIGURASI SUPABASE =====
  const SUPABASE_URL = "https://zejfddhbvqzuzjnxaqcy.supabase.co";
  const SUPABASE_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplamZkZGhidnF6dXpqbnhhcWN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5MzEwNzIsImV4cCI6MjA3NjUwNzA3Mn0.YMYUSHarC5aVLVuXTvi3QmgJ7ZlUOVGHYoueixSffUQ";

  // ===== INISIALISASI CLIENT =====
  try {
    window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: localStorage,
        storageKey: "sb-tradersxauusd-session",
      },
    });

    console.log("✅ Supabase client aktif:", SUPABASE_URL);
    showToast("Koneksi Supabase aktif", "☁️");
  } catch (err) {
    console.error("❌ Gagal inisialisasi Supabase:", err.message);
    showToast("Koneksi Supabase gagal!", "⚠️");
  }

  // ===== CEK STATUS LOGIN =====
  async function getUser() {
    try {
      const { data, error } = await supabaseClient.auth.getUser();
      if (error) throw error;
      return data?.user || null;
    } catch (e) {
      console.error("❌ Gagal ambil user:", e.message);
      showToast("Koneksi Supabase error", "⚠️");
      return null;
    }
  }

  // ===== LOGOUT =====
  async function logout() {
    try {
      await supabaseClient.auth.signOut();
      localStorage.removeItem("trades");
      showToast("Anda telah logout", "👋");
      window.location.href = "/login/";
    } catch (err) {
      console.error("Logout gagal:", err.message);
    }
  }

  // ===== MINI TOAST =====
  function showToast(message, emoji = "💡") {
    const toast = document.createElement("div");
    toast.textContent = `${emoji} ${message}`;
    Object.assign(toast.style, {
      position: "fixed",
      bottom: "20px",
      left: "50%",
      transform: "translateX(-50%)",
      background: "rgba(25,25,25,0.9)",
      color: "#ffd65a",
      padding: "10px 18px",
      border: "1px solid rgba(255,214,90,0.5)",
      borderRadius: "10px",
      boxShadow: "0 0 12px rgba(255,214,90,0.3)",
      fontWeight: "600",
      fontSize: "0.9rem",
      opacity: "0",
      transition: "all 0.4s ease",
      zIndex: 9999,
    });
    document.body.appendChild(toast);
    setTimeout(() => (toast.style.opacity = "1"), 50);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(20px)";
      setTimeout(() => toast.remove(), 400);
    }, 3500);
  }

  // ===== VERIFIKASI KONEKSI OTOMATIS =====
  document.addEventListener("DOMContentLoaded", async () => {
    try {
      const { data, error } = await supabaseClient.from("trades").select("id").limit(1);
      if (error) throw error;
      console.log("🔗 Supabase online dan siap digunakan.");
      showToast("Supabase terhubung", "🟢");
    } catch {
      console.error("🚫 Tidak bisa konek ke Supabase — periksa URL/key.");
      showToast("Supabase tidak terhubung!", "🔴");
    }
  });
}
