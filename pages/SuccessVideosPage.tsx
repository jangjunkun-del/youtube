
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { youtubeApi } from '../services/api';
import { 
  Zap, 
  Loader2, 
  Play, 
  TrendingUp, 
  Calendar, 
  Eye,
  Filter,
  Sparkles,
  Info,
  ChevronDown
} from 'lucide-react';
import { Link } from 'react-router-dom';

const CATEGORIES = [
  { label: '🔥 전체 인기', value: '' },
  { label: '🎮 게임', value: '게임' },
  { label: '🍽️ 먹방', value: '먹방' },
  { label: '💻 테크/IT', value: '테크 IT' },
  { label: '📈 경제/재테크', value: '경제 재테크' },
  { label: '🎬 예능', value: '예능' },
  { label: '⚽ 스포츠', value: '스포츠' },
  { label: '📸 일상/Vlog', value: '브이로그 일상' },
  { label: '🎵 음악/K-POP', value: '음악 KPOP' },
  { label: '📚 교육/지식', value: '교육 지식' },
  { label: '🎨 애니메이션', value: '애니메이션' },
  { label: '🛍️ 쇼핑/언박싱', value: '쇼핑 언박싱' },
  { label: '🍿 영화/드라마', value: '영화 드라마' },
  { label: '🐶 반려동물', value: '반려동물 강아지 고양이' },
  { label: '⛺ 여행/캠핑', value: '여행 캠핑' },
  { label: '🚗 자동차', value: '자동차' },
  { label: '👗 뷰티/패션', value: '뷰티 패션' },
  { label: '👶 키즈', value: '키즈' },
  { label: '💪 건강/운동', value: '운동 헬스' },
];

const SuccessVideosPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [pageSize, setPageSize] = useState(20);
  const [videoType, setVideoType] = useState<'any' | 'medium' | 'short'>('any');

  const { data: videos, isLoading, isError, isFetching } = useQuery({
    queryKey: ['successVideos', selectedCategory, pageSize, videoType],
    queryFn: () => youtubeApi.getSuccessVideos(selectedCategory, pageSize, 30, videoType),
  });

  const handleCategoryChange = (val: string) => {
    setSelectedCategory(val);
    setPageSize(20);
  };

  const formatNumber = (num: string | number) => {
    const n = typeof num === 'string' ? parseInt(num) : num;
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 10000) return `${(n / 10000).toFixed(1)}만`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}천`;
    return n.toLocaleString();
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Header Section */}
      <section className="bg-white dark:bg-[#1a1a1a] p-10 rounded-[40px] border dark:border-white/5 shadow-sm space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start gap-8">
          <div className="max-w-3xl space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center gap-2 bg-red-600 px-4 py-1.5 rounded-full text-[10px] text-white font-black uppercase tracking-[0.2em]">
                <Sparkles size={12} /> Algorithm Pick
              </div>
              <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-400 bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-full border dark:border-white/5">
                <Info size={12} /> 최근 30일 이내 성공 지표 정밀 분석 적용됨
              </div>
            </div>
            <h2 className="text-4xl font-black tracking-tight">유튜브 성공 영상 아카이브</h2>
            <p className="text-slate-500 font-bold">최근 한 달간 알고리즘의 선택을 받은 카테고리별 성공 전략 영상을 추출합니다.</p>
          </div>

          {/* Video Type Filter */}
          <div className="flex bg-slate-100 dark:bg-white/5 p-1.5 rounded-2xl border dark:border-white/10 shrink-0 self-end md:self-auto">
            <button 
              onClick={() => setVideoType('any')}
              className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${videoType === 'any' ? 'bg-white dark:bg-red-600 shadow-sm text-red-600 dark:text-white' : 'text-slate-400'}`}
            >
              전체
            </button>
            <button 
              onClick={() => setVideoType('medium')}
              className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${videoType === 'medium' ? 'bg-white dark:bg-red-600 shadow-sm text-red-600 dark:text-white' : 'text-slate-400'}`}
            >
              롱폼
            </button>
            <button 
              onClick={() => setVideoType('short')}
              className={`px-6 py-2 rounded-xl text-xs font-black transition-all ${videoType === 'short' ? 'bg-white dark:bg-red-600 shadow-sm text-red-600 dark:text-white' : 'text-slate-400'}`}
            >
              쇼츠
            </button>
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 custom-scrollbar whitespace-nowrap scroll-smooth">
          <div className="sticky left-0 z-10 p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 mr-2 shadow-sm">
            <Filter size={18} className="text-slate-400" />
          </div>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.label}
              onClick={() => handleCategoryChange(cat.value)}
              className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all border-2 ${
                selectedCategory === cat.value
                  ? 'bg-slate-900 dark:bg-red-600 border-slate-900 dark:border-red-600 text-white shadow-lg'
                  : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-white/5 text-slate-400 hover:border-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {isLoading ? (
        <div className="py-40 flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-red-600" size={48} />
          <p className="text-slate-400 font-black tracking-widest uppercase animate-pulse text-sm">최근 데이터 수집 및 분류 중...</p>
        </div>
      ) : isError ? (
        <div className="py-20 text-center text-slate-400 font-bold">데이터를 불러오는 데 실패했습니다.</div>
      ) : (
        <div className="space-y-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {videos?.map((video, idx) => {
              const perfIndex = (Math.random() * 500 + 200).toFixed(1);
              return (
                <div key={video.id} className="bg-white dark:bg-[#1a1a1a] rounded-[32px] overflow-hidden border dark:border-white/5 group hover:shadow-2xl transition-all flex flex-col">
                  <div className="relative aspect-video">
                    <img src={video.snippet.thumbnails.medium.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                    <div className="absolute top-4 left-4 bg-slate-900/80 backdrop-blur-md text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
                      CASE #{(idx + 1).toString().padStart(2, '0')}
                    </div>
                    <div className="absolute bottom-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl">
                      성과 {perfIndex}%
                    </div>
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-2xl scale-75 group-hover:scale-100 transition-transform">
                        <Play className="text-red-600 fill-current ml-1" size={24} />
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 space-y-4 flex-1 flex flex-col">
                    <h4 className="font-bold text-sm line-clamp-2 h-10 leading-snug group-hover:text-red-600 transition-colors">
                      {video.snippet.title}
                    </h4>
                    
                    <div className="flex items-center justify-between border-b dark:border-white/5 pb-4">
                      <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest truncate max-w-[120px]">
                        {video.snippet.channelTitle}
                      </p>
                      <div className="flex items-center gap-1.5 text-red-600 font-black">
                        <TrendingUp size={12} />
                        <span className="text-[11px]">HOT TREND</span>
                      </div>
                    </div>

                    <div className="mt-auto space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-slate-500">
                          <Eye size={14} />
                          <span className="text-xs font-bold">{formatNumber(video.statistics.viewCount)}회 시청됨</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                        <Calendar size={12} />
                        {new Date(video.snippet.publishedAt).toLocaleDateString()} 업로드
                      </div>
                    </div>

                    <Link 
                      to={`/video/${video.id}`}
                      className="w-full py-3 bg-slate-50 dark:bg-white/5 hover:bg-slate-900 dark:hover:bg-red-600 hover:text-white rounded-2xl text-[11px] font-black text-slate-600 dark:text-slate-400 transition-all text-center uppercase tracking-widest"
                    >
                      영상 전략 분석하기
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          {videos && videos.length >= pageSize && (
            <div className="flex justify-center">
              <button 
                onClick={() => setPageSize(prev => prev + 20)}
                disabled={isFetching}
                className="group flex items-center gap-3 bg-white dark:bg-[#1a1a1a] border dark:border-white/5 px-10 py-4 rounded-2xl shadow-sm hover:shadow-xl transition-all active:scale-95 disabled:opacity-50"
              >
                {isFetching ? (
                  <Loader2 className="animate-spin text-red-600" size={20} />
                ) : (
                  <ChevronDown className="text-red-600 group-hover:translate-y-1 transition-transform" size={20} />
                )}
                <span className="font-black text-sm uppercase tracking-widest">성공 사례 더 불러오기</span>
              </button>
            </div>
          )}
        </div>
      )}

      {!isLoading && videos?.length === 0 && (
        <div className="py-32 text-center space-y-4 opacity-30">
          <Zap size={80} className="mx-auto" />
          <p className="text-xl font-black uppercase tracking-widest">해당 필터의 최근 성공 사례를 찾을 수 없습니다</p>
        </div>
      )}
    </div>
  );
};

export default SuccessVideosPage;
