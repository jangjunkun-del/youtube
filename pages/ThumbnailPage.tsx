
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
  Lock,
  BrainCircuit
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
      {/* API 키 안내 가이드 - 검색량 확보를 위한 유튜브 API 권장 */}
      {!hasUserKey && (
        <div className="bg-emerald-50 dark:bg-emerald-600/5 border border-emerald-100 dark:border-emerald-900/20 p-4 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-700">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-emerald-600 shrink-0" size={24} />
            <div className="text-sm">
              <p className="font-black text-emerald-600">무제한 검색 모드 활성화 가이드 (안심 절대 보장)</p>
              <p className="text-slate-500 font-medium leading-relaxed">
                썸네일 <b>검색</b>은 유튜브 API를 사용하며, <b>심층 분석</b>은 고성능 AI가 담당합니다. <br/>
                서버 할당량 제한 없이 더 많은 썸네일을 불러오려면 개인 키를 등록하세요.
              </p>
            </div>
          </div>
          <Link to="/settings" className="bg-emerald-600 text-white px-6 py-2.5 rounded-2xl text-xs font-black shadow-lg shadow-emerald-600/20 hover:scale-105 transition-all flex items-center gap-2 shrink-0">
            <Lock size={14} /> 1분 만에 등록하기 <ChevronRight size={14} />
          </Link>
        </div>
      )}

      {/* Header & Search */}
      <section className="bg-white dark:bg-[#1a1a1a] p-10 rounded-[40px] border dark:border-white/5 shadow-sm space-y-8">
        <div className="max-w-3xl space-y-2">
          <h2 className="text-3xl font-black mb-2 flex items-center gap-3">
            유튜브 썸네일 분석
            <span className="text-[10px] bg-slate-100 dark:bg-white/10 text-slate-500 px-2 py-1 rounded-lg uppercase tracking-widest font-black">Search: API / Analysis: AI</span>
          </h2>
          <p className="text-slate-500 font-bold">인기 영상들의 시각적 데이터를 수집하고 AI로 승리 패턴을 분석합니다.</p>
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
          <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-slate-900 dark:bg-red-600 text-white px-6 py-2.5 rounded-xl font-black shadow-lg">사례 수집</button>
        </form>
      </section>

      {queryParam && (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="flex items-center justify-between px-2">
            <div className="space-y-1">
              <h3 className="text-xl font-black flex items-center gap-2">
                <Sparkles className="text-amber-500" size={24} />
                "{queryParam}" 분야 성공 썸네일 사례
              </h3>
              <p className="text-[11px] text-slate-400 font-bold">유튜브 API를 통해 수집된 실시간 데이터입니다.</p>
            </div>
            {!aiAnalysis && !isAnalyzing && (
              <button onClick={runAiAnalysis} className="bg-red-600 text-white px-5 py-2.5 rounded-xl text-xs font-black shadow-lg hover:bg-red-700 transition-all flex items-center gap-2">
                <BrainCircuit size={16} /> AI 시각적 패턴 분석
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

          {/* AI 분석 결과 섹션 */}
          {aiAnalysis && (
            <div className="bg-white dark:bg-[#1a1a1a] p-8 rounded-[40px] border dark:border-white/5 shadow-xl space-y-8 animate-in zoom-in-95 duration-500">
               <div className="flex items-center gap-3 border-b dark:border-white/5 pb-6">
                 <div className="w-10 h-10 bg-red-600 rounded-2xl flex items-center justify-center text-white">
                   <BrainCircuit size={20} />
                 </div>
                 <div>
                   <h4 className="font-black text-lg">AI 시각 전략 분석 리포트</h4>
                   <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Powered by Gemini AI Intelligence</p>
                 </div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="space-y-4">
                    <h5 className="flex items-center gap-2 text-sm font-black text-red-600"><Palette size={16}/> 컬러 전략</h5>
                    <div className="flex flex-wrap gap-2">
                      {aiAnalysis.colorStrategy.dominantColors.map((color: string) => (
                        <span key={color} className="px-3 py-1 bg-slate-100 dark:bg-white/5 rounded-full text-[10px] font-black">{color}</span>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">{aiAnalysis.colorStrategy.reason}</p>
                  </div>
                  <div className="space-y-4">
                    <h5 className="flex items-center gap-2 text-sm font-black text-blue-600"><Layout size={16}/> 구도 및 레이아웃</h5>
                    <p className="text-xs font-black text-slate-800 dark:text-slate-200">{aiAnalysis.composition.style}</p>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">{aiAnalysis.composition.description}</p>
                  </div>
                  <div className="space-y-4">
                    <h5 className="flex items-center gap-2 text-sm font-black text-purple-600"><FontIcon size={16}/> 텍스트 배치 및 폰트</h5>
                    <p className="text-xs font-black text-slate-800 dark:text-slate-200">{aiAnalysis.textPlacement.fontStyle}</p>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">{aiAnalysis.textPlacement.tip}</p>
                  </div>
               </div>
            </div>
          )}

          {isAnalyzing && (
            <div className="py-20 flex flex-col items-center justify-center gap-4 text-slate-400 bg-white dark:bg-white/5 rounded-[40px]">
              <Loader2 className="animate-spin text-red-600" size={32} />
              <p className="font-black animate-pulse">AI가 수집된 사례들의 시각적 패턴을 학습 중...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ThumbnailPage;
