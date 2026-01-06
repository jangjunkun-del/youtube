
import React, { useState } from 'react';
import { Search, TrendingUp, Users, PlayCircle, Star, BarChart3, ChevronRight, Loader2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { youtubeApi } from '../services/api';

const Home: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/ranking?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const favorites: string[] = JSON.parse(localStorage.getItem('favorites') || '[]');

  // 즐겨찾기 채널들의 실제 정보를 가져옴
  const { data: favoriteChannels, isLoading: isFavLoading } = useQuery({
    queryKey: ['favoriteChannels', favorites.join(',')],
    queryFn: () => youtubeApi.getChannelsByIds(favorites.join(',')),
    enabled: favorites.length > 0,
  });

  const formatCount = (num: string) => {
    const n = parseInt(num, 10);
    if (n >= 10000) return `${(n / 10000).toFixed(1)}만`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}천`;
    return n.toLocaleString();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20">
      {/* Hero Section */}
      <section className="text-center py-12 space-y-6">
        <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-full text-xs font-black tracking-widest uppercase mb-4 animate-bounce">
          <TrendingUp size={14} />
          Real-time Youtube Analytics
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
          데이터로 증명하는 <br className="hidden sm:block" />
          <span className="text-red-600">유튜브 랭킹</span> 서비스
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed font-medium">
          단순한 구독자 수를 넘어, 조회수 효율과 성장 잠재력을 수치로 확인하세요. <br />
          경쟁 채널을 분석하고 나만의 즐겨찾기 리스트를 만들어보세요.
        </p>
        
        <div className="max-w-2xl mx-auto space-y-4">
          <form onSubmit={handleSearch} className="relative mt-8 group">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="채널 이름 또는 키워드(예: 캠핑, 재테크)를 입력하세요..."
              className="w-full pl-14 pr-4 py-5 rounded-[24px] border-none shadow-2xl ring-2 ring-slate-100 focus:ring-4 focus:ring-red-500/20 transition-all outline-none text-lg font-medium"
            />
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-500 transition-colors" size={24} />
            <button 
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-slate-900 text-white px-8 py-3 rounded-2xl font-black hover:bg-black transition-all shadow-lg active:scale-95"
            >
              분석하기
            </button>
          </form>

          {/* 주요 기능 바로가기 버튼 */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <Link 
              to="/ranking" 
              className="w-full sm:w-auto flex items-center justify-center gap-3 bg-red-600 text-white px-10 py-5 rounded-[20px] font-black text-lg shadow-xl shadow-red-200 hover:bg-red-700 hover:-translate-y-1 transition-all group"
            >
              <BarChart3 size={24} />
              분야별 채널 랭킹 보기
              <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <Link 
              to="/compare" 
              className="w-full sm:w-auto flex items-center justify-center gap-3 bg-white text-slate-700 px-10 py-5 rounded-[20px] font-black text-lg border-2 border-slate-100 shadow-sm hover:border-slate-200 hover:bg-slate-50 transition-all"
            >
              <PlayCircle size={24} className="text-red-500" />
              채널 비교
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 sm:px-0">
        <SummaryCard 
          icon={Users} 
          title="실시간 순위" 
          desc="키워드별 구독자 및 조회수 순위를 실시간으로 집계합니다." 
          color="text-red-600" 
          bg="bg-red-50" 
        />
        <SummaryCard 
          icon={TrendingUp} 
          title="성장 잠재력" 
          desc="구독자 대비 조회수 효율을 계산하여 '떡상' 가능성을 측정합니다." 
          color="text-blue-600" 
          bg="bg-blue-50" 
        />
        <SummaryCard 
          icon={PlayCircle} 
          title="경쟁 분석" 
          desc="최대 5개 채널의 업로드 빈도와 성과를 한눈에 비교합니다." 
          color="text-green-600" 
          bg="bg-green-50" 
        />
      </div>

      {/* Favorites Section */}
      <section className="space-y-6 px-4 sm:px-0">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <h2 className="text-2xl font-black flex items-center gap-2 tracking-tight">
            <Star className="text-yellow-400 fill-yellow-400" /> 관심 분석 채널
          </h2>
          {favorites.length > 0 && (
            <Link to="/settings" className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest">
              Manage Favorites
            </Link>
          )}
        </div>
        
        {favorites.length === 0 ? (
          <div className="bg-white border-4 border-dashed border-slate-100 rounded-[40px] p-20 text-center space-y-4">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
              <Star className="text-slate-200" size={32} />
            </div>
            <div className="space-y-1">
              <p className="text-slate-500 font-black text-lg">즐겨찾는 채널이 없습니다.</p>
              <p className="text-slate-400 text-sm font-medium">검색 결과나 랭킹 페이지에서 별 아이콘을 눌러 추가해보세요!</p>
            </div>
            <Link to="/ranking" className="inline-block mt-4 text-red-600 font-bold hover:underline">인기 채널 둘러보기 &rarr;</Link>
          </div>
        ) : isFavLoading ? (
          <div className="flex justify-center p-20">
            <Loader2 className="animate-spin text-red-500" size={32} />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {favoriteChannels?.map((channel) => (
              <Link 
                key={channel.id} 
                to={`/channel/${channel.id}`}
                className="bg-white p-6 rounded-[32px] border-2 border-slate-50 shadow-sm hover:shadow-xl hover:border-red-100 transition-all group flex flex-col items-center text-center gap-3"
              >
                <div className="relative">
                  <img 
                    src={channel.snippet.thumbnails.default.url} 
                    alt={channel.snippet.title}
                    className="w-20 h-20 rounded-[24px] shadow-md group-hover:scale-105 transition-transform bg-slate-100"
                  />
                  <div className="absolute -top-2 -right-2 bg-yellow-400 text-white p-1 rounded-full shadow-sm">
                    <Star size={12} fill="currentColor" />
                  </div>
                </div>
                <div className="w-full">
                  <p className="text-slate-900 font-black truncate w-full px-2 tracking-tight">
                    {channel.snippet.title}
                  </p>
                  <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase">
                    구독자 {formatCount(channel.statistics.subscriberCount)}명
                  </p>
                  <div className="mt-3 inline-flex items-center gap-1 text-[9px] font-black text-red-500 uppercase bg-red-50 px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    Detailed Report <ChevronRight size={10} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

const SummaryCard = ({ icon: Icon, title, desc, color, bg }: any) => (
  <div className="bg-white p-8 rounded-[32px] border-2 border-slate-50 shadow-sm flex flex-col gap-4 group hover:border-red-100 transition-all">
    <div className={`${bg} ${color} w-fit p-4 rounded-2xl group-hover:scale-110 transition-transform`}>
      <Icon size={24} />
    </div>
    <div className="space-y-1">
      <h3 className="font-black text-xl text-slate-900 tracking-tight">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed font-medium">{desc}</p>
    </div>
  </div>
);

export default Home;
