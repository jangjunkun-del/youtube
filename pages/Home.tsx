
import React, { useState } from 'react';
import { Search, TrendingUp, Star, BarChart3, ChevronRight, Zap, Flame, DollarSign, Radio, PlayCircle, Layers, Trophy, UserPlus } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { youtubeApi } from '../services/api';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import RisingItem from '../components/RisingItem.tsx';
import TopicChart from '../components/TopicChart.tsx';
import ServiceStats from '../components/ServiceStats.tsx';
import RankingBoard from '../components/RankingBoard.tsx';
import RankingRow from '../components/RankingRow.tsx';

const CATEGORY_STATS = [
  { name: '국뽕', value: 85, color: '#ef4444' },
  { name: '재테크', value: 62, color: '#3b82f6' },
  { name: 'IT/테크', value: 45, color: '#10b981' },
  { name: '게임', value: 92, color: '#8b5cf6' },
  { name: '여행', value: 38, color: '#f59e0b' },
];

const TOPIC_CHARTS = [
  { category: '먹방', items: [{ rank: 1, title: '셰프 안성재', change: 3 }, { rank: 2, title: 'GONGSAM TABLE', change: 10 }, { rank: 3, title: '흑백리뷰', change: '-' }] },
  { category: '주식투자', items: [{ rank: 1, title: '서울경제TV', change: 1 }, { rank: 2, title: '신사임당', change: 1 }, { rank: 3, title: '오선의 증시', change: '-' }] },
  { category: '애견인', items: [{ rank: 1, title: '동댕지동댕', change: 18 }, { rank: 2, title: '상상이상_반려', change: 24 }, { rank: 3, title: '해수인tv', change: 15 }] },
  { category: '캠핑', items: [{ rank: 1, title: 'RYUCAMP', change: 29 }, { rank: 2, title: '캠핑제국', change: 'NEW' }, { rank: 3, title: '김숙티비', change: 1 }] },
];

const MOCK_AVATARS = [
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop",
  "https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100&h=100&fit=crop",
  "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=100&h=100&fit=crop",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop",
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
    <div className="max-w-6xl mx-auto space-y-16 pb-20">
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
              <BarChart chart={BarChart} data={CATEGORY_STATS}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8', fontWeight: 'bold' }} />
                <Tooltip cursor={{ fill: 'transparent' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="value" radius={[10, 10, 10, 10]} barSize={40}>
                  {CATEGORY_STATS.map((entry, index) => (
                    <Cell key={` cell-${index}`} fill={entry.color} fillOpacity={0.8} />
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

      {/* Main Rank Boards (Row 1) */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        <RankingBoard title="슈퍼챗 순위" icon={DollarSign} iconColor="text-emerald-500" filterLabel="주간" link="/ranking?q=슈퍼챗">
          <RankingRow rank={1} title="다썰남TV" value="₩2,843,243" color="text-red-500" img={MOCK_AVATARS[0]} prefix="+" />
          <RankingRow rank={2} title="진격의 변호사들" value="₩2,210,175" color="text-red-500" img={MOCK_AVATARS[1]} prefix="+" />
          <RankingRow rank={3} title="수와진 안상수tv" value="₩2,016,155" color="text-red-500" img={MOCK_AVATARS[2]} prefix="+" />
          <RankingRow rank={4} title="백곰사령관" value="₩1,886,015" color="text-red-500" img={MOCK_AVATARS[3]} prefix="+" />
          <RankingRow rank={5} title="만산월 만산마법사" value="₩1,754,265" color="text-red-500" img={MOCK_AVATARS[4]} prefix="+" />
        </RankingBoard>

        <RankingBoard title="라이브 시청자" icon={Radio} iconColor="text-red-500" filterLabel="방송중" link="/ranking?q=라이브">
          <RankingRow rank={1} title="김어준의 겸손은힘들다" value="265,587명" color="text-red-600" img={MOCK_AVATARS[4]} />
          <RankingRow rank={2} title="[팟빵] 최욱의 매불쇼" value="202,007명" color="text-red-600" img={MOCK_AVATARS[3]} />
          <RankingRow rank={3} title="사장남천동" value="75,980명" color="text-red-600" img={MOCK_AVATARS[2]} />
          <RankingRow rank={4} title="MBCNEWS" value="51,518명" color="text-red-600" img={MOCK_AVATARS[1]} />
          <RankingRow rank={5} title="오선의 미국 증시" value="46,372명" color="text-red-600" img={MOCK_AVATARS[0]} />
        </RankingBoard>

        <RankingBoard title="인기 순위" icon={Trophy} iconColor="text-yellow-500" filterLabel="일간" link="/ranking?q=인기">
          <RankingRow rank={1} title="MBCNEWS" value="-" color="text-slate-400" img={MOCK_AVATARS[1]} />
          <RankingRow rank={2} title="SBS 뉴스" value="1" color="text-red-500" img={MOCK_AVATARS[2]} trend="up" />
          <RankingRow rank={3} title="JTBC News" value="1" color="text-red-500" img={MOCK_AVATARS[0]} trend="up" />
          <RankingRow rank={4} title="Rumi-KPOP" value="1" color="text-red-500" img={MOCK_AVATARS[3]} trend="up" />
          <RankingRow rank={5} title="HYBE LABELS" value="3" color="text-blue-500" img={MOCK_AVATARS[4]} trend="down" />
        </RankingBoard>
      </section>

      {/* Main Rank Boards (Row 2) */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <RankingBoard title="구독자 급상승" icon={UserPlus} iconColor="text-blue-500" filterLabel="주간" link="/ranking?q=급상승">
          <RankingRow rank={1} title="LNGSHOT" value="26,000명" color="text-red-500" img={MOCK_AVATARS[3]} prefix="+" />
          <RankingRow rank={2} title="임성근 임짱TV" value="23,000명" color="text-red-500" img={MOCK_AVATARS[4]} prefix="+" />
          <RankingRow rank={3} title="셰프 안성재 Chef" value="20,000명" color="text-red-500" img={MOCK_AVATARS[0]} prefix="+" />
          <RankingRow rank={4} title="Lovely Healing" value="12,000명" color="text-red-500" img={MOCK_AVATARS[2]} prefix="+" />
          <RankingRow rank={5} title="최강록 Ultra Taste" value="12,000명" color="text-red-500" img={MOCK_AVATARS[1]} prefix="+" />
        </RankingBoard>

        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between border-b dark:border-slate-800 pb-4">
            <h2 className="text-2xl font-black flex items-center gap-2 dark:text-white"><PlayCircle className="text-red-600" /> 최다 조회 영상</h2>
            <Link to="/ranking?q=최다조회" className="text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full uppercase tracking-widest hover:text-red-500 transition-colors">Weekly Global</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <VideoRankItem 
              rank={1} 
              title="ILLIT (아일릿) 'Sunday Morning' Official MV" 
              views="4.9백만" 
              channel="HYBE LABELS" 
              img="https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=400&h=225&fit=crop"
              url="https://www.youtube.com/watch?v=l9wM7UAs77M"
            />
            <VideoRankItem 
              rank={2} 
              title="2026년에는 대한민국의 새로운 도약이 시작됩니다" 
              views="3.6백만" 
              channel="대한민국정부" 
              img="https://images.unsplash.com/photo-1541873676947-95a272d6bb70?w=400&h=225&fit=crop"
              url="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
            />
          </div>
        </div>
      </section>

      {/* Topic Charts */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b dark:border-slate-800 pb-4">
          <h2 className="text-2xl font-black flex items-center gap-2 dark:text-white"><Layers className="text-purple-500" /> 토픽 차트</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {TOPIC_CHARTS.map((chart) => (
            <TopicChart key={chart.category} category={chart.category} items={chart.items} />
          ))}
        </div>
      </section>

      {/* Favorites Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between border-b dark:border-slate-800 pb-4">
          <h2 className="text-2xl font-black flex items-center gap-2 dark:text-white"><Star className="text-yellow-400 fill-yellow-400" /> 관심 분석 채널</h2>
        </div>
        {favorites && favorites.length > 0 && favoriteChannels ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {favoriteChannels.map((channel) => (
              <Link key={channel.id} to={`/channel/${channel.id}`} className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-red-100 dark:hover:border-red-900 transition-all group flex flex-col items-center text-center gap-3">
                <img src={channel.snippet.thumbnails.default.url} className="w-16 h-16 rounded-[20px] shadow-md group-hover:scale-105 transition-transform" alt="" />
                <p className="text-slate-900 dark:text-slate-200 font-black truncate w-full px-2 tracking-tight">{channel.snippet.title}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">구독자 {formatCount(channel.statistics.subscriberCount)}명</p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 p-12 rounded-[32px] border-2 border-dashed border-slate-100 dark:border-slate-800 text-center text-slate-400">
            <p className="font-medium">즐겨찾는 채널이 없습니다. 검색을 통해 채널을 추가해보세요!</p>
          </div>
        )}
      </section>

      {/* Service Stats Banner */}
      <section className="pt-8">
        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
          Analysis Status Indicator
        </div>
        <ServiceStats />
      </section>
    </div>
  );
};

const VideoRankItem = ({ rank, title, views, channel, img, url }: any) => {
  const [hasError, setHasError] = useState(false);

  return (
    <a 
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-[28px] border dark:border-slate-800 group hover:shadow-lg transition-all min-h-[112px] cursor-pointer block no-underline"
    >
      <div className="relative shrink-0">
        <span className="absolute -top-2 -left-2 w-6 h-6 bg-slate-900 text-white rounded-lg flex items-center justify-center text-[10px] font-black z-10 shadow-lg group-hover:bg-red-600 transition-colors">
          {rank}
        </span>
        <div className="w-32 h-20 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-sm group-hover:scale-105 transition-transform flex items-center justify-center">
          {hasError ? (
            <PlayCircle className="text-slate-300 dark:text-slate-600" size={32} />
          ) : (
            <img 
              src={img} 
              className="w-full h-full object-cover block" 
              alt="" 
              loading="lazy"
              onError={() => setHasError(true)}
            />
          )}
        </div>
      </div>
      <div className="flex-1 space-y-1 min-w-0">
        <p className="text-xs font-black text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-red-600 transition-colors">
          {title}
        </p>
        <div className="flex items-center justify-between">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate mr-2">{channel}</p>
          <p className="text-[10px] font-black text-red-600 shrink-0">+{views}</p>
        </div>
      </div>
    </a>
  );
};

export default Home;
