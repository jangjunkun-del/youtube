
/**
 * Cloudflare Functions (Server-side)
 * 모든 프록시 및 서버 환경 변수 관리를 통합합니다.
 */
export async function onRequest(context: { request: Request, env: { YOUTUBE_API_KEY: string, SUPABASE_URL?: string, SUPABASE_ANON_KEY?: string } }) {
  const { searchParams } = new URL(context.request.url);
  const path = searchParams.get('path');
  
  if (!path) {
    return new Response(JSON.stringify({ error: 'Missing path parameter' }), { 
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 1. DB 설정 요청 처리: 서버의 Secrets를 안전하게 프론트엔드로 전달
  if (path === 'supabase-config') {
    const url = context.env.SUPABASE_URL || '';
    const key = context.env.SUPABASE_ANON_KEY || '';
    
    return new Response(JSON.stringify({
      supabaseUrl: url,
      supabaseAnonKey: key
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  // 2. 유튜브 API Key 확인 및 프록시 호출
  const apiKey = context.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'YouTube API Key is not configured on the server.' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const youtubeParams = new URLSearchParams(searchParams);
  youtubeParams.delete('path'); 
  youtubeParams.set('key', apiKey);

  const youtubeUrl = `https://www.googleapis.com/youtube/v3/${path}?${youtubeParams.toString()}`;

  try {
    const response = await fetch(youtubeUrl);
    const data = await response.json();

    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch from YouTube API', details: String(error) }), { 
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}
