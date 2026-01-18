
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

let supabaseClient: any = null;
let initPromise: Promise<void> | null = null;

/**
 * /api/proxy 통합 엔드포인트를 통해 설정을 가져와 Supabase를 초기화합니다.
 */
export async function initSupabase() {
  if (supabaseClient) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      // 404 방지를 위해 /api/proxy 경로를 명시적으로 사용합니다.
      const res = await fetch('/api/proxy?path=supabase-config', { cache: 'no-store' });
      
      const contentType = res.headers.get('content-type');
      if (!res.ok || !contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        throw new Error(`서버 응답 오류: ${res.status} ${text.substring(0, 100)}`);
      }

      const config = await res.json();
      
      if (config && config.supabaseUrl && config.supabaseAnonKey) {
        supabaseClient = createClient(config.supabaseUrl, config.supabaseAnonKey);
        console.log("✅ Supabase 초기화 성공 (/api/proxy)");
      } else {
        console.warn("⚠️ Supabase 환경 변수가 설정되어 있지 않습니다.");
      }
    } catch (e) {
      console.error("❌ DB 설정을 가져오는데 실패했습니다:", e);
    }
  })();

  return initPromise;
}

/**
 * 초기화된 Supabase 클라이언트를 반환합니다.
 */
export const getSupabase = async () => {
  await initSupabase();
  return supabaseClient;
};

// 하위 호환성을 위한 프록시 객체
export const supabase = new Proxy({} as any, {
  get: (target, prop) => {
    if (!supabaseClient) {
      return (...args: any[]) => ({ 
        from: () => ({ 
          select: () => ({ 
            eq: () => ({ 
              or: () => ({
                single: () => Promise.resolve({ data: null, error: null }),
              }),
              order: () => ({ 
                limit: () => ({ 
                  single: () => Promise.resolve({ data: null, error: null }),
                  then: (cb: any) => cb({ data: [], error: null }) 
                }) 
              }) 
            }) 
          }) 
        }) 
      });
    }
    return supabaseClient[prop];
  }
});
