
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

let supabaseClient: any = null;
let initPromise: Promise<void> | null = null;

export async function initSupabase() {
  if (supabaseClient) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      // 404 에러 해결을 위해 전용 엔드포인트인 /api/supabase-config를 호출합니다.
      const res = await fetch('/api/supabase-config', { cache: 'no-store' });
      
      if (!res.ok) {
        throw new Error(`Config fetch failed: ${res.status}`);
      }

      const config = await res.json();
      
      if (config && config.supabaseUrl && config.supabaseAnonKey) {
        supabaseClient = createClient(config.supabaseUrl, config.supabaseAnonKey);
        console.log("✅ Supabase initialized successfully with keys from server.");
      } else {
        console.error("❌ Supabase config is missing from server env variables.");
      }
    } catch (e) {
      console.error("❌ Database initialization failed:", e);
    }
  })();

  return initPromise;
}

export const getSupabase = async () => {
  if (!supabaseClient) {
    await initSupabase();
  }
  return supabaseClient;
};

export const supabase = null;
