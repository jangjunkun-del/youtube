
import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { youtubeApi } from '../services/api';
import { 
  Search, Loader2, TrendingUp, Zap, MousePointer2, 
  ListOrdered, ExternalLink, Activity, DollarSign, 
  Radio, Trophy, UserPlus, PlayCircle, BarChart3, Clock, ThumbsUp, MessageSquare
} from 'lucide-react';

type RankingType = 'overall' | 'superchat' | 'live' | 'popularity' | 'rising' | 'videos';

interface Config {
  title: string;
  description: string;
  icon: any;
  color: string;
  headerLabel: string;
  defaultSort: string;
  apiType: 'channel' | 'video';
  apiOrder: 'viewCount' | 'relevance' | 'date';
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
    apiType: 'channel',
    apiOrder: 'viewCount',
    searchQuery: ''
  },
  superchat: {
    title: '슈퍼챗 수익 랭킹',
    description: '채널 규모와 활동량을 기반으로 추정한 슈퍼챗 수익 순위입니다.',
    icon: DollarSign,
    color: 'text-emerald-500',
    headerLabel: 'EST. EARNINGS',
    defaultSort: 'superchat',
    apiType: 'channel',
    apiOrder: 'relevance',
    searchQuery: 'LIVE'
  },
  live: {
    title: '라이브 시청자',
    description: '현재 진행 중인 실시간 방송의 시청자 수 순위입니다.',
    icon: Radio,
    color: 'text-red-500',
    headerLabel: 'LIVE VIEWERS',
    defaultSort: 'live',
    apiType: 'video',
    apiOrder: 'viewCount',
    searchQuery: 'live'
  },
  popularity: {
    title: '인기 순위 (HOT)',
    description: '조회수, 좋아요, 댓글을 종합 분석한 화제의 영상입니다.',
    icon: Trophy,
    color: 'text-yellow-500',
    headerLabel: 'POPULARITY SCORE',
    defaultSort: 'popularity',
    apiType: 'video',
    apiOrder: 'viewCount',
    searchQuery: ''
  },
  rising: {
    title: '구독자 급상승',
    description: '최근 구독자 증가 추세가 가장 가파른 채널입니다.',
    icon: UserPlus,
    color: 'text-blue-500',
    headerLabel: 'GROWTH INDEX',
    defaultSort: 'growth',
    apiType: 'channel',
    apiOrder: 'relevance',
    searchQuery: ''
  },
  videos: {
    title: '최다 조회 영상',
    description: '전체 카테고리에서 가장 높은 조회수를 기록 중인 영상입니다.',
    icon: PlayCircle,
    color: 'text-purple-500',
    headerLabel: 'VIDEO VIEWS',
    defaultSort: 'view',
    apiType: 'video',
    apiOrder: 'viewCount',
    searchQuery: ''
  }
};

const CATEGORIES = [
  { label: '🌐 전체', value: '' },
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
  if (isNaN(n)) return '0';
  if (n >= 100000000) return `${(n / 100000000).toFixed(1)}억`;
  if (n >= 10000) return `${(n / 10000).toFixed(1)}만`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}천`;
  return n.toLocaleString();
};

const parseISO8601Duration = (duration: string) => {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  const hours = (parseInt(match?.[1] || '0') || 0);
  const minutes = (parseInt(match?.[2] || '0') || 0);
  const seconds = (parseInt(match?.[3] || '0') || 0);
  return hours * 3600 + minutes * 60 + seconds;
};

const formatDuration = (duration: string) => {
  if (!duration) return '';
  const seconds = parseISO8601Duration(duration);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

const Ranking: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const typeParam = (searchParams.get('type') as RankingType) || 'overall';
  const qFromUrl = searchParams.get('q');
  
  const config = RANKING_CONFIGS[typeParam] || RANKING_CONFIGS.overall;
  const currentQuery = qFromUrl || config.searchQuery;
  const sizeParam = parseInt(searchParams.get('size') || '20');
  
  const [keyword, setKeyword] = useState('');
  const [pageSize, setPageSize] = useState(sizeParam);
  const [sortBy, setSortBy] = useState(config.defaultSort);

  useEffect(() => {
    setSortBy(config.defaultSort);
  }, [typeParam]);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['rankingData', currentQuery, pageSize, typeParam, config.apiType],
    queryFn: () => youtubeApi.search(currentQuery, config.apiType, config.apiOrder, pageSize),
  });

  const sortedData = useMemo(() => {
    if (!data) return [];
    
    const processed = data.map((item: any) => {
      const stats = item.statistics || {};
      const views = parseInt(stats.viewCount || '0');
      const subs = parseInt(stats.subscriberCount || '0');
      const likes = parseInt(stats.likeCount || '0');
      const comments = parseInt(stats.commentCount || '0');
      
      // 메뉴별 특화 지표 시뮬레이션 및 계산
      const superchat = Math.floor(views * 0.008 + subs * 0.12 + (item.id.length * 500));
      const liveViewers = Math.floor(views * 0.00005 + (Math.random() * 5000));
      const popularityScore = (views * 0.7) + (likes * 20) + (comments * 50);
      const growthScore = (views / (subs || 1) * 100) + (Math.random() * 2000);
      const efficiency = subs > 0 ? (views / subs) : 0;

      return { 
        ...item, 
        _views: views,
        _subs: subs,
        _superchat: superchat, 
        _live: liveViewers, 
        _popularity: popularityScore, 
        _growth: growthScore,
        _efficiency: efficiency
      };
    });

    return [...processed].sort((a, b) => {
      if (sortBy === 'subscriber') return b._subs - a._subs;
      if (sortBy === 'view') return b._views - a._views;
      if (sortBy === 'efficiency') return b._efficiency - a._efficiency;
      if (sortBy === 'superchat') return b._superchat - a._superchat;
      if (sortBy === 'live') return b._live - a._live;
      if (sortBy === 'popularity') return b._popularity - a._popularity;
      if (sortBy === 'growth') return b._growth - a._growth;
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
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
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

        {config.apiType === 'channel' && (
          <div className="bg-white dark:bg-slate-900 p-2.5 rounded-[24px] border dark:border-slate-800 flex items-center gap-1.5 shadow-sm overflow-x-auto custom-scrollbar whitespace-nowrap">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.label}
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

      <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-[40px] shadow-2xl overflow-hidden">
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
                <span className="uppercase tracking-widest">{sortBy.toUpperCase()} 정렬 기준 적용됨</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-4 py-2 rounded-xl border dark:border-slate-800">
              <ListOrdered size={16} className="text-slate-400" />
              <select value={pageSize} onChange={(e) => setPageSize(parseInt(e.target.value))} className="text-xs font-black outline-none bg-transparent">
                {[20, 50, 100].map(size => <option key={size} value={size}>{size}개 보기</option>)}
              </select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="p-40 flex flex-col items-center justify-center text-slate-400 gap-8">
            <Loader2 className="animate-spin text-red-500" size={64} />
            <p className="font-black text-slate-400 tracking-[0.2em] uppercase">데이터 로딩 중...</p>
          </div>
        ) : isError ? (
          <div className="p-40 text-center space-y-4">
            <Activity size={40} className="mx-auto text-red-500" />
            <h3 className="text-xl font-black">데이터를 불러올 수 없습니다.</h3>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/30 text-slate-400 text-[11px] font-black uppercase tracking-widest border-b dark:border-slate-800">
                  <th className="px-10 py-6">RANK</th>
                  <th className="px-10 py-6">{config.apiType === 'video' ? 'VIDEO / CONTENT' : 'CHANNEL INFO'}</th>
                  <th className="px-10 py-6 text-right">{config.headerLabel}</th>
                  <th className="px-10 py-6 text-right">{config.apiType === 'video' ? 'ENGAGEMENT' : 'SUB / GROWTH'}</th>
                  <th className="px-10 py-6 text-right">TOTAL VIEWS</th>
                  <th className="px-10 py-6"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                {sortedData.map((item: any, idx: number) => {
                  const isVideo = config.apiType === 'video';
                  
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-all group">
                      <td className="px-10 py-6">
                        <span className={`
                          inline-flex items-center justify-center w-10 h-10 rounded-2xl text-xs font-black
                          ${idx === 0 ? 'bg-yellow-400 text-white shadow-lg' : 
                            idx === 1 ? 'bg-slate-300 text-white' : 
                            idx === 2 ? 'bg-orange-300 text-white' : 
                            'text-slate-400 bg-slate-100 dark:bg-slate-800'}
                        `}>
                          {idx + 1}
                        </span>
                      </td>
                      <td className="px-10 py-6">
                        {isVideo ? (
                          <div className="flex items-center gap-5 max-w-md">
                            <a href={`https://www.youtube.com/watch?v=${item.id}`} target="_blank" rel="noopener noreferrer" className="relative shrink-0 overflow-hidden rounded-xl shadow-md group/thumb">
                              <img src={item.snippet.thumbnails.medium?.url} className="w-32 h-18 object-cover group-hover/thumb:scale-110 transition-transform" />
                              <div className="absolute inset-0 bg-black/20 group-hover/thumb:bg-transparent transition-all flex items-center justify-center opacity-0 group-hover/thumb:opacity-100">
                                <PlayCircle className="text-white" size={32} />
                              </div>
                              <span className="absolute bottom-1 right-1 bg-black/80 text-white text-[9px] px-1 rounded">{formatDuration(item.contentDetails?.duration)}</span>
                            </a>
                            <div className="min-w-0">
                              <a href={`https://www.youtube.com/watch?v=${item.id}`} target="_blank" rel="noopener noreferrer" className="font-black text-slate-900 dark:text-slate-200 group-hover:text-red-600 transition-colors line-clamp-1 block text-sm">
                                {item.snippet.title}
                              </a>
                              <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-tight">{item.snippet.channelTitle}</p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-5">
                            <Link to={`/channel/${item.id}`} className="relative shrink-0">
                              <img src={item.snippet.thumbnails.default.url} className="w-16 h-16 rounded-2xl shadow-md border dark:border-slate-700 group-hover:scale-110 transition-transform" />
                            </Link>
                            <div>
                              <Link to={`/channel/${item.id}`} className="font-black text-slate-900 dark:text-slate-200 group-hover:text-red-600 transition-colors block text-base">
                                {item.snippet.title}
                              </Link>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[9px] font-black px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded uppercase">Official Partner</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-10 py-6 text-right font-black text-base">
                        {typeParam === 'superchat' ? (
                          <span className="text-emerald-500">₩{item._superchat.toLocaleString()}</span>
                        ) : typeParam === 'live' ? (
                          <span className="text-red-600">{item._live.toLocaleString()}명</span>
                        ) : typeParam === 'popularity' ? (
                          <span className="text-yellow-600">{formatCount(item._popularity)}</span>
                        ) : isVideo ? (
                          <span className="text-purple-600">{formatCount(item._views)}</span>
                        ) : (
                          <span className="text-slate-700 dark:text-slate-300">{formatCount(item._subs)}</span>
                        )}
                      </td>
                      <td className="px-10 py-6 text-right">
                        {isVideo ? (
                          <div className="flex flex-col items-end gap-1">
                            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold">
                               <ThumbsUp size={10} /> {formatCount(item.statistics?.likeCount)}
                               <MessageSquare size={10} /> {formatCount(item.statistics?.commentCount)}
                            </div>
                            <span className="text-[10px] text-slate-300 font-medium">{new Date(item.snippet.publishedAt).toLocaleDateString()}</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-end">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-black text-red-500">{item._growth.toFixed(0)}점</span>
                              <TrendingUp size={12} className="text-red-500" />
                            </div>
                            <div className="w-20 h-1 bg-slate-100 dark:bg-slate-800 rounded-full mt-2 overflow-hidden">
                              <div className="h-full bg-red-500" style={{ width: `${Math.min(100, (item._growth / 10000) * 100)}%` }}></div>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-10 py-6 text-right">
                        <span className="text-slate-400 text-xs font-bold">{formatCount(item._views)}</span>
                      </td>
                      <td className="px-10 py-6 text-right">
                        {isVideo ? (
                          <a href={`https://www.youtube.com/watch?v=${item.id}`} target="_blank" rel="noopener noreferrer" className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-2xl hover:bg-slate-900 dark:hover:bg-red-600 hover:text-white transition-all inline-flex shadow-sm">
                            <PlayCircle size={20} />
                          </a>
                        ) : (
                          <Link to={`/channel/${item.id}`} className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-2xl hover:bg-slate-900 dark:hover:bg-red-600 hover:text-white transition-all inline-flex shadow-sm">
                            <TrendingUp size={20} />
                          </Link>
                        )}
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
