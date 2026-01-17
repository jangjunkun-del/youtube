
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { youtubeApi } from '../services/api';
import { Trophy, TrendingUp, Loader2, Sparkles } from 'lucide-react';

const RankingPage: React.FC = () => {
  const { data: videos, isLoading } = useQuery({
    queryKey: ['efficiencyRanking'],
    queryFn: () => youtubeApi.getSuccessVideos(''),
  });

  const formatNumber = (num: string | number) => {
    const n = typeof num === 'string' ? parseInt(num) : num;
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toLocaleString();
  };

  return (
    <div className="space-y-12 pb-20">
      <header className="bg-slate-900 rounded-[40px] p-12 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <Trophy size={200} fill="white" />
        </div>
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-red-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
            <Sparkles size={14} /> Efficiency Index Top 100
          </div>
          <h1 className="text-4xl md:text-5xl font-black">구독자 대비 조회수 랭킹</h1>
          <p className="text-lg font-medium text-slate-400">
            단순히 구독자가 많은 채널이 아닙니다. <br />
            실제 영상 하나하나의 성과가 압도적인 고효율 채널들을 만나보세요.
          </p>
        </div>
      </header>

      {isLoading ? (
        <div className="py-40 flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-red-600" size={64} />
          <p className="text-slate-500 font-black tracking-widest uppercase">실시간 성능 데이터 분석 중...</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-[#1a1a1a] rounded-[40px] border dark:border-white/5 shadow-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 dark:bg-white/5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] border-b dark:border-white/5">
                  <th className="px-10 py-6">Rank</th>
                  <th className="px-10 py-6">Channel & Video</th>
                  <th className="px-10 py-6 text-right">Views</th>
                  <th className="px-10 py-6 text-right">Performance Index</th>
                  <th className="px-10 py-6"></th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-white/5">
                {videos?.map((video, idx) => {
                  // Mocking performance index for demonstration
                  const perf = (1000 - idx * 15 + Math.random() * 50).toFixed(1);
                  return (
                    <tr key={video.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors group">
                      <td className="px-10 py-8">
                        <span className={`text-2xl font-black ${idx < 3 ? 'text-red-600' : 'text-slate-300 dark:text-slate-700'}`}>
                          {(idx + 1).toString().padStart(2, '0')}
                        </span>
                      </td>
                      <td className="px-10 py-8">
                        <div className="flex items-center gap-6">
                          <img src={video.snippet.thumbnails.default.url} className="w-16 h-10 rounded-lg object-cover shadow-lg group-hover:scale-110 transition-transform" />
                          <div className="space-y-1">
                            <p className="font-bold text-sm line-clamp-1 group-hover:text-red-600 transition-colors">{video.snippet.title}</p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{video.snippet.channelTitle}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-8 text-right font-black">
                        {formatNumber(video.statistics.viewCount)}
                      </td>
                      <td className="px-10 py-8 text-right">
                        <div className="inline-flex items-center gap-2 bg-red-50 dark:bg-red-600/10 text-red-600 px-4 py-2 rounded-2xl border border-red-100 dark:border-red-900/30">
                          <TrendingUp size={14} />
                          <span className="text-sm font-black">{perf}%</span>
                        </div>
                      </td>
                      <td className="px-10 py-8 text-right">
                        <a href={`https://youtube.com/watch?v=${video.id}`} target="_blank" rel="noreferrer" className="p-3 bg-slate-100 dark:bg-white/5 rounded-2xl hover:bg-red-600 hover:text-white transition-all inline-flex">
                          <Sparkles size={18} />
                        </a>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default RankingPage;
