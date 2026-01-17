
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Search, 
  TrendingUp, 
  Zap, 
  BarChart3, 
  ImageIcon, 
  Trophy, 
  ChevronRight, 
  PlayCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';

const HomePage: React.FC = () => {
  const [keyword, setKeyword] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/channel?q=${encodeURIComponent(keyword)}`);
    }
  };

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative pt-12 md:pt-20 text-center space-y-8 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-red-600/10 blur-[120px] rounded-full -z-10" />
        
        <div className="inline-flex items-center gap-2 bg-red-50 dark:bg-red-600/10 text-red-600 px-5 py-2.5 rounded-full text-sm font-black animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <Sparkles size={16} />
          <span>국내 No.1 유튜브분석툴 & 유튜브 랭킹 서비스, 알고픽</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1]">
          유튜브 알고리즘, <br />
          <span className="text-red-600">알고픽</span>으로 진짜 비밀을 분석하세요
        </h1>

        <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto">
          단순한 데이터 나열이 아닙니다. 알고픽은 상위 검색 키워드와 <br className="hidden md:block" />
          구독자 대비 조회수 고효율 영상의 진짜 성공 패턴을 분석합니다.
        </p>

        <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative group px-4">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="분석할 채널명 또는 유튜브 랭킹 키워드를 입력하세요"
            className="w-full pl-16 pr-32 py-5 rounded-3xl bg-white dark:bg-[#1a1a1a] border-2 border-slate-100 dark:border-white/5 shadow-2xl focus:border-red-600 dark:focus:border-red-600 outline-none transition-all text-lg font-bold"
          />
          <Search className="absolute left-9 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-600" size={24} />
          <button type="submit" className="absolute right-7 top-1/2 -translate-y-1/2 bg-red-600 text-white px-8 py-3 rounded-2xl font-black hover:bg-red-700 active:scale-95 transition-all shadow-lg">
            무료 분석
          </button>
        </form>

        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-black text-slate-400 pt-4 uppercase tracking-widest">
          <span>급상승 키워드:</span>
          {['유튜브분석툴', '유튜브 랭킹 TOP100', '썸네일 클릭 전략', '알고리즘 비밀'].map(tag => (
            <button key={tag} onClick={() => setKeyword(tag)} className="hover:text-red-600 transition-colors">#{tag}</button>
          ))}
        </div>
      </section>

      {/* Stats Features */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FeatureCard 
          icon={TrendingUp} 
          title="유튜브 랭킹 분석" 
          desc="단순 구독자 순위가 아닌, 현재 가장 뜨겁게 반응하는 실시간 유튜브 랭킹 데이터를 제공합니다."
          color="bg-blue-500"
          to="/ranking"
        />
        <FeatureCard 
          icon={ImageIcon} 
          title="AI 썸네일 분석" 
          desc="성공한 썸네일들의 시각적 공통점을 AI가 분석하여 클릭률을 높이는 최적의 구도를 제안합니다."
          color="bg-purple-500"
          to="/thumbnail"
        />
        <FeatureCard 
          icon={Zap} 
          title="성공 영상 아카이브" 
          desc="구독자 대비 조회수가 압도적인 '고효율 영상'들만 따로 모아 알고리즘의 선택 지표를 분석합니다."
          color="bg-red-500"
          to="/success-videos"
        />
      </section>

      {/* Success Video Preview */}
      <section className="space-y-10">
        <div className="flex items-end justify-between border-b dark:border-white/5 pb-6">
          <div className="space-y-1">
            <h2 className="text-3xl font-black flex items-center gap-3">
              <Trophy className="text-red-600" size={32} />
              유튜브 알고리즘 선택 TOP 랭킹
            </h2>
            <p className="text-slate-500 font-bold">지금 이 시간, 대한민국에서 가장 높은 성과를 내는 성공 모델입니다.</p>
          </div>
          <Link to="/success-videos" className="text-sm font-black text-slate-400 hover:text-red-600 flex items-center gap-1 transition-colors">
            더 많은 랭킹 보기 <ChevronRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <VideoCard 
            rank={1}
            title="알고리즘이 선택하는 채널들의 공통 특징 5가지"
            channel="알고픽 데이터센터"
            views="1.2M"
            ratio="1200%"
            thumbnail="https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=225&fit=crop"
          />
          <VideoCard 
            rank={2}
            title="유튜브분석툴로 찾아낸 썸네일 클릭율의 비밀"
            channel="전략연구소"
            views="850K"
            ratio="450%"
            thumbnail="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=225&fit=crop"
          />
          <VideoCard 
            rank={3}
            title="유튜브 랭킹 1위 채널의 업로드 시간 전략"
            channel="트렌드코리아"
            views="500K"
            ratio="320%"
            thumbnail="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=225&fit=crop"
          />
          <VideoCard 
            rank={4}
            title="구독자 0명에서 10만까지, 데이터로 본 성장 곡선"
            channel="성장가이드"
            views="3.4M"
            ratio="210%"
            thumbnail="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=225&fit=crop"
          />
        </div>
      </section>

      {/* Guide CTA */}
      <section className="bg-red-600 rounded-[40px] p-12 text-white relative overflow-hidden group shadow-2xl shadow-red-600/30">
        <div className="absolute top-0 right-0 p-16 opacity-10 group-hover:scale-110 transition-transform">
          <PlayCircle size={200} fill="white" />
        </div>
        <div className="relative z-10 max-w-2xl space-y-6">
          <h2 className="text-4xl font-black leading-tight">
            전문가용 유튜브분석툴, <br />
            알고픽 가이드로 채널을 키우세요
          </h2>
          <p className="text-lg font-medium opacity-90">
            조회수 정체기를 극복하고 싶으신가요? <br />
            알고픽의 정밀 데이터를 기반으로 상위 랭킹 채널들의 전략을 그대로 흡수하세요.
          </p>
          <Link to="/guide" className="inline-flex items-center gap-3 bg-white text-red-600 px-8 py-4 rounded-2xl font-black hover:bg-slate-50 transition-all shadow-xl active:scale-95">
            성장 가이드 열람하기 <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, desc, color, to }: any) => (
  <Link to={to} className="bg-white dark:bg-[#1a1a1a] p-8 rounded-[32px] border dark:border-white/5 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all group">
    <div className={`${color} w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-inherit/20`}>
      <Icon size={28} />
    </div>
    <h3 className="text-xl font-black mb-3 group-hover:text-red-600 transition-colors">{title}</h3>
    <p className="text-sm text-slate-500 font-medium leading-relaxed">{desc}</p>
  </Link>
);

const VideoCard = ({ rank, title, channel, views, ratio, thumbnail }: any) => (
  <div className="bg-white dark:bg-[#1a1a1a] rounded-3xl overflow-hidden border dark:border-white/5 shadow-sm group hover:shadow-xl transition-all">
    <div className="relative aspect-video">
      <img src={thumbnail} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={title} />
      <div className="absolute top-3 left-3 bg-black/80 text-white w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black border border-white/20">
        {rank}
      </div>
      <div className="absolute bottom-3 right-3 bg-red-600 text-white px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest shadow-lg">
        성능 {ratio}
      </div>
    </div>
    <div className="p-5 space-y-3">
      <h4 className="font-bold text-sm line-clamp-2 leading-snug h-10 group-hover:text-red-600 transition-colors">{title}</h4>
      <div className="flex items-center justify-between text-[11px] font-black text-slate-400 uppercase tracking-widest">
        <span>{channel}</span>
        <span className="text-red-600">조회수 {views}</span>
      </div>
    </div>
  </div>
);

export default HomePage;
