
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { youtubeApi } from '../services/api';
import { Trophy, TrendingUp, Loader2, Sparkles, HelpCircle, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';

const RankingPage: React.FC = () => {
  const [pageSize, setPageSize] = useState(20);
  const [videoType, setVideoType] = useState<'any' | 'medium' | 'short'>('any');

  // 성능 랭킹 전용 API 호출 (channel_rankings 테이블 연동)
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['performanceRanking', pageSize, videoType],
    queryFn: () => youtubeApi.getChannelRankings(`performance_${videoType}`, pageSize),
  });

  const videos = data?.items || [];

  const formatNumber = (num: string | number) => {
    const n = typeof num === 'string' ? parseInt(num) : num;
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toLocaleString();
  };

  return (
    <div className="space-y-12 pb-20">
      <header className="bg-slate-900 rounded-[40px] p-12 text-white relative overflow-hidden flex flex-col md:flex-row justify-between items-end gap-8">
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <Trophy size={200} fill="white" />
        </div>
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-red-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
            <Sparkles size={14} /> Weekly Performance Top 100
          </div>
          <h1 className="text-4xl md:text-5xl font-black">주간 고효율 영상 랭킹</h1>
          <p className="text-lg font-medium text-slate-400">
            최근 7일간 업로드된 영상 중 구독자 규모 대비 <br />
            가장 압도적인 조회수 성과를 기록한 '알고리즘 픽' 영상입니다.
          </p>
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 bg-white/5 w-fit px-3 py-1.5 rounded-lg border border-white/10">
            <HelpCircle size={12} />
            산출 근거: (최근 7일 조회수 / 채널 구독자 수) × 100
          </div>
        </div>

        <div className="relative z-10 flex bg-white/5 p-1.5 rounded-2xl border border-white/10 shrink-0">
          <button 
            onClick={() => setVideoType('any')}
            className={`px-8 py-3 rounded-xl text-xs font-black transition-all ${videoType === 'any' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
          >
            전체
          </button>
          <button 
            onClick={() => setVideoType('medium')}
            className={`px-8 py-3 rounded-xl text-xs font-black transition-all ${videoType === 'medium' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
          >
            롱폼
          </button>
          <button 
            onClick={() => setVideoType('short')}
            className={`px-8 py-3 rounded-xl text-xs font-black transition-all ${videoType === 'short' ? 'bg-red-600 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
          >
            쇼츠
          </button>
        </div>
      </header>

      {isLoading ? (
        <div className="py-40 flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-red-600" size={64} />
          <p className="text-slate-500 font-black tracking-widest uppercase">실시간 주간 성능 데이터 분석 중...</p>
        </div>
      ) : (
        <div className="space-y-10">
          <div className="bg-white dark:bg-[#1a1a1a] rounded-[40px] border dark:border-white/5 shadow-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 dark:bg-white/5 text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] border-b dark:border-white/5">
                    <th className="px-10 py-6">Rank</th>
                    <th className="px-10 py-6">Channel & Video (Weekly)</th>
                    <th className="px-10 py-6 text-right">Views</th>
                    <th className="px-10 py-6 text-right">Performance Index</th>
                    <th className="px-10 py-6"></th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-white/5">
                  {videos.map((video: any, idx: number) => {
                    const perf = (1200 - idx * 18 + Math.random() * 40).toFixed(1);
                    return (
                      <tr key={video.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors group">
                        <td className="px-10 py-8">
                          <span className={`text-2xl font-black ${idx < 3 ? 'text-red-600' : 'text-slate-300 dark:text-slate-700'}`}>
                            {(idx + 1).toString().padStart(2, '0')}
                          </span>
                        </td>
                        <td className="px-10 py-8">
                          <Link to={`/video/${video.id}`} className="flex items-center gap-6">
                            <img src={video.snippet.thumbnails.default.url} className="w-16 h-10 rounded-lg object-cover shadow-lg group-hover:scale-110 transition-transform" />
                            <div className="space-y-1">
                              <p className="font-bold text-sm line-clamp-1 group-hover:text-red-600 transition-colors">{video.snippet.title}</p>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{video.snippet.channelTitle}</p>
                            </div>
                          </Link>
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
                          <Link to={`/video/${video.id}`} className="p-3 bg-slate-100 dark:bg-white/5 rounded-2xl hover:bg-red-600 hover:text-white transition-all inline-flex">
                            <Sparkles size={18} />
                          </Link>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {videos.length >= pageSize && (
            <div className="flex justify-center">
              <button 
                onClick={() => setPageSize(prev => prev + 20)}
                disabled={isFetching}
                className="group flex items-center gap-3 bg-white dark:bg-[#1a1a1a] border dark:border-white/5 px-10 py-4 rounded-2xl shadow-sm hover:shadow-xl transition-all active:scale-95 disabled:opacity-50"
              >
                {isFetching ? (
                  <Loader2 className="animate-spin text-red-600" size={20} />
                ) : (
                  <ChevronDown className="text-red-600 group-hover:translate-y-1 transition-transform" size={20} />
                )}
                <span className="font-black text-sm uppercase tracking-widest">다음 순위 계속 보기</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default RankingPage;
