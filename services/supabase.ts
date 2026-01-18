
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7';

let supabaseClient: any = null;
let initPromise: Promise<void> | null = null;

export async function initSupabase() {
  if (supabaseClient) return;
  if (initPromise) return initPromise;

  initPromise = (async () => {
    try {
      const res = await fetch('/api/proxy?path=supabase-config', { cache: 'no-store' });
      
      if (!res.ok) {
        throw new Error(`Config fetch failed: ${res.status}`);
      }

      const config = await res.json();
      
      if (config && config.supabaseUrl && config.supabaseAnonKey && config.supabaseUrl.startsWith('https://')) {
        supabaseClient = createClient(config.supabaseUrl, config.supabaseAnonKey);
        console.log("✅ Supabase initialized successfully via proxy.");
      } else {
        console.warn("⚠️ Supabase config is incomplete. Database features will be disabled.");
      }
    } catch (e) {
      console.error("❌ Database initialization failed:", e);
    }
  })();

  return initPromise;
}

export const getSupabase = async () => {
  await initSupabase();
  return supabaseClient;
};

// 프록시 객체를 통해 클라이언트 부재 시에도 런타임 에러 방지
export const supabase = new Proxy({} as any, {
  get: (target, prop) => {
    if (!supabaseClient) {
      return (...args: any[]) => ({ 
        from: () => ({ 
          select: () => ({ 
            eq: () => ({ 
              or: () => ({
                single: () => Promise.resolve({ data: null, error: { message: 'DB Not Found', status: 404 } }),
              }),
              order: () => ({ 
                limit: () => ({ 
                  single: () => Promise.resolve({ data: null, error: { message: 'DB Not Found', status: 404 } }),
                  then: (cb: any) => cb({ data: [], error: { message: 'DB Not Found', status: 404 } }) 
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
