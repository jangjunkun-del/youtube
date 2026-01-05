
import { GoogleGenAI } from "@google/genai";

export async function onRequest(context: { request: Request, env: { API_KEY: string } }) {
  if (context.request.method === "OPTIONS") {
    return new Response(null, { headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "POST", "Access-Control-Allow-Headers": "Content-Type" } });
  }

  try {
    const { channelTitle, description, recentVideos } = await context.request.json();
    const ai = new GoogleGenAI({ apiKey: context.env.API_KEY });
    
    const prompt = `
      YouTube 채널 분석 전문가로서 다음 채널을 분석하고 한국어로 요약해줘.
      채널명: ${channelTitle}
      설명: ${description}
      최근 영상들: ${recentVideos.join(", ")}
      
      분석 항목:
      1. 채널의 핵심 주제 및 타겟층
      2. 최근 콘텐츠 트렌드 및 강점
      3. 향후 성장을 위한 구체적인 전략 제안 (제목 개선, 주제 확장 등)
      
      형식: JSON이 아닌 친절하고 전문적인 마크다운 형식으로 작성할 것.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [{ parts: [{ text: prompt }] }],
    });

    return new Response(JSON.stringify({ analysis: response.text }), {
      headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), { status: 500 });
  }
}
