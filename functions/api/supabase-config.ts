
/**
 * Cloudflare 서버 측에서 환경 변수를 읽어 프론트엔드로 전달합니다.
 */
export const onRequest = async (context: any) => {
  try {
    const env = context.env || {};
    const config = {
      supabaseUrl: env.SUPABASE_URL || '',
      supabaseAnonKey: env.SUPABASE_ANON_KEY || ''
    };

    // 설정값이 비어있는 경우에도 200 응답을 보내어 프론트엔드에서 적절한 로그를 남길 수 있게 합니다.
    return new Response(JSON.stringify(config), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*'
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ 
      error: 'Internal Server Error', 
      message: String(error),
      supabaseUrl: '',
      supabaseAnonKey: ''
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
    });
  }
};
