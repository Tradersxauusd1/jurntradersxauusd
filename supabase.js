/* ==========================================================
   Supabase Sync Module — TradersXAUUSD (Final Stable Build)
   ========================================================== */

if (!window._supabaseInitialized) {
  window._supabaseInitialized = true;

  // ====== KONFIGURASI SUPABASE ======
  const SUPABASE_URL = "https://zejfddhbvqzuzjnxaqcy.supabase.co";
  const SUPABASE_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplamZkZGhidnF6dXpqbnhhcWN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5MzEwNzIsImV4cCI6MjA3NjUwNzA3Mn0.YMYUSHarC5aVLVuXTvi3QmgJ7ZlUOVGHYoueixSffUQ";

  // ====== INISIALISASI CLIENT ======
  window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: localStorage,
      storageKey: "sb-tradersxauusd-session",
    },
  });

  // ====== CEK STATUS LOGIN ======
  async function getUser() {
    try {
      const { data } = await supabaseClient.auth.getUser();
      return data?.user || null;
    } catch (e) {
      console.error("Gagal ambil user:", e.message);
      return null;
    }
  }

  // ====== LOGOUT USER ======
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

  // ====== MINI TOAST NOTIFIKASI ======
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
    }, 3000);
  }

  // ====== STATUS SINKRON FLOAT ======
  function setSyncStatus(message, color = "#ffd65a") {
    let el = document.getElementById("syncStatus");
    if (!el) {
      el = document.createElement("div");
      el.id = "syncStatus";
      Object.assign(el.style, {
        position: "fixed",
        bottom: "15px",
        right: "15px",
        padding: "8px 16px",
        borderRadius: "8px",
        color: "#000",
        fontWeight: "600",
        boxShadow: "0 0 10px rgba(255,214,90,0.4)",
        transition: "opacity 0.3s ease, transform 0.3s ease",
        zIndex: 9999,
      });
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.style.background = color;
    el.style.opacity = "1";
    el.style.transform = "translateX(0)";
    clearTimeout(el._timeout);
    el._timeout = setTimeout(() => {
      el.style.opacity = "0.5";
      el.style.transform = "translateX(40px)";
    }, 10000);
  }

  // ====== CRUD UNTUK TABEL TRADES ======
  const SupabaseSync = {
    async push(trade) {
      try {
        const user = await getUser();
        if (!user) {
          setSyncStatus("💾 Offline — data disimpan lokal", "#ff7575");
          return;
        }
        trade.user_id = user.id;
        const { error } = await supabaseClient.from("trades").insert([trade]);
        if (error) throw error;
        showToast("Trade baru ditambahkan!", "💹");
      } catch (err) {
        console.error("❌ Gagal push:", err.message);
        setSyncStatus("❌ Gagal menyimpan", "#ff5757");
      }
    },
    async fetchAll() {
      const user = await getUser();
      if (!user) return [];
      const { data, error } = await supabaseClient
        .from("trades")
        .select("*")
        .eq("user_id", user.id)
        .order("trade_date", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    async delete(id) {
      const user = await getUser();
      if (!user) return;
      const { error } = await supabaseClient
        .from("trades")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);
      if (error) throw error;
      showToast("Trade dihapus!", "🗑️");
    },
  };

  // ====== REALTIME LISTENER ======
  async function setupRealtimeListener() {
    const user = await getUser();
    if (!user) return;
    supabaseClient
      .channel("trades-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "trades", filter: `user_id=eq.${user.id}` },
        (payload) => {
          if (payload.eventType === "INSERT") showToast("Trade baru ditambahkan!", "💹");
          if (payload.eventType === "UPDATE") showToast("Data trade diubah!", "🧾");
          if (payload.eventType === "DELETE") showToast("Trade dihapus!", "🗑️");
          refreshRealtimeData();
        }
      )
      .subscribe();
  }

  async function refreshRealtimeData() {
    try {
      const trades = await SupabaseSync.fetchAll();
      localStorage.setItem("trades", JSON.stringify(trades));
      if (typeof renderTrades === "function") renderTrades();
      if (typeof updateAll === "function") updateAll();
    } catch (err) {
      console.error("❌ Realtime sync error:", err.message);
    }
  }

  // ====== PAGE LOAD ======
  document.addEventListener("DOMContentLoaded", async () => {
    const user = await getUser();
    if (user) {
      setSyncStatus(`☁️ Online sebagai ${user.email}`, "#00ff7f");
      setupRealtimeListener();
    } else {
      setSyncStatus("💾 Offline — belum login", "#ff7575");
    }
  });
}
