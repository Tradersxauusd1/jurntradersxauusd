/* ==========================================================
   Supabase Sync Module – TradersXAUUSD (Final Fix)
   File: /login/supabase.js
   ========================================================== */

if (!window._supabaseInitialized) {
  window._supabaseInitialized = true;

  // ===== KONFIGURASI SUPABASE =====
  const SUPABASE_URL = "https://zejfddhbvqzuzjnxaqcy.supabase.co";
  const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InplamZkZGhidnF6dXpqbnhhcWN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5MzEwNzIsImV4cCI6MjA3NjUwNzA3Mn0.YMYUSHarC5aVLVuXTvi3QmgJ7ZlUOVGHYoueixSffUQ";

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

  console.log("✅ Supabase client initialized");

  // ===== SYNC HANDLER (CRUD Operations) =====
  window.SupabaseSync = {
    // Fetch semua data dari cloud
    async fetchAll() {
      if (!window.supabaseClient) {
        console.warn('⚠️ Supabase client tidak tersedia');
        return [];
      }

      try {
        const { data: sessionData } = await window.supabaseClient.auth.getSession();
        if (!sessionData?.session?.user) {
          console.warn('⚠️ User belum login');
          return [];
        }

        const userId = sessionData.session.user.id;

        const { data, error } = await window.supabaseClient
          .from('trades')
          .select('*')
          .eq('user_id', userId)
          .order('trade_date', { ascending: false });

        if (error) throw error;

        console.log(`☁️ Berhasil mengambil ${data?.length || 0} data dari cloud`);
        return data || [];

      } catch (err) {
        console.error('❌ Gagal fetch data:', err.message);
        return [];
      }
    },

    // Push data baru ke cloud
    async push(trade) {
      if (!window.supabaseClient) {
        console.warn('⚠️ Supabase client tidak tersedia');
        return false;
      }

      try {
        const { data: sessionData } = await window.supabaseClient.auth.getSession();
        if (!sessionData?.session?.user) {
          console.warn('⚠️ User belum login - data hanya disimpan lokal');
          return false;
        }

        const userId = sessionData.session.user.id;

        // Mapping data trade ke struktur tabel Supabase
        const payload = {
          user_id: userId,
          trade_date: trade.date,
          pair: trade.pair,
          type: trade.type,
          entry: parseFloat(trade.entry),
          exit: parseFloat(trade.exit),
          pips: parseFloat(trade.pips),
          note: trade.note || ''
        };

        // Jika ID lokal (dimulai dengan 'id-'), insert baru
        let result;
        if (!trade.id || trade.id.startsWith('id-')) {
          const { data, error } = await window.supabaseClient
            .from('trades')
            .insert([payload])
            .select();

          if (error) throw error;
          result = data?.[0];
          
          // Update ID lokal dengan ID dari database
          if (result?.id) {
            trade.id = result.id;
          }
        } else {
          // Update existing
          const { data, error } = await window.supabaseClient
            .from('trades')
            .update(payload)
            .eq('id', trade.id)
            .eq('user_id', userId)
            .select();

          if (error) throw error;
          result = data?.[0];
        }

        console.log('☁️ Data berhasil disinkronkan ke cloud');
        return result;

      } catch (err) {
        console.error('❌ Gagal push data:', err.message);
        return false;
      }
    },

    // Delete data dari cloud
    async delete(tradeId) {
      if (!window.supabaseClient) return false;

      try {
        const { data: sessionData } = await window.supabaseClient.auth.getSession();
        if (!sessionData?.session?.user) {
          return false;
        }

        const userId = sessionData.session.user.id;

        const { error } = await window.supabaseClient
          .from('trades')
          .delete()
          .eq('id', tradeId)
          .eq('user_id', userId);

        if (error) throw error;

        console.log('🗑️ Data berhasil dihapus dari cloud');
        return true;

      } catch (err) {
        console.error('❌ Gagal delete data:', err.message);
        return false;
      }
    }
  };

  // ===== AUTH STATE LISTENER =====
  if (window.supabaseClient) {
    window.supabaseClient.auth.onAuthStateChange((event, session) => {
      console.log('🔐 Auth event:', event);

      switch (event) {
        case 'SIGNED_IN':
          console.log('✅ User berhasil login:', session?.user?.email);
          break;

        case 'SIGNED_OUT':
          console.log('🚪 User logout');
          localStorage.clear();
          if (!window.location.pathname.startsWith('/login')) {
            window.location.href = '/login/';
          }
          break;

        case 'TOKEN_REFRESHED':
          console.log('🔄 Token berhasil di-refresh');
          break;
      }
    });
  }

  // ===== HELPER: Check Auth Status =====
  window.checkAuthStatus = async function() {
    if (!window.supabaseClient) return null;

    try {
      const { data, error } = await window.supabaseClient.auth.getSession();
      
      if (error) {
        console.error('❌ Error checking auth:', error);
        return null;
      }

      return data?.session || null;
    } catch (err) {
      console.error('❌ Auth check failed:', err);
      return null;
    }
  };

  // ===== HELPER: Logout Function =====
  window.logoutUser = async function() {
    if (!window.supabaseClient) return;

    try {
      await window.supabaseClient.auth.signOut();
      localStorage.clear();
      window.location.href = '/login/';
    } catch (err) {
      console.error('❌ Logout error:', err);
    }
  };

  console.log('📦 Supabase module loaded successfully');
}
