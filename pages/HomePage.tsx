
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
          <span>데이터로 증명하는 유튜브 성장 전략</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.1]">
          유튜브 알고리즘의 <br />
          <span className="text-red-600">진짜 비밀</span>을 분석하세요
        </h1>

        <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 font-medium max-w-2xl mx-auto">
          유튜브분석툴은 구독자 대비 조회수, 썸네일 클릭률, 알고리즘 추천 데이터를 <br className="hidden md:block" />
          정밀 분석하여 채널 성장 가이드를 제공합니다.
        </p>

        <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative group px-4">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="채널명 또는 핸들(@channel)을 입력하세요"
            className="w-full pl-16 pr-32 py-5 rounded-3xl bg-white dark:bg-[#1a1a1a] border-2 border-slate-100 dark:border-white/5 shadow-2xl focus:border-red-600 dark:focus:border-red-600 outline-none transition-all text-lg font-bold"
          />
          <Search className="absolute left-9 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-600" size={24} />
          <button type="submit" className="absolute right-7 top-1/2 -translate-y-1/2 bg-red-600 text-white px-8 py-3 rounded-2xl font-black hover:bg-red-700 active:scale-95 transition-all shadow-lg">
            분석
          </button>
        </form>

        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-black text-slate-400 pt-4 uppercase tracking-widest">
          <span>인기 검색어:</span>
          {['먹방 분석', 'IT 유튜버 순위', '쇼츠 성공사례', '국뽕 채널'].map(tag => (
            <button key={tag} onClick={() => setKeyword(tag)} className="hover:text-red-600">#{tag}</button>
          ))}
        </div>
      </section>

      {/* Stats Features */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FeatureCard 
          icon={TrendingUp} 
          title="유튜브 조회수 분석" 
          desc="업로드 후 경과 시간 대비 조회수 성장 속도를 분석하여 알고리즘 추천 가능성을 점칩니다."
          color="bg-blue-500"
          to="/views"
        />
        <FeatureCard 
          icon={ImageIcon} 
          title="유튜브 썸네일 분석" 
          desc="성과 상위 영상들의 썸네일 스타일과 클릭 유도 패턴을 시각화하여 보여드립니다."
          color="bg-purple-500"
          to="/thumbnail"
        />
        <FeatureCard 
          icon={Trophy} 
          title="성능 랭킹 TOP 100" 
          desc="구독자 수 대비 조회수 비율이 압도적인 '효율성 끝판왕' 채널들을 자동 추출합니다."
          color="bg-amber-500"
          to="/ranking"
        />
      </section>

      {/* Success Video Preview */}
      <section className="space-y-10">
        <div className="flex items-end justify-between border-b dark:border-white/5 pb-6">
          <div className="space-y-1">
            <h2 className="text-3xl font-black flex items-center gap-3">
              <Zap className="text-red-600 fill-current" size={32} />
              지금 뜨고 있는 유튜브 성공 영상
            </h2>
            <p className="text-slate-500 font-bold">실시간 알고리즘의 선택을 받은 영상들을 분석합니다.</p>
          </div>
          <Link to="/success-videos" className="text-sm font-black text-slate-400 hover:text-red-600 flex items-center gap-1">
            전체보기 <ChevronRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <VideoCard 
            rank={1}
            title="구독자 1000명으로 조회수 100만 찍는 법"
            channel="분석마스터"
            views="1.2M"
            ratio="1200%"
            thumbnail="https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=400&h=225&fit=crop"
          />
          <VideoCard 
            rank={2}
            title="유튜브 썸네일 폰트 하나로 클릭률 3배 올리기"
            channel="디자인로그"
            views="850K"
            ratio="450%"
            thumbnail="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=225&fit=crop"
          />
          <VideoCard 
            rank={3}
            title="2024년 유튜브 알고리즘 패치 노트 요약"
            channel="알고리즘랩"
            views="500K"
            ratio="320%"
            thumbnail="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=225&fit=crop"
          />
          <VideoCard 
            rank={4}
            title="쇼츠 수익화, 이제는 방법이 달라졌습니다"
            channel="쇼츠장인"
            views="3.4M"
            ratio="210%"
            thumbnail="https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=225&fit=crop"
          />
        </div>
      </section>

      {/* Guide CTA */}
      <section className="bg-red-600 rounded-[40px] p-12 text-white relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-16 opacity-10 group-hover:scale-110 transition-transform">
          <PlayCircle size={200} fill="white" />
        </div>
        <div className="relative z-10 max-w-2xl space-y-6">
          <h2 className="text-4xl font-black leading-tight">
            데이터로 시작하는 <br />
            유튜브 성장 가이드를 확인하세요
          </h2>
          <p className="text-lg font-medium opacity-90">
            조회수가 안 나와서 고민이신가요? 썸네일 디자인부터 제목 짓기까지, <br />
            실제 데이터를 기반으로 한 가장 확실한 전략을 제공합니다.
          </p>
          <Link to="/guide" className="inline-flex items-center gap-3 bg-white text-red-600 px-8 py-4 rounded-2xl font-black hover:bg-slate-50 transition-all shadow-xl">
            성장 가이드 읽기 <ArrowRight size={20} />
          </Link>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, desc, color, to }: any) => (
  <Link to={to} className="bg-white dark:bg-[#1a1a1a] p-8 rounded-[32px] border dark:border-white/5 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all group">
    <div className={`${color} w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg`}>
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
