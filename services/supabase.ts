
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

let supabaseClient: any = null;
let initPromise: Promise<void> | null = null;

export async function initSupabase() {
  if (supabaseClient) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      // 서버 측 프록시 엔드포인트에서 설정 로드
      const res = await fetch('/api/proxy?path=supabase-config', { cache: 'no-store' });
      
      if (!res.ok) {
        throw new Error(`Config fetch failed: ${res.status}`);
      }

      const config = await res.json();
      
      if (config && config.supabaseUrl && config.supabaseAnonKey) {
        // Supabase 클라이언트 생성 (Anon Key가 반드시 존재해야 함)
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

/**
 * DB 클라이언트를 가져올 때는 반드시 이 함수를 await 해야 합니다.
 * 그래야 설정 값이 서버에서 올 때까지 기다린 후 작업을 수행합니다.
 */
export const getSupabase = async () => {
  if (!supabaseClient) {
    await initSupabase();
  }
  return supabaseClient;
};

// 하위 호환성을 위해 빈 객체로 내보내지만, 실제 데이터 작업은 getSupabase()를 통해야 합니다.
export const supabase = null;
