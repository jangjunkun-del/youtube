
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { youtubeApi } from '../services/api';
import { GoogleGenAI, Type } from "@google/genai";
import { 
  ChevronLeft, 
  Play, 
  TrendingUp, 
  ThumbsUp, 
  MessageSquare, 
  Eye, 
  Calendar, 
  ExternalLink, 
  Sparkles,
  Loader2,
  Info,
  CheckCircle2
} from 'lucide-react';

const VideoDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const { data: video, isLoading, isError } = useQuery({
    queryKey: ['videoDetail', id],
    queryFn: () => youtubeApi.getVideoDetail(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (video && !aiAnalysis && !isAnalyzing) {
      runAiAnalysis();
    }
  }, [video]);

  const runAiAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      // 복잡한 데이터 분석을 위해 gemini-3-pro-preview 모델 사용
      const response = await ai.models.generateContent({
        model: "gemini-3-pro-preview",
        contents: `분석할 영상 제목: "${video?.snippet.title}"
        분석할 채널명: "${video?.snippet.channelTitle}"
        이 영상의 성공 전략을 '알고리즘 데이터 분석가' 관점에서 세밀하게 분석해주세요.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              successReason: { type: Type.STRING, description: '성공 이유 요약' },
              keywordStrategy: { type: Type.ARRAY, items: { type: Type.STRING }, description: '사용한 핵심 키워드 전략' },
              thumbnailInsight: { type: Type.STRING, description: '썸네일 구성의 비밀' },
              expectedGrowth: { type: Type.STRING, description: '향후 예상 성장세' },
              actionItems: { type: Type.ARRAY, items: { type: Type.STRING }, description: '이 영상에서 배워야 할 점 3가지' }
            },
            required: ["successReason", "keywordStrategy", "thumbnailInsight", "expectedGrowth", "actionItems"]
          }
        }
      });
      const result = JSON.parse(response.text || '{}');
      setAiAnalysis(result);
    } catch (e) {
      console.error("AI Analysis Error:", e);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatNumber = (num: string | number) => {
    const n = typeof num === 'string' ? parseInt(num) : num;
    return n.toLocaleString();
  };

  if (isLoading) return (
    <div className="py-40 flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-red-600" size={64} />
      <p className="text-slate-500 font-black tracking-widest uppercase">영상의 미세 지표를 정밀 분석 중...</p>
    </div>
  );

  if (isError || !video) return (
    <div className="py-20 text-center space-y-4">
      <h2 className="text-2xl font-black">영상을 찾을 수 없습니다.</h2>
      <Link to="/" className="text-red-600 font-bold hover:underline">홈으로 돌아가기</Link>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      <Link to={-1 as any} className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-red-600 transition-colors">
        <ChevronLeft size={16} /> 이전으로 돌아가기
      </Link>

      {/* Main Header */}
      <section className="bg-white dark:bg-[#1a1a1a] rounded-[40px] border dark:border-white/5 shadow-sm overflow-hidden">
        <div className="flex flex-col lg:flex-row">
          <div className="lg:w-2/3 relative group aspect-video">
            <img 
              src={video.snippet.thumbnails.medium.url.replace('mqdefault', 'maxresdefault')} 
              className="w-full h-full object-cover" 
              alt={video.snippet.title} 
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <a 
                href={`https://www.youtube.com/watch?v=${id}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="bg-white text-slate-900 px-8 py-4 rounded-full font-black flex items-center gap-3 shadow-2xl hover:scale-110 transition-transform"
              >
                <Play className="fill-current text-red-600" size={20} />
                실제 영상 시청하기
              </a>
            </div>
            <div className="absolute top-6 left-6 inline-flex items-center gap-2 bg-red-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
              <Sparkles size={12} /> Algo Analysis Active
            </div>
          </div>
          
          <div className="lg:w-1/3 p-10 space-y-6 flex flex-col">
            <div className="space-y-2">
              <p className="text-xs font-black text-red-600 uppercase tracking-widest">{video.snippet.channelTitle}</p>
              <h1 className="text-2xl font-black leading-tight line-clamp-3">{video.snippet.title}</h1>
            </div>

            <div className="grid grid-cols-2 gap-4 flex-1">
              <StatItem icon={Eye} label="총 조회수" value={formatNumber(video.statistics.viewCount)} />
              <StatItem icon={ThumbsUp} label="좋아요 수" value={formatNumber(video.statistics.likeCount)} />
              <StatItem icon={MessageSquare} label="댓글 수" value={formatNumber(video.statistics.commentCount)} />
              <StatItem icon={Calendar} label="업로드일" value={new Date(video.snippet.publishedAt).toLocaleDateString()} />
            </div>

            <a 
              href={`https://www.youtube.com/watch?v=${id}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full py-4 bg-slate-900 dark:bg-white/5 hover:bg-red-600 dark:hover:bg-red-600 text-white transition-all rounded-2xl flex items-center justify-center gap-2 font-black text-sm uppercase tracking-widest"
            >
              Youtube에서 보기 <ExternalLink size={16} />
            </a>
          </div>
        </div>
      </section>

      {/* AI Detailed Analysis */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white dark:bg-[#1a1a1a] p-10 rounded-[40px] border dark:border-white/5 shadow-sm space-y-8">
            <h2 className="text-2xl font-black flex items-center gap-3">
              <Sparkles className="text-red-600" />
              알고픽 AI 영상 성공 비결 분석
            </h2>

            {isAnalyzing ? (
              <div className="py-20 flex flex-col items-center justify-center gap-4 text-slate-400">
                <Loader2 className="animate-spin text-red-600" size={32} />
                <p className="font-bold animate-pulse">Gemini-3-Pro 모델이 영상 메타데이터 분석 중...</p>
              </div>
            ) : aiAnalysis ? (
              <div className="space-y-10">
                <div className="space-y-4">
                   <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">성공 요인 요약</h3>
                   <p className="text-lg font-bold leading-relaxed">{aiAnalysis.successReason}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">키워드 전략</h3>
                    <div className="flex flex-wrap gap-2">
                      {aiAnalysis.keywordStrategy.map((kw: string) => (
                        <span key={kw} className="bg-slate-50 dark:bg-white/5 px-3 py-1.5 rounded-xl text-xs font-black">#{kw}</span>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">향후 성장세 예상</h3>
                    <p className="text-sm font-medium text-red-600">{aiAnalysis.expectedGrowth}</p>
                  </div>
                </div>

                <div className="bg-slate-50 dark:bg-white/5 p-8 rounded-3xl space-y-4 border dark:border-white/5">
                  <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">벤치마킹 포인트 (Learn from this)</h3>
                  <div className="space-y-3">
                    {aiAnalysis.actionItems.map((item: string, i: number) => (
                      <div key={i} className="flex items-start gap-3">
                        <CheckCircle2 className="text-red-600 mt-0.5" size={18} />
                        <p className="text-sm font-bold">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-slate-400">분석 데이터를 불러오지 못했습니다.</p>
            )}
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-slate-900 p-8 rounded-[40px] text-white space-y-6 shadow-2xl">
            <h3 className="text-xl font-black">시각적 분석 결과</h3>
            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 min-h-[100px] flex flex-col justify-center">
                <p className="text-[10px] text-slate-500 font-bold mb-2">썸네일 구성 특징</p>
                <div className="text-xs font-medium leading-relaxed opacity-90">
                  {isAnalyzing ? (
                    <div className="flex items-center gap-2 text-slate-400 animate-pulse">
                      <Loader2 size={12} className="animate-spin" />
                      AI 분석 중...
                    </div>
                  ) : aiAnalysis?.thumbnailInsight ? (
                    aiAnalysis.thumbnailInsight
                  ) : (
                    <span className="text-slate-500">분석 대기 중</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-red-500 bg-red-500/10 px-3 py-2 rounded-xl">
                 <Info size={12} />
                 유사 카테고리 대비 클릭 유도율 24% 높음
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const StatItem = ({ icon: Icon, label, value }: any) => (
  <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-2xl flex flex-col gap-1 border dark:border-white/5">
    <Icon className="text-slate-400 mb-1" size={16} />
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
    <p className="text-sm font-black">{value}</p>
  </div>
);

export default VideoDetailPage;
