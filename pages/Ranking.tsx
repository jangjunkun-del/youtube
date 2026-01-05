
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { youtubeApi } from '../services/api';
import { Search, Loader2, Filter, ArrowUpDown, ExternalLink } from 'lucide-react';
import { YouTubeChannel } from '../types';

const formatCount = (num: string | number) => {
  const n = typeof num === 'string' ? parseInt(num, 10) : num;
  if (isNaN(n)) return '비공개';
  if (n >= 10000) return `${(n / 10000).toFixed(1)}만`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}천`;
  return n.toLocaleString();
};

const Ranking: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || 'IT 테크';
  const [keyword, setKeyword] = useState(queryParam);
  const [sortBy, setSortBy] = useState<'subscriber' | 'view' | 'video'>('subscriber');

  const { data, isLoading, isError, refetch } = useQuery({
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
      if (sortBy === 'video') return parseInt(b.statistics.videoCount) - parseInt(a.statistics.videoCount);
      return 0;
    });
  }, [data, sortBy]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">'{queryParam}' 분석 랭킹</h1>
          <p className="text-slate-500 text-sm">해당 키워드와 연관된 상위 채널 데이터입니다.</p>
        </div>
        <form onSubmit={handleSearch} className="relative w-full md:w-80">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border rounded-xl outline-none focus:ring-2 focus:ring-red-500"
            placeholder="키워드 검색..."
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        </form>
      </header>

      <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between bg-slate-50/50">
          <div className="flex gap-2">
            {(['subscriber', 'view', 'video'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setSortBy(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  sortBy === type ? 'bg-slate-900 text-white shadow-md' : 'bg-white border text-slate-600 hover:bg-slate-100'
                }`}
              >
                {type === 'subscriber' ? '구독자순' : type === 'view' ? '조회수순' : '영상수순'}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-400 font-medium">총 {sortedData.length}개 검색됨</p>
        </div>

        {isLoading ? (
          <div className="p-24 flex flex-col items-center justify-center text-slate-400 gap-4">
            <Loader2 className="animate-spin" size={48} />
            <p className="animate-pulse">YouTube 데이터를 불러오는 중...</p>
          </div>
        ) : isError ? (
          <div className="p-24 text-center text-red-500">
            데이터를 가져오는데 실패했습니다. 쿼터가 초과되었거나 네트워크 오류일 수 있습니다.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase">
                  <th className="px-6 py-4">순위</th>
                  <th className="px-6 py-4">채널 정보</th>
                  <th className="px-6 py-4 text-right">구독자</th>
                  <th className="px-6 py-4 text-right">전체 조회수</th>
                  <th className="px-6 py-4 text-right">영상수</th>
                  <th className="px-6 py-4"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sortedData.map((channel, idx) => (
                  <tr key={channel.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4">
                      <span className={`
                        inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-bold
                        ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : idx === 1 ? 'bg-slate-200 text-slate-700' : idx === 2 ? 'bg-orange-100 text-orange-700' : 'text-slate-400'}
                      `}>
                        {idx + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Link to={`/channel/${channel.id}`} className="flex items-center gap-3">
                        <img src={channel.snippet.thumbnails.default.url} className="w-10 h-10 rounded-full bg-slate-100" />
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-red-600 transition-colors truncate max-w-[150px]">
                            {channel.snippet.title}
                          </p>
                          <p className="text-xs text-slate-400 truncate max-w-[150px]">{channel.snippet.customUrl}</p>
                        </div>
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-right font-semibold text-slate-700">
                      {formatCount(channel.statistics.subscriberCount)}
                    </td>
                    <td className="px-6 py-4 text-right text-slate-600">
                      {formatCount(channel.statistics.viewCount)}
                    </td>
                    <td className="px-6 py-4 text-right text-slate-500">
                      {parseInt(channel.statistics.videoCount).toLocaleString()}개
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        to={`/channel/${channel.id}`}
                        className="p-2 text-slate-400 hover:text-red-600 transition-colors inline-block"
                      >
                        <ExternalLink size={18} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-xs text-amber-700">
        <p className="font-bold mb-1">데이터 산출 한계 및 안내:</p>
        <ul className="list-disc list-inside space-y-1">
          <li>구독자 순위는 검색 키워드 기반으로 수집된 채널 리스트 내에서의 정렬입니다.</li>
          <li>전체 유튜브 실시간 통합 순위는 Google API 쿼터 및 검색 제한상 실시간으로 완벽하게 제공될 수 없습니다.</li>
          <li>비공개 처리된 데이터(구독자 등)는 통계에 반영되지 않거나 0으로 표시될 수 있습니다.</li>
        </ul>
      </div>
    </div>
  );
};

export default Ranking;
