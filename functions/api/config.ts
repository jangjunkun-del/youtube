
/**
 * Cloudflare 서버 측에서 환경 변수를 읽어 프론트엔드로 전달합니다.
 */
export async function onRequest(context: { env: { SUPABASE_URL?: string, SUPABASE_ANON_KEY?: string } }) {
  try {
    const config = {
      supabaseUrl: context.env?.SUPABASE_URL || '',
      supabaseAnonKey: context.env?.SUPABASE_ANON_KEY || ''
    };

    return new Response(JSON.stringify(config), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
    });
  } catch (error) {
    // 에러 발생 시에도 프론트엔드가 파싱 가능한 JSON 에러 객체를 반환합니다.
    return new Response(JSON.stringify({ 
      error: 'Failed to load configuration', 
      details: String(error),
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
}
