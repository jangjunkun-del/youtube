
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
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
  AlertCircle
} from 'lucide-react';

const ThumbnailPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const [input, setInput] = useState(queryParam);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);

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
      const videoContext = videos.slice(0, 5).map(v => ({
        title: v.snippet.title,
        thumbnail: v.snippet.thumbnails.medium.url
      }));

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze the visual strategy of high-performing thumbnails for the keyword "${queryParam}". 
        Based on these titles: ${videoContext.map(v => v.title).join(', ')}, provide a professional visual strategy report.`,
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

      const result = JSON.parse(response.text || '{}');
      setAiAnalysis(result);
    } catch (error) {
      console.error("AI Analysis failed:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Header & Search */}
      <section className="bg-white dark:bg-[#1a1a1a] p-10 rounded-[40px] border dark:border-white/5 shadow-sm space-y-8">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-black mb-2">유튜브 썸네일 분석</h2>
          <p className="text-slate-500 font-bold">클릭률이 높은 썸네일의 시각적 패턴을 분석하고 AI가 최적의 레이아웃을 추천합니다.</p>
        </div>
        <form onSubmit={handleSearch} className="relative max-w-2xl group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="주제나 키워드를 입력하여 성공 패턴을 찾아보세요"
            className="w-full pl-14 pr-32 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-red-600 outline-none transition-all font-bold"
          />
          <ImageIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-600" size={20} />
          <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-slate-900 dark:bg-red-600 text-white px-6 py-2.5 rounded-xl font-black shadow-lg">
            패턴 찾기
          </button>
        </form>
      </section>

      {queryParam && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-black flex items-center gap-2">
              <Sparkles className="text-amber-500" size={24} />
              "{queryParam}" 분야 성공 썸네일 사례
            </h3>
            {!aiAnalysis && !isAnalyzing && (
              <button 
                onClick={runAiAnalysis}
                className="bg-red-600 text-white px-5 py-2 rounded-xl text-xs font-black shadow-lg hover:bg-red-700 transition-all flex items-center gap-2"
              >
                AI 시각적 분석 시작
              </button>
            )}
          </div>

          {/* AI Analysis Result */}
          {isAnalyzing && (
            <div className="bg-red-50 dark:bg-red-600/5 p-12 rounded-[40px] border border-red-100 dark:border-red-900/20 text-center space-y-4">
              <Loader2 className="animate-spin text-red-600 mx-auto" size={40} />
              <p className="font-black text-red-600 animate-pulse uppercase tracking-widest">수백 장의 썸네일을 AI가 대조 분석 중...</p>
            </div>
          )}

          {aiAnalysis && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <AnalysisCard 
                icon={Palette} 
                title="컬러 전략" 
                color="text-blue-500"
                tags={aiAnalysis.colorStrategy.dominantColors}
                desc={aiAnalysis.colorStrategy.reason}
              />
              <AnalysisCard 
                icon={Layout} 
                title="구도 및 배치" 
                color="text-purple-500"
                label={aiAnalysis.composition.style}
                desc={aiAnalysis.composition.description}
              />
              <AnalysisCard 
                icon={FontIcon} 
                title="텍스트 가이드" 
                color="text-amber-500"
                label={aiAnalysis.textPlacement.fontStyle}
                desc={aiAnalysis.textPlacement.tip}
                footer={`추천 위치: ${aiAnalysis.textPlacement.location}`}
              />
              <div className="md:col-span-3 bg-slate-900 dark:bg-[#1a1a1a] p-8 rounded-[40px] text-white space-y-6">
                <h4 className="text-xl font-black flex items-center gap-2">
                  <CheckCircle2 className="text-red-500" />
                  핵심 인사이트 요약
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {aiAnalysis.keyInsights.map((insight: string, i: number) => (
                    <div key={i} className="flex items-start gap-3 bg-white/5 p-4 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                      <span className="text-red-500 font-black shrink-0">{i + 1}.</span>
                      <p className="text-sm font-medium opacity-90">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Video Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {videos?.map((video) => (
              <div key={video.id} className="relative group rounded-2xl overflow-hidden aspect-video shadow-md border dark:border-white/5">
                <img src={video.snippet.thumbnails.medium.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                  <p className="text-[10px] font-bold text-white line-clamp-2">{video.snippet.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!queryParam && (
        <div className="py-32 text-center space-y-4 opacity-30">
          <ImageIcon size={80} className="mx-auto" />
          <p className="text-xl font-black uppercase tracking-widest">분석을 위해 키워드를 입력해 주세요</p>
        </div>
      )}
    </div>
  );
};

const AnalysisCard = ({ icon: Icon, title, color, tags, label, desc, footer }: any) => (
  <div className="bg-white dark:bg-[#1a1a1a] p-8 rounded-[40px] border dark:border-white/5 shadow-sm space-y-4 flex flex-col">
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-xl bg-slate-50 dark:bg-white/5 ${color}`}>
        <Icon size={20} />
      </div>
      <h4 className="font-black text-slate-900 dark:text-white">{title}</h4>
    </div>
    
    <div className="flex-1 space-y-3">
      {tags && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag: string) => (
            <span key={tag} className="text-[10px] font-black bg-slate-100 dark:bg-white/5 px-2 py-1 rounded-md uppercase tracking-wider">{tag}</span>
          ))}
        </div>
      )}
      {label && <p className="text-sm font-black text-red-600">{label}</p>}
      <p className="text-sm text-slate-500 font-medium leading-relaxed">{desc}</p>
    </div>

    {footer && (
      <div className="pt-4 border-t dark:border-white/5 flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
        <AlertCircle size={12} />
        {footer}
      </div>
    )}
  </div>
);

export default ThumbnailPage;
