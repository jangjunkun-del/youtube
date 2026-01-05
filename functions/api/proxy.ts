
/**
 * Cloudflare Functions (Server-side)
 * 이 파일은 서버 측에서 실행되어 브라우저에 API KEY가 노출되지 않도록 합니다.
 */
export async function onRequest(context: { request: Request, env: { YOUTUBE_API_KEY: string } }) {
  const { searchParams } = new URL(context.request.url);
  const path = searchParams.get('path');
  
  if (!path) {
    return new Response(JSON.stringify({ error: 'Missing path' }), { status: 400 });
  }

  // API Key 가져오기 (Cloudflare Dashboard의 Environment Variables에서 설정)
  const apiKey = context.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'API Key not configured in server environment' }), { status: 500 });
  }

  // 전달받은 모든 쿼리 파라미터를 YouTube API로 전달
  const youtubeParams = new URLSearchParams(searchParams);
  youtubeParams.delete('path'); // 프록시용 파라미터 삭제
  youtubeParams.set('key', apiKey);

  const youtubeUrl = `https://www.googleapis.com/youtube/v3/${path}?${youtubeParams.toString()}`;

  try {
    const response = await fetch(youtubeUrl);
    const data = await response.json();

    return new Response(JSON.stringify(data), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // 필요에 따라 특정 도메인으로 제한 가능
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to fetch from YouTube API' }), { status: 500 });
  }
}
