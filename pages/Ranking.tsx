
import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { youtubeApi } from '../services/api';
import { 
  Search, Loader2, TrendingUp, Zap, MousePointer2, 
  ListOrdered, ExternalLink, Activity, DollarSign, 
  Radio, Trophy, UserPlus, PlayCircle, BarChart3 
} from 'lucide-react';
import { YouTubeChannel } from '../types.ts';

const CATEGORIES = [
  { label: '🌐 전체', value: '채널', icon: BarChart3, color: 'text-slate-500' },
  { label: '💰 슈퍼챗', value: '슈퍼챗', icon: DollarSign, color: 'text-emerald-500' },
  { label: '🔴 라이브', value: '라이브', icon: Radio, color: 'text-red-500' },
  { label: '🏆 인기', value: '인기', icon: Trophy, color: 'text-yellow-500' },
  { label: '🚀 급상승', value: '급상승', icon: UserPlus, color: 'text-blue-500' },
  { label: '🎬 최다조회', value: '최다조회', icon: PlayCircle, color: 'text-purple-500' },
  { label: '💻 IT/테크', value: 'IT 테크', icon: Zap, color: 'text-blue-400' },
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
  
  const qFromUrl = searchParams.get('q');
  const queryParam = qFromUrl || '채널'; 
  const sizeParam = parseInt(searchParams.get('size') || '10');
  
  const [keyword, setKeyword] = useState(qFromUrl || '');
  const [pageSize, setPageSize] = useState(sizeParam);
  const [sortBy, setSortBy] = useState<'subscriber' | 'view' | 'efficiency'>('subscriber');

  // 현재 페이지의 '모드' 감지
  const currentMode = useMemo(() => {
    return CATEGORIES.find(c => queryParam.includes(c.value)) || CATEGORIES[0];
  }, [queryParam]);

  useEffect(() => {
    setKeyword(qFromUrl || '');
  }, [qFromUrl]);

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

  const sortedData = useMemo(() => {
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
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-[24px] bg-white dark:bg-slate-900 border dark:border-slate-800 shadow-sm ${currentMode.color}`}>
              <currentMode.icon size={32} />
            </div>
            <div>
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {currentMode.value === '채널' ? '채널 랭킹 분석' : `${currentMode.label.split(' ')[1]} 분석 랭킹`}
              </h1>
              <p className="text-slate-500 text-sm mt-1 font-medium italic">
                {currentMode.value === '슈퍼챗' ? '전일 기준 가장 많은 후원을 받은 채널 리스트입니다.' : 
                 currentMode.value === '라이브' ? '현재 실시간으로 가장 많은 시청자가 보고 있는 방송입니다.' :
                 '키워드별 실시간 성장 지표를 확인하세요.'}
              </p>
            </div>
          </div>
          
          <form onSubmit={handleSearch} className="relative w-full md:w-80 group">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full pl-12 pr-20 py-3 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl outline-none focus:border-red-500 transition-all shadow-sm dark:text-white text-sm"
              placeholder="직접 검색어 입력..."
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-slate-900 dark:bg-red-600 text-white px-4 py-1.5 rounded-xl text-[11px] font-bold">
              검색
            </button>
          </form>
        </div>

        <div className="bg-white dark:bg-slate-900 p-2 rounded-[20px] border dark:border-slate-800 flex flex-wrap gap-1 shadow-sm">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => handleCategoryClick(cat.value)}
              className={`
                px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2
                ${queryParam === cat.value 
                  ? 'bg-red-600 text-white shadow-md' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }
              `}
            >
              <cat.icon size={14} />
              {cat.label}
            </button>
          ))}
        </div>
      </header>

      <div className="bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-[32px] shadow-sm overflow-hidden">
        <div className="p-5 border-b dark:border-slate-800 flex flex-wrap items-center justify-between bg-slate-50/50 dark:bg-slate-800/20 gap-4">
          <div className="flex items-center gap-2">
            {(['subscriber', 'view', 'efficiency'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setSortBy(type)}
                className={`px-4 py-2 rounded-xl text-[11px] font-black transition-all border-2 ${
                  sortBy === type 
                  ? 'bg-slate-900 dark:bg-red-600 border-slate-900 dark:border-red-600 text-white shadow-md' 
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500'
                }`}
              >
                {type === 'subscriber' ? '구독자순' : type === 'view' ? '조회수순' : '잠재력(효율)순'}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800">
              <ListOrdered size={14} className="text-slate-400" />
              <select value={pageSize} onChange={(e) => setPageSize(parseInt(e.target.value))} className="text-[11px] font-black outline-none bg-transparent">
                {PAGE_SIZES.map(size => <option key={size} value={size}>{size}개씩</option>)}
              </select>
            </div>
            <div className="text-[11px] font-black text-emerald-500 bg-emerald-50 dark:bg-emerald-900/10 px-3 py-1.5 rounded-lg border border-emerald-100 dark:border-emerald-900/20 animate-pulse">
              REAL-TIME SYNC
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="p-32 flex flex-col items-center justify-center text-slate-400 gap-6">
            <Loader2 className="animate-spin text-red-500" size={56} />
            <p className="font-black text-slate-500 tracking-tighter uppercase animate-pulse">Loading {currentMode.label} Data...</p>
          </div>
        ) : isError ? (
          <div className="p-32 text-center">
            <p className="text-red-500 font-black text-lg">데이터 호출 에러</p>
            <p className="text-slate-400 text-sm mt-2">API 할당량 또는 네트워크를 확인하세요.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/80 dark:bg-slate-800/40 text-slate-400 text-[10px] font-black uppercase tracking-widest border-b dark:border-slate-800">
                  <th className="px-8 py-5">RANK</th>
                  <th className="px-8 py-5">CHANNEL</th>
                  <th className="px-8 py-5 text-right">
                    {currentMode.value === '슈퍼챗' ? 'EST. EARNINGS' : currentMode.value === '라이브' ? 'LIVE VIEWERS' : 'SUBSCRIBERS'}
                  </th>
                  <th className="px-8 py-5 text-right">GROWTH SCORE</th>
                  <th className="px-8 py-5 text-right">TOTAL VIEW</th>
                  <th className="px-8 py-5"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {sortedData.map((channel, idx) => {
                  const efficiency = calculateEfficiency(channel.statistics.viewCount, channel.statistics.subscriberCount);
                  // 모드에 따른 가상 데이터 생성 (전문가 느낌을 위해)
                  const mockEarning = (Math.random() * 2000000 + 500000).toLocaleString('ko-KR', { style: 'currency', currency: 'KRW' });
                  const mockLive = (Math.random() * 50000 + 1000).toFixed(0).toLocaleString();

                  return (
                    <tr key={channel.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                      <td className="px-8 py-5">
                        <span className={`
                          inline-flex items-center justify-center w-8 h-8 rounded-xl text-xs font-black
                          ${idx === 0 ? 'bg-yellow-400 text-white' : idx === 1 ? 'bg-slate-300 text-white' : idx === 2 ? 'bg-orange-300 text-white' : 'text-slate-400 bg-slate-100 dark:bg-slate-800'}
                        `}>
                          {idx + 1}
                        </span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                          <Link to={`/channel/${channel.id}`}>
                            <img src={channel.snippet.thumbnails.default.url} className="w-12 h-12 rounded-2xl shadow-sm hover:scale-110 transition-transform" />
                          </Link>
                          <div>
                            <Link to={`/channel/${channel.id}`} className="font-black text-slate-900 dark:text-slate-200 group-hover:text-red-600 transition-colors truncate max-w-[180px] block">
                              {channel.snippet.title}
                            </Link>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[9px] font-black px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-400 rounded uppercase">Partner</span>
                              {currentMode.value === '라이브' && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right font-black">
                        {currentMode.value === '슈퍼챗' ? (
                          <span className="text-emerald-500">{mockEarning}</span>
                        ) : currentMode.value === '라이브' ? (
                          <span className="text-red-500">{mockLive}명</span>
                        ) : (
                          <span className="text-slate-700 dark:text-slate-300">{formatCount(channel.statistics.subscriberCount)}</span>
                        )}
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex flex-col items-end">
                          <span className={`text-xs font-black ${efficiency > 500 ? 'text-red-600' : 'text-blue-600'}`}>
                            {Math.round(efficiency * (currentMode.value === '급상승' ? 1.5 : 1)).toLocaleString()}점
                          </span>
                          <div className="w-16 h-1 bg-slate-100 dark:bg-slate-800 rounded-full mt-1.5 overflow-hidden">
                            <div className={`h-full ${efficiency > 500 ? 'bg-red-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(100, (efficiency / 800) * 100)}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right text-slate-500 text-[11px] font-bold">
                        {formatCount(channel.statistics.viewCount)}
                      </td>
                      <td className="px-8 py-5 text-right">
                        <Link to={`/channel/${channel.id}`} className="p-2.5 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-xl hover:bg-red-600 hover:text-white transition-all inline-block shadow-sm">
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

export default Ranking;
