
import React, { useState } from 'react';
import { Search, TrendingUp, Star, BarChart3, ChevronRight, Zap, Flame } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { youtubeApi } from '../services/api';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import RisingItem from '../components/RisingItem.tsx';

const CATEGORY_STATS = [
  { name: '국뽕', value: 85, color: '#ef4444' },
  { name: '재테크', value: 62, color: '#3b82f6' },
  { name: 'IT/테크', value: 45, color: '#10b981' },
  { name: '게임', value: 92, color: '#8b5cf6' },
  { name: '여행', value: 38, color: '#f59e0b' },
];

const Home: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) navigate(`/ranking?q=${encodeURIComponent(searchQuery)}`);
  };

  const favorites: string[] = JSON.parse(localStorage.getItem('favorites') || '[]');
  const { data: favoriteChannels } = useQuery({
    queryKey: ['favoriteChannels', favorites.join(',')],
    queryFn: () => youtubeApi.getChannelsByIds(favorites.join(',')),
    enabled: favorites.length > 0,
  });

  const formatCount = (num: string) => {
    const n = parseInt(num, 10);
    if (n >= 10000) return `${(n / 10000).toFixed(1)}만`;
    return n.toLocaleString();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      {/* Hero Section */}
      <section className="text-center py-12 space-y-6">
        <div className="inline-flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 px-4 py-2 rounded-full text-xs font-black tracking-widest uppercase mb-4 animate-bounce">
          <TrendingUp size={14} />
          Real-time Youtube Analytics
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-6xl">
          데이터로 증명하는 <br className="hidden sm:block" />
          <span className="text-red-600">유튜브 랭킹</span> 서비스
        </h1>
        
        <div className="max-w-2xl mx-auto space-y-4">
          <form onSubmit={handleSearch} className="relative mt-8 group">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="채널 이름 또는 키워드를 입력하세요..."
              className="w-full pl-14 pr-4 py-5 rounded-[24px] bg-white dark:bg-slate-900 border-none shadow-2xl dark:shadow-red-900/10 ring-2 ring-slate-100 dark:ring-slate-800 focus:ring-4 focus:ring-red-500/20 transition-all outline-none text-lg font-medium dark:text-white"
            />
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-500 transition-colors" size={24} />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 bg-slate-900 dark:bg-red-600 text-white px-8 py-3 rounded-2xl font-black hover:bg-black dark:hover:bg-red-700 transition-all shadow-lg active:scale-95">
              분석하기
            </button>
          </form>
        </div>
      </section>

      {/* Feature Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-black text-xl flex items-center gap-2 dark:text-white"><BarChart3 className="text-blue-500" /> 분야별 포화도 (HOT)</h3>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-full">Weekly Trend</span>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CATEGORY_STATS}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 'bold' }} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="value" radius={[10, 10, 10, 10]} barSize={40}>
                  {CATEGORY_STATS.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-xs text-slate-400 text-center font-medium italic">조회수 대비 채널 경쟁도 지표 (높을수록 경쟁 치열)</p>
        </div>

        <div className="bg-slate-900 dark:bg-slate-900 p-8 rounded-[32px] text-white shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform">
            <Flame size={120} />
          </div>
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-2 text-red-500 font-black italic tracking-tighter uppercase">
              <Zap size={20} fill="currentColor" /> 실시간 떡상 예보
            </div>
            <div className="space-y-4">
              <RisingItem rank={1} name="여행하는 부부" score="98.5" cate="여행" />
              <RisingItem rank={2} name="머니인사이드" score="94.2" cate="경제" />
              <RisingItem rank={3} name="오목교 테라스" score="91.8" cate="IT" />
            </div>
            <Link to="/ranking?q=국뽕" className="inline-flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-white transition-colors">
              전체 떡상 채널 목록 보기 <ChevronRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      {/* Favorites Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b dark:border-slate-800 pb-4">
          <h2 className="text-2xl font-black flex items-center gap-2 dark:text-white"><Star className="text-yellow-400 fill-yellow-400" /> 관심 분석 채널</h2>
        </div>
        {favorites && favorites.length > 0 && favoriteChannels && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {favoriteChannels.map((channel) => (
              <Link key={channel.id} to={`/channel/${channel.id}`} className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-red-100 dark:hover:border-red-900 transition-all group flex flex-col items-center text-center gap-3">
                <img src={channel.snippet.thumbnails.default.url} className="w-16 h-16 rounded-[20px] shadow-md group-hover:scale-105 transition-transform" />
                <p className="text-slate-900 dark:text-slate-200 font-black truncate w-full px-2 tracking-tight">{channel.snippet.title}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">구독자 {formatCount(channel.statistics.subscriberCount)}명</p>
              </Link>
            ))}
          </div>
        )}
        {(!favorites || favorites.length === 0) && (
          <div className="bg-white dark:bg-slate-900 p-12 rounded-[32px] border-2 border-dashed border-slate-100 dark:border-slate-800 text-center text-slate-400">
            <p className="font-medium">즐겨찾는 채널이 없습니다. 검색을 통해 채널을 추가해보세요!</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
