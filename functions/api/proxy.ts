
/**
 * Cloudflare Functions (Server-side)
 * 유튜브 API 프록시와 DB 설정을 통합 관리합니다.
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

  // 1. DB 설정 요청 처리
  if (path === 'supabase-config') {
    return new Response(JSON.stringify({
      supabaseUrl: context.env.SUPABASE_URL || '',
      supabaseAnonKey: context.env.SUPABASE_ANON_KEY || ''
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }

  // 2. 유튜브 API Key 확인
  const apiKey = context.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'YouTube API Key is missing in server environment variables.' }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 유튜브 API 파라미터 구성
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
