
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

let supabaseClient: any = null;
let initPromise: Promise<void> | null = null;

/**
 * 서버(/api/supabase-config)로부터 환경 변수를 가져와 Supabase를 초기화합니다.
 */
export async function initSupabase() {
  if (supabaseClient) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      // 엔드포인트 이름을 supabase-config로 변경하여 404 이슈 해결 시도
      const res = await fetch('/api/supabase-config', { cache: 'no-store' });
      
      if (res.status === 404) {
        throw new Error("서버에서 설정 엔드포인트를 찾을 수 없습니다(404). 배포 상태를 확인해주세요.");
      }

      const contentType = res.headers.get('content-type');
      if (!res.ok || !contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        throw new Error(`잘못된 서버 응답: ${res.status} ${text.substring(0, 100)}`);
      }

      const config = await res.json();
      
      if (config && config.supabaseUrl && config.supabaseAnonKey) {
        supabaseClient = createClient(config.supabaseUrl, config.supabaseAnonKey);
        console.log("✅ Supabase 초기화 성공");
      } else {
        console.warn("⚠️ Supabase 환경 변수가 설정되지 않았습니다. 대시보드 설정을 확인하세요.");
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
