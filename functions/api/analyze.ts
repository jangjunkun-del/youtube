
/**
 * 이 파일은 더 이상 사용되지 않습니다. 
 * AI 분석 기능은 제거되었으며, 모든 데이터는 proxy.ts를 통해 YouTube Data API v3를 호출합니다.
 */
export async function onRequest() {
  return new Response(JSON.stringify({ error: "Deprecated endpoint. Use /api/proxy instead." }), {
    status: 410,
    headers: { "Content-Type": "application/json" }
  });
}
