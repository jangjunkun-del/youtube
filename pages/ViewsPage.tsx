
import React, { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { youtubeApi } from '../services/api';
import { 
  Search, 
  Loader2, 
  TrendingUp, 
  Clock, 
  Eye, 
  Zap,
  Play,
  ChevronDown,
  Layout,
  Video
} from 'lucide-react';

const ViewsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const [input, setInput] = useState(queryParam);
  const [pageSize, setPageSize] = useState(24);
  const [videoType, setVideoType] = useState<'any' | 'medium' | 'short'>('any');

  const { data: videos, isLoading, isError, isFetching } = useQuery({
    queryKey: ['viewsAnalysis', queryParam, pageSize, videoType],
    // 최근 내용을 기반으로 하기 위해 days: 7 적용
    queryFn: () => youtubeApi.search(queryParam || '인기 급상승', 'video', 'viewCount', pageSize, 7, videoType),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPageSize(24);
    if (input.trim()) setSearchParams({ q: input.trim() });
  };

  const calculateVelocity = (viewCount: string, publishedAt: string) => {
    const views = parseInt(viewCount);
    const publishedDate = new Date(publishedAt);
    const now = new Date();
    const hoursPassed = Math.max(1, (now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60));
    return Math.floor(views / hoursPassed);
  };

  const formatNumber = (num: number | string) => {
    const n = typeof num === 'string' ? parseInt(num) : num;
    if (n >= 10000) return `${(n / 10000).toFixed(1)}만`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}천`;
    return n.toLocaleString();
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Header & Search */}
      <section className="bg-white dark:bg-[#1a1a1a] p-10 rounded-[40px] border dark:border-white/5 shadow-sm space-y-8">
        <div className="max-w-3xl space-y-4">
          <h2 className="text-3xl font-black mb-2">유튜브 조회수 분석</h2>
          <p className="text-slate-500 font-bold">최근 7일간 업로드된 영상 중 시간당 조회수 상승 폭(Velocity)을 분석합니다.</p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          <form onSubmit={handleSearch} className="relative flex-1 group">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="분석하고 싶은 키워드나 영상 제목을 입력하세요"
              className="w-full pl-14 pr-32 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-red-600 outline-none transition-all font-bold"
            />
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-600" size={20} />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-slate-900 dark:bg-red-600 text-white px-6 py-2.5 rounded-xl font-black shadow-lg">
              분석
            </button>
          </form>

          {/* Video Type Filter */}
          <div className="flex bg-slate-100 dark:bg-white/5 p-1.5 rounded-2xl border dark:border-white/10 shrink-0">
            <button 
              onClick={() => setVideoType('any')}
              className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${videoType === 'any' ? 'bg-white dark:bg-red-600 shadow-sm text-red-600 dark:text-white' : 'text-slate-400'}`}
            >
              전체
            </button>
            <button 
              onClick={() => setVideoType('medium')}
              className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${videoType === 'medium' ? 'bg-white dark:bg-red-600 shadow-sm text-red-600 dark:text-white' : 'text-slate-400'}`}
            >
              롱폼
            </button>
            <button 
              onClick={() => setVideoType('short')}
              className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${videoType === 'short' ? 'bg-white dark:bg-red-600 shadow-sm text-red-600 dark:text-white' : 'text-slate-400'}`}
            >
              쇼츠
            </button>
          </div>
        </div>
      </section>

      {isLoading ? (
        <div className="py-40 flex flex-col items-center justify-center gap-4 text-slate-400">
          <Loader2 className="animate-spin text-red-600" size={48} />
          <p className="font-black animate-pulse">최근 트렌드 실시간 분석 중...</p>
        </div>
      ) : isError ? (
        <div className="py-20 text-center text-slate-400 font-bold">데이터를 불러오는 데 실패했습니다.</div>
      ) : (
        <div className="space-y-8">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-xl font-black flex items-center gap-2">
              <Zap className="text-red-600" size={24} />
              최근 조회수 성장 속도 랭킹
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black bg-red-50 dark:bg-red-600/10 text-red-600 px-3 py-1 rounded-full uppercase">최근 7일 데이터</span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Sort by Views/Hour</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {videos?.slice()
              .sort((a, b) => calculateVelocity(b.statistics.viewCount, b.snippet.publishedAt) - calculateVelocity(a.statistics.viewCount, a.snippet.publishedAt))
              .map((video) => {
                const velocity = calculateVelocity(video.statistics.viewCount, video.snippet.publishedAt);
                return (
                  <Link 
                    key={video.id} 
                    to={`/video/${video.id}`}
                    className="bg-white dark:bg-[#1a1a1a] rounded-3xl overflow-hidden border dark:border-white/5 group hover:shadow-2xl transition-all flex flex-col"
                  >
                    <div className="relative aspect-video overflow-hidden">
                      <img src={video.snippet.thumbnails.medium.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                      <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                        HOT
                      </div>
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                         <Play className="text-white fill-current" size={40} />
                      </div>
                    </div>
                    
                    <div className="p-5 space-y-4 flex-1 flex flex-col">
                      <h4 className="font-bold text-sm line-clamp-2 h-10 leading-snug group-hover:text-red-600 transition-colors">
                        {video.snippet.title}
                      </h4>
                      
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                        {video.snippet.channelTitle}
                      </p>

                      <div className="mt-auto pt-4 border-t dark:border-white/5 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-slate-500">
                            <Eye size={14} />
                            <span className="text-xs font-bold">{formatNumber(video.statistics.viewCount)}회</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-red-600 font-black">
                            <TrendingUp size={14} />
                            <span className="text-xs">시간당 {formatNumber(velocity)}회</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                          <Clock size={12} />
                          {new Date(video.snippet.publishedAt).toLocaleDateString()} 업로드
                        </div>
                      </div>
                    </div>
                  </Link>
                );
            })}
          </div>

          {videos && videos.length >= pageSize && (
            <div className="pt-10 flex justify-center">
              <button 
                onClick={() => setPageSize(prev => prev + 24)}
                disabled={isFetching}
                className="group flex items-center gap-3 bg-white dark:bg-[#1a1a1a] border dark:border-white/5 px-10 py-4 rounded-2xl shadow-sm hover:shadow-xl transition-all active:scale-95 disabled:opacity-50"
              >
                {isFetching ? (
                  <Loader2 className="animate-spin text-red-600" size={20} />
                ) : (
                  <ChevronDown className="text-red-600 group-hover:translate-y-1 transition-transform" size={20} />
                )}
                <span className="font-black text-sm uppercase tracking-widest">분석 결과 더 보기</span>
              </button>
            </div>
          )}
        </div>
      )}

      {!queryParam && !isLoading && (
        <div className="py-20 text-center space-y-4 opacity-30">
          <Zap size={80} className="mx-auto" />
          <p className="text-xl font-black uppercase tracking-widest">키워드를 검색하여 최신 급상승 영상을 찾아보세요</p>
        </div>
      )}
    </div>
  );
};

export default ViewsPage;
