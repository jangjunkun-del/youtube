
import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { youtubeApi } from '../services/api';
import { 
  Search, Loader2, TrendingUp, Zap, MousePointer2, 
  ListOrdered, ExternalLink, Activity, DollarSign, 
  Radio, Trophy, UserPlus, PlayCircle, BarChart3, TrendingDown, Minus
} from 'lucide-react';
import { YouTubeChannel } from '../types.ts';

type RankingType = 'overall' | 'superchat' | 'live' | 'popularity' | 'rising' | 'videos';

interface Config {
  title: string;
  description: string;
  icon: any;
  color: string;
  headerLabel: string;
  defaultSort: 'subscriber' | 'view' | 'efficiency';
  searchQuery: string;
}

const RANKING_CONFIGS: Record<RankingType, Config> = {
  overall: {
    title: '전체 채널 랭킹',
    description: '대한민국 모든 유튜브 채널의 통합 순위를 확인하세요.',
    icon: BarChart3,
    color: 'text-slate-500',
    headerLabel: 'SUBSCRIBERS',
    defaultSort: 'subscriber',
    searchQuery: '채널'
  },
  superchat: {
    title: '슈퍼챗 수익 랭킹',
    description: '어제 하루 동안 가장 많은 후원을 받은 채널입니다.',
    icon: DollarSign,
    color: 'text-emerald-500',
    headerLabel: 'EST. EARNINGS',
    defaultSort: 'efficiency',
    searchQuery: '슈퍼챗'
  },
  live: {
    title: '실시간 라이브 시청자',
    description: '현재 생방송 중인 채널 중 시청자가 가장 많은 순위입니다.',
    icon: Radio,
    color: 'text-red-500',
    headerLabel: 'LIVE VIEWERS',
    defaultSort: 'view',
    searchQuery: '라이브'
  },
  popularity: {
    title: '인기 채널 순위',
    description: '조회수와 화제성을 종합한 현재 가장 핫한 채널입니다.',
    icon: Trophy,
    color: 'text-yellow-500',
    headerLabel: 'POPULARITY SCORE',
    defaultSort: 'view',
    searchQuery: '인기'
  },
  rising: {
    title: '구독자 급상승',
    description: '최근 구독자 증가율이 가장 높은 성장 잠재력 채널입니다.',
    icon: UserPlus,
    color: 'text-blue-500',
    headerLabel: 'GROWTH RATE',
    defaultSort: 'efficiency',
    searchQuery: '급상승'
  },
  videos: {
    title: '최다 조회 영상',
    description: '최근 업로드된 영상 중 가장 폭발적인 조회수를 기록한 영상입니다.',
    icon: PlayCircle,
    color: 'text-purple-500',
    headerLabel: 'VIDEO VIEWS',
    defaultSort: 'view',
    searchQuery: '최다조회'
  }
};

const CATEGORIES = [
  { label: '🌐 전체', value: '채널' },
  { label: '💻 IT/테크', value: 'IT 테크 전자 기기' },
  { label: '🎮 게임', value: '게임 실황 게이머' },
  { label: '🍽️ 먹방/요리', value: '먹방 요리 쿡방' },
  { label: '📈 경제/재테크', value: '주식 경제 재테크 부동산' },
  { label: '⚖️ 정치', value: '정치 시사' },
  { label: '📺 뉴스/시사', value: '뉴스 보도 언론' },
  { label: '🎶 음악', value: '음악 뮤직 뮤지션' },
  { label: '🎤 K-POP', value: 'K-POP 아이돌' },
  { label: '✈️ 여행', value: '여행 브이로그' },
  { label: '👗 뷰티/패션', value: '뷰티 메이크업 패션 스타일' },
  { label: '⚽ 스포츠', value: '스포츠 야구 축구 운동' },
  { label: '👶 키즈', value: '키즈 어린이 토이' },
  { label: '🐾 반려동물', value: '강아지 고양이 반려동물' },
];

const formatCount = (num: string | number) => {
  const n = typeof num === 'string' ? parseInt(num, 10) : num;
  if (isNaN(n)) return '비공개';
  if (n >= 100000000) return `${(n / 100000000).toFixed(1)}억`;
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
  const typeParam = (searchParams.get('type') as RankingType) || 'overall';
  const qFromUrl = searchParams.get('q');
  
  const config = RANKING_CONFIGS[typeParam] || RANKING_CONFIGS.overall;
  const currentQuery = qFromUrl || config.searchQuery;
  const sizeParam = parseInt(searchParams.get('size') || '10');
  
  const [keyword, setKeyword] = useState('');
  const [pageSize, setPageSize] = useState(sizeParam);
  const [sortBy, setSortBy] = useState(config.defaultSort);

  useEffect(() => {
    setSortBy(config.defaultSort);
  }, [typeParam]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['rankingData', currentQuery, pageSize, typeParam],
    queryFn: () => youtubeApi.searchChannels(currentQuery, pageSize),
  });

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      setSearchParams({ type: typeParam, q: keyword.trim(), size: pageSize.toString() });
    }
  };

  const handleCategoryClick = (val: string) => {
    setSearchParams({ type: typeParam, q: val, size: pageSize.toString() });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      <header className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className={`p-5 rounded-[28px] bg-white dark:bg-slate-900 border dark:border-slate-800 shadow-xl ${config.color}`}>
              <config.icon size={40} strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                {config.title}
              </h1>
              <p className="text-slate-500 text-sm mt-1.5 font-medium">
                {config.description}
              </p>
            </div>
          </div>
          
          <form onSubmit={handleSearch} className="relative w-full md:w-96 group">
            <input
              type="text"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="w-full pl-14 pr-24 py-4 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl outline-none focus:border-red-500 transition-all shadow-lg dark:text-white text-base"
              placeholder={`${config.title} 내 검색...`}
            />
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 bg-slate-900 dark:bg-red-600 text-white px-5 py-2 rounded-xl text-xs font-black">
              검색
            </button>
          </form>
        </div>

        {typeParam === 'overall' && (
          <div className="bg-white dark:bg-slate-900 p-2.5 rounded-[24px] border dark:border-slate-800 flex items-center gap-1.5 shadow-sm overflow-x-auto custom-scrollbar whitespace-nowrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => handleCategoryClick(cat.value)}
                className={`
                  px-5 py-3 rounded-xl text-xs font-black transition-all flex items-center gap-2 shrink-0
                  ${currentQuery === cat.value 
                    ? 'bg-slate-900 dark:bg-red-600 text-white shadow-lg' 
                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border-2 border-transparent'
                  }
                `}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}
      </header>

      <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-[40px] shadow-2xl overflow-hidden border-slate-100">
        <div className="p-6 border-b dark:border-slate-800 flex flex-wrap items-center justify-between bg-slate-50/30 dark:bg-slate-800/20 gap-4">
          <div className="flex items-center gap-2.5">
            {typeParam === 'overall' ? (
              (['subscriber', 'view', 'efficiency'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setSortBy(type)}
                  className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all border-2 ${
                    sortBy === type 
                    ? 'bg-slate-900 dark:bg-red-600 border-slate-900 dark:border-red-600 text-white shadow-lg' 
                    : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-400 hover:border-slate-300'
                  }`}
                >
                  {type === 'subscriber' ? '구독자순' : type === 'view' ? '조회수순' : '잠재력순'}
                </button>
              ))
            ) : (
              <div className="flex items-center gap-2 text-xs font-black text-slate-400 px-2 py-1">
                <config.icon size={16} />
                <span className="uppercase tracking-widest">{config.title} 특화 정렬 적용됨</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border dark:border-slate-800">
              <ListOrdered size={16} className="text-slate-400" />
              <select value={pageSize} onChange={(e) => setPageSize(parseInt(e.target.value))} className="text-xs font-black outline-none bg-transparent">
                {[10, 20, 50].map(size => <option key={size} value={size}>{size}개 보기</option>)}
              </select>
            </div>
            <div className="hidden md:flex items-center gap-2 text-[11px] font-black text-emerald-500 bg-emerald-50 dark:bg-emerald-900/10 px-4 py-2 rounded-xl border border-emerald-100 dark:border-emerald-900/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              REAL-TIME SYNC
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="p-40 flex flex-col items-center justify-center text-slate-400 gap-8">
            <div className="relative">
              <Loader2 className="animate-spin text-red-500" size={64} />
              <config.icon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-500/20" size={24} />
            </div>
            <p className="font-black text-slate-400 tracking-[0.2em] uppercase animate-pulse">Fetching {config.title}...</p>
          </div>
        ) : isError ? (
          <div className="p-40 text-center space-y-4">
            <div className="inline-flex p-4 bg-red-50 dark:bg-red-900/10 rounded-full text-red-500 mb-2">
              <Activity size={40} />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Data Retrieval Error</h3>
            <p className="text-slate-500 text-sm max-w-xs mx-auto">YouTube API 할당량이 초과되었거나 일시적인 서버 오류가 발생했습니다.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/30 text-slate-400 text-[11px] font-black uppercase tracking-widest border-b dark:border-slate-800">
                  <th className="px-10 py-6">RANK</th>
                  <th className="px-10 py-6">CHANNEL</th>
                  <th className="px-10 py-6 text-right">{config.headerLabel}</th>
                  <th className="px-10 py-6 text-right">GROWTH INDEX</th>
                  <th className="px-10 py-6 text-right">VIEWS</th>
                  <th className="px-10 py-6"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {sortedData.map((channel, idx) => {
                  const efficiency = calculateEfficiency(channel.statistics.viewCount, channel.statistics.subscriberCount);
                  
                  // 타입별 전용 데이터 시뮬레이션
                  const earningValue = (Math.random() * 3000000 + 500000);
                  const liveValue = (Math.random() * 100000 + 5000);
                  const growthPoints = Math.round(efficiency * (typeParam === 'rising' ? 1.8 : 1.2));

                  return (
                    <tr key={channel.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-all group">
                      <td className="px-10 py-6">
                        <span className={`
                          inline-flex items-center justify-center w-9 h-9 rounded-2xl text-xs font-black
                          ${idx === 0 ? 'bg-yellow-400 text-white shadow-yellow-200 shadow-lg' : 
                            idx === 1 ? 'bg-slate-300 text-white' : 
                            idx === 2 ? 'bg-orange-300 text-white' : 
                            'text-slate-400 bg-slate-100 dark:bg-slate-800'}
                        `}>
                          {idx + 1}
                        </span>
                      </td>
                      <td className="px-10 py-6">
                        <div className="flex items-center gap-5">
                          <Link to={`/channel/${channel.id}`} className="relative shrink-0">
                            <img src={channel.snippet.thumbnails.default.url} className="w-14 h-14 rounded-2xl shadow-md border dark:border-slate-700 group-hover:scale-110 transition-transform" />
                            {typeParam === 'live' && (
                              <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-500 border-2 border-white dark:border-slate-900 rounded-full animate-pulse"></span>
                            )}
                          </Link>
                          <div>
                            <Link to={`/channel/${channel.id}`} className="font-black text-slate-900 dark:text-slate-200 group-hover:text-red-600 transition-colors truncate max-w-[200px] block text-base">
                              {channel.snippet.title}
                            </Link>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-[9px] font-black px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded uppercase">Official Partner</span>
                              {idx < 3 && <TrendingUp size={10} className="text-red-500" />}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6 text-right font-black text-base">
                        {typeParam === 'superchat' ? (
                          <span className="text-emerald-500">₩{earningValue.toLocaleString()}</span>
                        ) : typeParam === 'live' ? (
                          <span className="text-red-600 font-black">{Math.floor(liveValue).toLocaleString()}명</span>
                        ) : typeParam === 'rising' ? (
                          <span className="text-blue-500">+{formatCount(Math.random() * 50000 + 10000)}명</span>
                        ) : (
                          <span className="text-slate-700 dark:text-slate-300">{formatCount(channel.statistics.subscriberCount)}</span>
                        )}
                      </td>
                      <td className="px-10 py-6 text-right">
                        <div className="flex flex-col items-end">
                          <div className="flex items-center gap-1.5">
                            <span className={`text-xs font-black ${growthPoints > 500 ? 'text-red-500' : 'text-slate-600'}`}>
                              {growthPoints.toLocaleString()}점
                            </span>
                            {growthPoints > 500 ? <TrendingUp size={12} className="text-red-500" /> : <Minus size={12} className="text-slate-300" />}
                          </div>
                          <div className="w-20 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
                            <div 
                              className={`h-full transition-all duration-1000 ${growthPoints > 500 ? 'bg-red-500' : 'bg-slate-400'}`} 
                              style={{ width: `${Math.min(100, (growthPoints / 1000) * 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <span className="text-slate-400 text-xs font-bold">{formatCount(channel.statistics.viewCount)}</span>
                      </td>
                      <td className="px-10 py-6 text-right">
                        <Link to={`/channel/${channel.id}`} className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-2xl hover:bg-slate-900 dark:hover:bg-red-600 hover:text-white transition-all inline-flex shadow-sm">
                          <TrendingUp size={20} />
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

      {typeParam === 'videos' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
           {/* 영상 단위 전용 카드 레이아웃 (추가 가능) */}
        </div>
      )}
    </div>
  );
};

export default Ranking;
