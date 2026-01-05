
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { youtubeApi } from '../services/api';
import { Search, Loader2, TrendingUp, ArrowUpDown, ExternalLink, Zap } from 'lucide-react';
import { YouTubeChannel } from '../types.ts';

const formatCount = (num: string | number) => {
  const n = typeof num === 'string' ? parseInt(num, 10) : num;
  if (isNaN(n)) return '비공개';
  if (n >= 10000) return `${(n / 10000).toFixed(1)}만`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}천`;
  return n.toLocaleString();
};

// 성장 효율 계산 (조회수 / 구독자 비율 기반 점수)
const calculateEfficiency = (views: string, subs: string) => {
  const v = parseInt(views);
  const s = parseInt(subs);
  if (!s || s === 0) return 0;
  return (v / s);
};

const Ranking: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || 'IT 테크';
  const [keyword, setKeyword] = useState(queryParam);
  const [sortBy, setSortBy] = useState<'subscriber' | 'view' | 'efficiency'>('subscriber');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['searchChannels', queryParam],
    queryFn: () => youtubeApi.searchChannels(queryParam),
    enabled: !!queryParam,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchParams({ q: keyword });
  };

  const sortedData = React.useMemo(() => {
    if (!data) return [];
    return [...data].sort((a, b) => {
      if (sortBy === 'subscriber') return parseInt(b.statistics.subscriberCount) - parseInt(a.statistics.subscriberCount);
      if (sortBy === 'view') return parseInt(b.statistics.viewCount) - parseInt(a.statistics.viewCount);
      if (sortBy === 'efficiency') {
        return calculateEfficiency(b.statistics.viewCount, b.statistics.subscriberCount) - 
               calculateEfficiency(a.statistics.viewCount, a.statistics.subscriberCount);
      }
      return 0;
    });
  }, [data, sortBy]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">'{queryParam}' 분석 랭킹</h1>
          <p className="text-slate-500 text-sm">성장 효율 지표는 구독자 대비 조회 발생 빈도를 의미합니다.</p>
        </div>
        <form onSubmit={handleSearch} className="relative w-full md:w-80">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border rounded-xl outline-none focus:ring-2 focus:ring-red-500 transition-all shadow-sm"
            placeholder="키워드 검색..."
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        </form>
      </header>

      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b flex flex-wrap items-center justify-between bg-slate-50/50 gap-4">
          <div className="flex gap-2">
            {(['subscriber', 'view', 'efficiency'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setSortBy(type)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  sortBy === type ? 'bg-red-600 text-white shadow-md' : 'bg-white border text-slate-600 hover:bg-slate-100'
                }`}
              >
                {type === 'efficiency' && <Zap size={12} fill={sortBy === type ? "white" : "currentColor"} />}
                {type === 'subscriber' ? '구독자순' : type === 'view' ? '조회수순' : '성장 잠재력순'}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-400 font-medium italic">성장 잠재력 = (누적 조회수 / 구독자 수)</p>
        </div>

        {isLoading ? (
          <div className="p-24 flex flex-col items-center justify-center text-slate-400 gap-4">
            <Loader2 className="animate-spin" size={48} />
            <p className="animate-pulse font-medium">YouTube 대규모 데이터 분석 중...</p>
          </div>
        ) : isError ? (
          <div className="p-24 text-center text-red-500 font-medium">
            데이터 쿼터가 소진되었거나 네트워크 오류입니다. 잠시 후 다시 시도해주세요.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-wider">
                  <th className="px-6 py-4">순위</th>
                  <th className="px-6 py-4">채널 정보</th>
                  <th className="px-6 py-4 text-right">구독자</th>
                  <th className="px-6 py-4 text-right">잠재력 점수</th>
                  <th className="px-6 py-4 text-right">전체 조회수</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sortedData.map((channel, idx) => {
                  const efficiency = calculateEfficiency(channel.statistics.viewCount, channel.statistics.subscriberCount);
                  return (
                    <tr key={channel.id} className="hover:bg-red-50/30 transition-colors group">
                      <td className="px-6 py-4">
                        <span className={`
                          inline-flex items-center justify-center w-8 h-8 rounded-xl text-sm font-black
                          ${idx === 0 ? 'bg-yellow-400 text-white shadow-sm' : idx === 1 ? 'bg-slate-300 text-white' : idx === 2 ? 'bg-orange-300 text-white' : 'text-slate-400 border'}
                        `}>
                          {idx + 1}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <Link to={`/channel/${channel.id}`} className="flex items-center gap-3">
                          <img src={channel.snippet.thumbnails.default.url} className="w-10 h-10 rounded-xl bg-slate-100 shadow-sm group-hover:scale-105 transition-transform" />
                          <div>
                            <p className="font-bold text-slate-900 group-hover:text-red-600 transition-colors truncate max-w-[180px]">
                              {channel.snippet.title}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono">{channel.id}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-slate-700">
                        {formatCount(channel.statistics.subscriberCount)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex flex-col items-end">
                          <span className={`text-sm font-black ${efficiency > 500 ? 'text-red-600' : efficiency > 200 ? 'text-orange-600' : 'text-blue-600'}`}>
                            {Math.round(efficiency).toLocaleString()}점
                          </span>
                          <div className="w-16 h-1 bg-slate-100 rounded-full mt-1 overflow-hidden">
                            <div 
                              className={`h-full ${efficiency > 500 ? 'bg-red-500' : 'bg-blue-500'}`} 
                              style={{ width: `${Math.min(100, (efficiency / 1000) * 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right text-slate-500 text-xs font-medium">
                        {formatCount(channel.statistics.viewCount)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link 
                          to={`/channel/${channel.id}`}
                          className="bg-slate-50 group-hover:bg-red-600 group-hover:text-white p-2 rounded-lg text-slate-400 transition-all inline-block"
                        >
                          <TrendingUp size={16} />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-blue-50 border border-blue-100 p-5 rounded-2xl text-xs text-blue-700 leading-relaxed shadow-sm">
        <div className="flex items-center gap-2 font-black mb-2 uppercase tracking-tighter">
          <Zap size={14} fill="currentColor" /> Why 잠재력 점수?
        </div>
        <p>
          단순히 구독자가 많은 채널보다, <strong>구독자 대비 조회수가 높은 채널</strong>이 현재 알고리즘의 선택을 받고 있을 확률이 높습니다. 
          잠재력 점수는 해당 채널이 가진 '팬덤의 활성도'와 '신규 시청자 유입량'을 수치화한 YouRank만의 독자적인 프록시 지표입니다.
        </p>
      </div>
    </div>
  );
};

export default Ranking;
