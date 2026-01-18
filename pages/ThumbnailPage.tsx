
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { youtubeApi } from '../services/api';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  Search, 
  Loader2, 
  ImageIcon, 
  Sparkles, 
  Palette, 
  Layout, 
  Type as FontIcon,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
  Lock
} from 'lucide-react';

const ThumbnailPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const [input, setInput] = useState(queryParam);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [hasUserKey, setHasUserKey] = useState(false);

  useEffect(() => {
    setHasUserKey(!!localStorage.getItem('user_youtube_api_key'));
  }, []);

  const { data: videos, isLoading: videosLoading } = useQuery({
    queryKey: ['thumbnailSearch', queryParam],
    queryFn: () => youtubeApi.search(queryParam || '인기 급상승', 'video', 'viewCount', 12),
    enabled: !!queryParam,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      setSearchParams({ q: input.trim() });
      setAiAnalysis(null);
    }
  };

  const runAiAnalysis = async () => {
    if (!videos || videos.length === 0) return;
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const videoContext = videos.slice(0, 5).map(v => ({ title: v.snippet.title }));
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze the visual strategy for "${queryParam}" based on these titles: ${videoContext.map(v => v.title).join(', ')}.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              colorStrategy: { type: Type.OBJECT, properties: { dominantColors: { type: Type.ARRAY, items: { type: Type.STRING } }, reason: { type: Type.STRING } }, required: ["dominantColors", "reason"] },
              composition: { type: Type.OBJECT, properties: { style: { type: Type.STRING }, description: { type: Type.STRING } }, required: ["style", "description"] },
              textPlacement: { type: Type.OBJECT, properties: { fontStyle: { type: Type.STRING }, location: { type: Type.STRING }, tip: { type: Type.STRING } }, required: ["fontStyle", "location", "tip"] },
              keyInsights: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["colorStrategy", "composition", "textPlacement", "keyInsights"]
          }
        }
      });
      setAiAnalysis(JSON.parse(response.text || '{}'));
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-12 pb-20">
      {/* API 키 안내 가이드 - 에메랄드 신뢰 테마 적용 */}
      {!hasUserKey && (
        <div className="bg-emerald-50 dark:bg-emerald-600/5 border border-emerald-100 dark:border-emerald-900/20 p-4 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-emerald-600 shrink-0" size={24} />
            <div className="text-sm">
              <p className="font-black text-emerald-600">무제한 패턴 분석 모드 (서버 전송 0% 기술적 보장)</p>
              <p className="text-slate-500 font-medium">개인 API 키를 등록하면 서버 할당량 제한 없이 모든 키워드의 썸네일 패턴을 24시간 무제한 분석할 수 있습니다.</p>
            </div>
          </div>
          <Link to="/settings" className="bg-emerald-600 text-white px-6 py-2.5 rounded-2xl text-xs font-black shadow-lg shadow-emerald-600/20 hover:scale-105 transition-all flex items-center gap-2 shrink-0">
            <Lock size={14} /> 보안 설정 및 등록 <ChevronRight size={14} />
          </Link>
        </div>
      )}

      {/* Header & Search */}
      <section className="bg-white dark:bg-[#1a1a1a] p-10 rounded-[40px] border dark:border-white/5 shadow-sm space-y-8">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-black mb-2">유튜브 썸네일 분석</h2>
          <p className="text-slate-500 font-bold">클릭률이 높은 썸네일의 시각적 패턴을 분석합니다.</p>
        </div>
        <form onSubmit={handleSearch} className="relative max-w-2xl group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="주제나 키워드를 입력하세요"
            className="w-full pl-14 pr-32 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-red-600 outline-none transition-all font-bold"
          />
          <ImageIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-slate-900 dark:bg-red-600 text-white px-6 py-2.5 rounded-xl font-black shadow-lg">패턴 찾기</button>
        </form>
      </section>

      {queryParam && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-black flex items-center gap-2">
              <Sparkles className="text-amber-500" size={24} />
              "{queryParam}" 분야 성공 썸네일 사례
            </h3>
            {!aiAnalysis && !isAnalyzing && (
              <button onClick={runAiAnalysis} className="bg-red-600 text-white px-5 py-2 rounded-xl text-xs font-black shadow-lg hover:bg-red-700 transition-all flex items-center gap-2">
                AI 시각적 분석 시작
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {videos?.map((video) => (
              <div key={video.id} className="relative group rounded-2xl overflow-hidden aspect-video shadow-md border dark:border-white/5">
                <img src={video.snippet.thumbnails.medium.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ThumbnailPage;
