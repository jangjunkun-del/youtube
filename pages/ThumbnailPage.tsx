
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
  BrainCircuit,
  Database
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

  /**
   * Gemini AI를 사용하여 썸네일 전략을 분석합니다.
   * 복잡한 분석을 위해 'gemini-3-pro-preview' 모델을 사용합니다.
   */
  const runAiAnalysis = async () => {
    if (!videos || videos.length === 0) return;
    setIsAnalyzing(true);
    try {
      // process.env.API_KEY를 직접 사용하여 GoogleGenAI 인스턴스 생성
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const videoContext = videos.slice(0, 5).map(v => ({ title: v.snippet.title }));
      
      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: `Analyze the visual strategy for "${queryParam}" based on these titles: ${videoContext.map(v => v.title).join(', ')}.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              colorStrategy: { 
                type: Type.OBJECT, 
                properties: { 
                  dominantColors: { type: Type.ARRAY, items: { type: Type.STRING } }, 
                  reason: { type: Type.STRING } 
                }, 
                required: ["dominantColors", "reason"] 
              },
              composition: { 
                type: Type.OBJECT, 
                properties: { 
                  style: { type: Type.STRING }, 
                  description: { type: Type.STRING } 
                }, 
                required: ["style", "description"] 
              },
              textPlacement: { 
                type: Type.OBJECT, 
                properties: { 
                  fontStyle: { type: Type.STRING }, 
                  location: { type: Type.STRING }, 
                  tip: { type: Type.STRING } 
                }, 
                required: ["fontStyle", "location", "tip"] 
              },
              keyInsights: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["colorStrategy", "composition", "textPlacement", "keyInsights"]
          }
        }
      });
      
      // response.text 프로퍼티를 사용하여 JSON 결과 추출
      if (response.text) {
        setAiAnalysis(JSON.parse(response.text));
      }
    } catch (error: any) {
      // "Requested entity was not found." 오류 발생 시 API 키 선택 다이얼로그 호출 가이드라인 준수
      if (error?.message?.includes("Requested entity was not found.")) {
        if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
          await window.aistudio.openSelectKey();
        }
      }
      console.error("AI Analysis Error:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-12 pb-20">
      {/* 가이드 배너 - API 역할 분담 명시 */}
      <div className="bg-blue-50 dark:bg-blue-600/5 border border-blue-100 dark:border-blue-900/20 p-5 rounded-[32px] flex flex-col md:flex-row items-center justify-between gap-6 animate-in fade-in slide-in-from-top-2 duration-700">
        <div className="flex items-start gap-4">
          <div className="bg-blue-600 p-2.5 rounded-2xl text-white shadow-lg shrink-0">
            <Database size={20} />
          </div>
          <div className="text-sm">
            <p className="font-black text-blue-700 dark:text-blue-400 flex items-center gap-1.5">
              Dual-Engine 시스템 작동 중
            </p>
            <p className="text-slate-500 font-medium leading-relaxed mt-1">
              분석을 위해 <b>YouTube API</b>로 실시간 데이터를 수집하고, <br className="hidden md:block"/>
              수집된 시각 자료는 <b>Gemini AI</b>가 정밀 분석하여 전략을 도출합니다.
            </p>
          </div>
        </div>
        {!hasUserKey && (
          <Link to="/settings" className="bg-slate-900 text-white px-6 py-3 rounded-2xl text-xs font-black shadow-lg hover:scale-105 transition-all flex items-center gap-2 shrink-0">
            <Lock size={14} /> 데이터 수집용 키 등록 <ChevronRight size={14} />
          </Link>
        )}
      </div>

      {/* Header & Search */}
      <section className="bg-white dark:bg-[#1a1a1a] p-10 rounded-[40px] border dark:border-white/5 shadow-sm space-y-8">
        <div className="max-w-3xl space-y-2">
          <h2 className="text-3xl font-black mb-2 flex items-center gap-3">
            유튜브 썸네일 분석
            <span className="text-[10px] bg-red-100 dark:bg-red-600/20 text-red-600 dark:text-red-400 px-2 py-1 rounded-lg uppercase tracking-widest font-black">Powered by Gemini AI</span>
          </h2>
          <p className="text-slate-500 font-bold">인기 영상들의 시각적 데이터를 AI로 분석하여 클릭을 부르는 승리 패턴을 찾습니다.</p>
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
                "{queryParam}" 실시간 수집 사례
              </h3>
              <p className="text-[11px] text-slate-400 font-bold">YouTube API를 통해 가장 조회수가 높은 썸네일들을 가져왔습니다.</p>
            </div>
            {!aiAnalysis && !isAnalyzing && (
              <button onClick={runAiAnalysis} className="bg-red-600 text-white px-6 py-3 rounded-2xl text-xs font-black shadow-lg hover:bg-red-700 transition-all flex items-center gap-2 animate-bounce">
                <BrainCircuit size={18} /> Gemini AI 패턴 분석 시작
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {videosLoading ? Array(6).fill(0).map((_, i) => <div key={i} className="aspect-video bg-slate-100 dark:bg-white/5 animate-pulse rounded-2xl" />) : 
              videos?.map((video) => (
              <div key={video.id} className="relative group rounded-2xl overflow-hidden aspect-video shadow-md border dark:border-white/5">
                <img src={video.snippet.thumbnails.medium.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
              </div>
            ))}
          </div>

          {/* AI 분석 결과 섹션 */}
          {aiAnalysis && (
            <div className="bg-white dark:bg-[#1a1a1a] p-8 rounded-[40px] border-2 border-red-500/20 dark:border-red-500/10 shadow-xl space-y-8 animate-in zoom-in-95 duration-500">
               <div className="flex items-center gap-3 border-b dark:border-white/5 pb-6">
                 <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
                   <Sparkles size={24} />
                 </div>
                 <div className="space-y-1">
                   <h3 className="text-2xl font-black">AI 전략 분석 레포트</h3>
                   <p className="text-sm font-bold text-slate-400">Gemini-3-Pro 모델이 도출한 최적의 썸네일 전략입니다.</p>
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                 <div className="space-y-4">
                   <div className="flex items-center gap-2 font-black text-red-600 uppercase tracking-widest text-xs">
                     <Palette size={16} /> Color Strategy
                   </div>
                   <div className="space-y-2">
                     <div className="flex gap-2">
                       {aiAnalysis.colorStrategy.dominantColors.map((color: string) => (
                         <span key={color} className="px-3 py-1 bg-slate-100 dark:bg-white/5 rounded-lg text-xs font-bold">{color}</span>
                       ))}
                     </div>
                     <p className="text-sm font-medium leading-relaxed">{aiAnalysis.colorStrategy.reason}</p>
                   </div>
                 </div>

                 <div className="space-y-4">
                   <div className="flex items-center gap-2 font-black text-blue-600 uppercase tracking-widest text-xs">
                     <Layout size={16} /> Composition
                   </div>
                   <div className="space-y-1">
                     <p className="font-black text-sm">{aiAnalysis.composition.style}</p>
                     <p className="text-sm font-medium leading-relaxed">{aiAnalysis.composition.description}</p>
                   </div>
                 </div>

                 <div className="space-y-4">
                   <div className="flex items-center gap-2 font-black text-purple-600 uppercase tracking-widest text-xs">
                     <FontIcon size={16} /> Text Strategy
                   </div>
                   <div className="space-y-1">
                     <p className="font-black text-sm">{aiAnalysis.textPlacement.fontStyle}</p>
                     <p className="text-xs font-bold text-slate-500">위치: {aiAnalysis.textPlacement.location}</p>
                     <p className="text-sm font-medium leading-relaxed bg-purple-50 dark:bg-purple-900/10 p-3 rounded-xl border border-purple-100 dark:border-purple-900/20 mt-2">
                       💡 Tip: {aiAnalysis.textPlacement.tip}
                     </p>
                   </div>
                 </div>
               </div>

               <div className="bg-slate-50 dark:bg-white/5 p-8 rounded-3xl space-y-4 border dark:border-white/5">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-red-600" /> Key Strategic Insights
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {aiAnalysis.keyInsights.map((insight: string, i: number) => (
                      <div key={i} className="flex items-start gap-3">
                        <div className="w-5 h-5 bg-red-600 text-white rounded-full flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5">{i + 1}</div>
                        <p className="text-sm font-bold leading-relaxed">{insight}</p>
                      </div>
                    ))}
                  </div>
               </div>
            </div>
          )}
        </div>
      )}

      {isAnalyzing && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-6">
          <div className="bg-white dark:bg-slate-900 p-12 rounded-[48px] shadow-2xl max-w-md w-full text-center space-y-8 animate-in zoom-in-95 duration-300">
            <div className="relative mx-auto w-24 h-24">
              <div className="absolute inset-0 bg-red-600/20 rounded-full animate-ping" />
              <div className="relative bg-white dark:bg-slate-800 rounded-full w-24 h-24 flex items-center justify-center shadow-xl border-4 border-red-600">
                <BrainCircuit className="text-red-600 animate-pulse" size={40} />
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-black">AI 패턴 분석 중...</h3>
              <p className="text-slate-500 font-medium">Gemini-3-Pro 모델이 수집된 수천 개의 시각 데이터를 기반으로 승리 전략을 도출하고 있습니다.</p>
            </div>
            <div className="w-full bg-slate-100 dark:bg-white/5 h-2 rounded-full overflow-hidden">
              <div className="bg-red-600 h-full animate-[progress_2s_ease-in-out_infinite] w-[40%]" />
            </div>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">잠시만 기다려 주세요</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThumbnailPage;
