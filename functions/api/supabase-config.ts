
/**
 * Cloudflare 서버 측에서 환경 변수를 읽어 프론트엔드로 전달합니다.
 * 파일명을 supabase-config.ts로 변경하여 일반적인 'config' 이름과의 충돌을 방지합니다.
 */
export const onRequest = async (context: any) => {
  try {
    const env = context.env || {};
    const config = {
      supabaseUrl: env.SUPABASE_URL || '',
      supabaseAnonKey: env.SUPABASE_ANON_KEY || ''
    };

    return new Response(JSON.stringify(config), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Internal Server Error', 
      message: String(error) 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
    });
  }
};
