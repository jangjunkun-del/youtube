
import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { youtubeApi } from '../services/api';
import { Search, Loader2, TrendingUp, Zap, MousePointer2, ListOrdered, ExternalLink } from 'lucide-react';
import { YouTubeChannel } from '../types.ts';

const CATEGORIES = [
  { label: '💻 IT/테크', value: 'IT 테크' },
  { label: '🎮 게임', value: '게임' },
  { label: '🍳 먹방/요리', value: '먹방 요리' },
  { label: '📈 경제/재테크', value: '경제 재테크' },
  { label: '⚖️ 정치', value: '정치' },
  { label: '📰 뉴스/시사', value: '뉴스 시사' },
  { label: '🇰🇷 국뽕/해외반응', value: '국뽕 해외반응' },
  { label: '🎵 음악', value: '음악' },
  { label: '✈️ 여행', value: '여행' },
  { label: '💪 운동/헬스', value: '운동 헬스' }
];

const PAGE_SIZES = [10, 20, 30, 50];

const formatCount = (num: string | number) => {
  const n = typeof num === 'string' ? parseInt(num, 10) : num;
  if (isNaN(n)) return '비공개';
  if (n >= 10000) return `${(n / 10000).toFixed(1)}만`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}천`;
  return n.toLocaleString();
};

const calculateEfficiency = (views: string, subs: string) => {
  const v = parseInt(views);
  const s = parseInt(subs);
  if (!s || s === 0) return 0;
  return (v / s);
};

const Ranking: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || 'IT 테크';
  const sizeParam = parseInt(searchParams.get('size') || '10');
  
  const [keyword, setKeyword] = useState(queryParam);
  const [pageSize, setPageSize] = useState(sizeParam);
  const [sortBy, setSortBy] = useState<'subscriber' | 'view' | 'efficiency'>('subscriber');

  useEffect(() => {
    setKeyword(queryParam);
  }, [queryParam]);

  useEffect(() => {
    setPageSize(sizeParam);
  }, [sizeParam]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['searchChannels', queryParam, pageSize],
    queryFn: () => youtubeApi.searchChannels(queryParam, pageSize),
    enabled: !!queryParam,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      setSearchParams({ q: keyword.trim(), size: pageSize.toString() });
    }
  };

  const handleCategoryClick = (val: string) => {
    setSearchParams({ q: val, size: pageSize.toString() });
  };

  const handleSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = e.target.value;
    setSearchParams({ q: queryParam, size: newSize });
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
      <header className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">채널 랭킹 분석</h1>
            <p className="text-slate-500 text-sm mt-1 font-medium italic">키워드별 실시간 성장 지표를 확인하세요.</p>
          </div>
          
          <form onSubmit={handleSearch} className="relative w-full md:w-96 group">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full pl-12 pr-24 py-3 bg-white border-2 border-slate-100 rounded-2xl outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all shadow-sm"
              placeholder="직접 키워드 입력..."
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-500 transition-colors" size={20} />
            <button 
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-slate-900 text-white px-4 py-1.5 rounded-xl text-xs font-bold hover:bg-black transition-colors"
            >
              검색
            </button>
          </form>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">
            <MousePointer2 size={12} />
            Quick Categories
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => handleCategoryClick(cat.value)}
                className={`
                  px-4 py-2 rounded-xl text-sm font-bold transition-all border-2
                  ${queryParam === cat.value 
                    ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-200 -translate-y-0.5' 
                    : 'bg-white border-slate-100 text-slate-600 hover:border-red-200 hover:bg-red-50/30'
                  }
                `}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <div className="bg-white border-2 border-slate-100 rounded-[32px] shadow-sm overflow-hidden">
        <div className="p-5 border-b flex flex-wrap items-center justify-between bg-slate-50/50 gap-4">
          <div className="flex items-center gap-2">
            {(['subscriber', 'view', 'efficiency'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setSortBy(type)}
                className={`px-4 py-2 rounded-xl text-xs font-black transition-all border-2 ${
                  sortBy === type 
                  ? 'bg-slate-900 border-slate-900 text-white shadow-md' 
                  : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-100'
                }`}
              >
                {type === 'subscriber' ? '구독자순' : type === 'view' ? '조회수순' : '잠재력(효율)순'}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-sm">
              <ListOrdered size={14} className="text-slate-400" />
              <select 
                value={pageSize}
                onChange={handleSizeChange}
                className="text-xs font-black text-slate-600 outline-none bg-transparent cursor-pointer"
              >
                {PAGE_SIZES.map(size => (
                  /* Fixed typo in option closing tag */
                  <option key={size} value={size}>{size}개씩 보기</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400 font-bold bg-white px-3 py-1.5 rounded-lg border border-slate-100">
              <Zap size={14} className="text-yellow-500" fill="currentColor" />
              검색: {queryParam}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="p-32 flex flex-col items-center justify-center text-slate-400 gap-6">
            <div className="relative">
              <Loader2 className="animate-spin text-red-500" size={56} />
              <YoutubeIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-100" />
            </div>
            <p className="animate-pulse font-black text-slate-500 tracking-tighter uppercase">Analyzing Youtube Ecosystem...</p>
          </div>
        ) : isError ? (
          <div className="p-32 text-center">
            <p className="text-red-500 font-black text-lg">데이터 호출 에러</p>
            <p className="text-slate-400 text-sm mt-2 font-medium">YouTube API 쿼터가 소진되었거나 네트워크 문제일 수 있습니다.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/80 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b">
                  <th className="px-8 py-5">RANK</th>
                  <th className="px-8 py-5">CHANNEL</th>
                  <th className="px-8 py-5 text-right">SUBS</th>
                  <th className="px-8 py-5 text-right">POTENTIAL</th>
                  <th className="px-8 py-5 text-right">TOTAL VIEWS</th>
                  <th className="px-8 py-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {sortedData.map((channel, idx) => {
                  const efficiency = calculateEfficiency(channel.statistics.viewCount, channel.statistics.subscriberCount);
                  const channelUrl = `https://www.youtube.com/channel/${channel.id}`;
                  return (
                    <tr key={channel.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-5">
                        <span className={`
                          inline-flex items-center justify-center w-8 h-8 rounded-xl text-xs font-black
                          ${idx === 0 ? 'bg-yellow-400 text-white shadow-md' : idx === 1 ? 'bg-slate-300 text-white shadow-sm' : idx === 2 ? 'bg-orange-300 text-white shadow-sm' : 'text-slate-400 bg-slate-100'}
                        `}>
                          {idx + 1}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <Link to={`/channel/${channel.id}`} title="상세 분석 보기">
                            <img src={channel.snippet.thumbnails.default.url} className="w-12 h-12 rounded-2xl bg-slate-100 shadow-sm hover:scale-110 transition-transform" />
                          </Link>
                          <div>
                            <a 
                              href={channelUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="font-black text-slate-900 hover:text-red-600 transition-colors truncate max-w-[200px] tracking-tight flex items-center gap-1 group/link"
                            >
                              {channel.snippet.title}
                              <ExternalLink size={12} className="opacity-0 group-hover/link:opacity-100 transition-opacity" />
                            </a>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">Youtube Partner</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right font-black text-slate-700">
                        {formatCount(channel.statistics.subscriberCount)}
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex flex-col items-end">
                          <span className={`text-sm font-black ${efficiency > 500 ? 'text-red-600' : efficiency > 200 ? 'text-orange-600' : 'text-blue-600'}`}>
                            {Math.round(efficiency).toLocaleString()}점
                          </span>
                          <div className="w-16 h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-1000 ${efficiency > 500 ? 'bg-red-500' : 'bg-blue-500'}`} 
                              style={{ width: `${Math.min(100, (efficiency / 1000) * 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right text-slate-500 text-xs font-bold">
                        {formatCount(channel.statistics.viewCount)}
                      </td>
                      <td className="px-8 py-5 text-right">
                        <Link 
                          to={`/channel/${channel.id}`}
                          title="상세 지표 분석"
                          className="bg-slate-50 group-hover:bg-red-600 group-hover:text-white p-2.5 rounded-xl text-slate-400 transition-all inline-block shadow-sm group-hover:shadow-red-200"
                        >
                          <TrendingUp size={18} />
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
    </div>
  );
};

const YoutubeIcon = ({ className }: { className?: string }) => (
  <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
  </svg>
);

export default Ranking;
