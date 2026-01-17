
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
} from 'lucide-react';

const ViewsPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const [input, setInput] = useState(queryParam);
  const [pageSize, setPageSize] = useState(24);
  const [videoType, setVideoType] = useState<'any' | 'medium' | 'short'>('any');

  // DB 우선 조회 로직으로 변경
  const { data, isLoading, isError, isFetching } = useQuery({
    queryKey: ['viewsAnalysis', queryParam, pageSize, videoType],
    queryFn: () => youtubeApi.getViewsAnalysis(queryParam || '인기 급상승', pageSize),
  });

  const videos = data?.items || [];

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
      <section className="bg-white dark:bg-[#1a1a1a] p-10 rounded-[40px] border dark:border-white/5 shadow-sm space-y-8">
        <div className="max-w-3xl space-y-4">
          <h2 className="text-3xl font-black mb-2">유튜브 조회수 분석</h2>
          <p className="text-slate-500 font-bold">최근 7일간 업로드된 영상 중 시간당 조회수 상승 폭(Velocity)을 분석합니다.</p>
        </div>
        <form onSubmit={handleSearch} className="relative flex-1 group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="분석하고 싶은 키워드나 영상 제목을 입력하세요"
            className="w-full pl-14 pr-32 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-red-600 outline-none transition-all font-bold"
          />
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-slate-900 dark:bg-red-600 text-white px-6 py-2.5 rounded-xl font-black shadow-lg">분석</button>
        </form>
      </section>

      {isLoading ? (
        <div className="py-40 flex flex-col items-center justify-center gap-4 text-slate-400"><Loader2 className="animate-spin text-red-600" size={48} /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {videos.map((video: any) => {
            const velocity = calculateVelocity(video.statistics.viewCount, video.snippet.publishedAt);
            return (
              <Link key={video.id} to={`/video/${video.id}`} className="bg-white dark:bg-[#1a1a1a] rounded-3xl overflow-hidden border dark:border-white/5 group hover:shadow-2xl transition-all p-5 space-y-4">
                <img src={video.snippet.thumbnails.medium.url} className="w-full aspect-video object-cover rounded-xl" alt="" />
                <h4 className="font-bold text-sm line-clamp-2 h-10">{video.snippet.title}</h4>
                <div className="flex items-center justify-between text-red-600 font-black">
                  <TrendingUp size={14} />
                  <span className="text-xs">시간당 {formatNumber(velocity)}회</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ViewsPage;
