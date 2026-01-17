
import React, { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { youtubeApi } from '../services/api';
import { 
  Search, 
  Loader2, 
  Users, 
  PlayCircle, 
  TrendingUp, 
  Zap, 
  Calendar,
  ThumbsUp,
  MessageSquare,
  DollarSign,
  Heart,
  BarChart,
  Info
} from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import MetricCard from '../components/MetricCard.tsx';

const ChannelPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const [input, setInput] = useState(queryParam);

  const { data: channel, isLoading: channelLoading } = useQuery({
    queryKey: ['channelAnalysis', queryParam],
    queryFn: () => youtubeApi.getChannelDetail(queryParam),
    enabled: !!queryParam,
  });

  const { data: videos, isLoading: videosLoading } = useQuery({
    queryKey: ['channelVideosAnalysis', channel?.contentDetails?.relatedPlaylists.uploads],
    queryFn: () => youtubeApi.getChannelVideos(channel!.contentDetails!.relatedPlaylists.uploads),
    enabled: !!channel,
  });

  // 고도화 지표 계산
  const analytics = useMemo(() => {
    if (!videos || !channel || videos.length === 0) return null;

    const totalViewsRecent = videos.reduce((acc, v) => acc + parseInt(v.statistics.viewCount || '0'), 0);
    const totalLikesRecent = videos.reduce((acc, v) => acc + parseInt(v.statistics.likeCount || '0'), 0);
    const totalCommentsRecent = videos.reduce((acc, v) => acc + parseInt(v.statistics.commentCount || '0'), 0);
    
    const avgViews = totalViewsRecent / videos.length;
    const engagementRate = ((totalLikesRecent + totalCommentsRecent) / totalViewsRecent) * 100;

    // 업로드 주기 계산 (최근 50개 기준)
    const firstDate = new Date(videos[videos.length - 1].snippet.publishedAt).getTime();
    const lastDate = new Date(videos[0].snippet.publishedAt).getTime();
    const daysDiff = Math.max(1, (lastDate - firstDate) / (1000 * 3600 * 24));
    const uploadsPerDay = videos.length / daysDiff;
    const estimatedMonthlyViews = avgViews * uploadsPerDay * 30;

    // 예상 수익 계산 (CPM 1.5 ~ 4.5 USD/1000 views 기준 추정)
    const revMin = (estimatedMonthlyViews / 1000) * 1500;
    const revMax = (estimatedMonthlyViews / 1000) * 4500;

    return {
      avgViews,
      engagementRate,
      estimatedMonthlyViews,
      revMin,
      revMax,
      uploadsPerMonth: uploadsPerDay * 30
    };
  }, [videos, channel]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) setSearchParams({ q: input.trim() });
  };

  const formatNumber = (num: string | number) => {
    const n = typeof num === 'string' ? parseInt(num) : num;
    if (n >= 100000000) return `${(n / 100000000).toFixed(1)}억`;
    if (n >= 10000) return `${(n / 10000).toFixed(1)}만`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}천`;
    return n.toLocaleString();
  };

  const formatCurrency = (num: number) => {
    if (num >= 100000000) return `${(num / 100000000).toFixed(1)}억`;
    if (num >= 10000) return `${(num / 10000).toFixed(1)}만`;
    return Math.floor(num).toLocaleString();
  };

  return (
    <div className="space-y-12">
      {/* Header & Search */}
      <section className="bg-white dark:bg-[#1a1a1a] p-10 rounded-[40px] border dark:border-white/5 shadow-sm space-y-8">
        <div className="max-w-3xl">
          <h2 className="text-3xl font-black mb-2">유튜브 채널 분석</h2>
          <p className="text-slate-500 font-bold">성장 데이터를 정밀 분석하고 성공 패턴을 찾아보세요.</p>
        </div>
        <form onSubmit={handleSearch} className="relative max-w-2xl group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="채널명 또는 핸들(@channel)을 입력하세요"
            className="w-full pl-14 pr-32 py-4 rounded-2xl bg-slate-50 dark:bg-white/5 border-2 border-transparent focus:border-red-600 outline-none transition-all font-bold"
          />
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-600" size={20} />
          <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-slate-900 dark:bg-red-600 text-white px-6 py-2.5 rounded-xl font-black shadow-lg">
            분석
          </button>
        </form>
      </section>

      {channelLoading && (
        <div className="py-20 flex flex-col items-center justify-center gap-4 text-slate-400">
          <Loader2 className="animate-spin text-red-600" size={48} />
          <p className="font-black animate-pulse">데이터를 수집하고 분석하는 중...</p>
        </div>
      )}

      {channel && (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Channel Summary */}
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <img src={channel.snippet.thumbnails.high.url} className="w-32 h-32 rounded-[32px] shadow-2xl object-cover border-4 border-white dark:border-white/10" alt="" />
            <div className="flex-1 space-y-4 pt-2">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-4xl font-black tracking-tight">{channel.snippet.title}</h3>
                <span className="bg-red-50 dark:bg-red-600/10 text-red-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-100 dark:border-red-900/30">Verified Analytic</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-medium line-clamp-2 max-w-2xl text-sm leading-relaxed">{channel.snippet.description}</p>
              <div className="flex flex-wrap gap-3">
                <div className="bg-white dark:bg-[#1a1a1a] border dark:border-white/5 px-4 py-2 rounded-2xl shadow-sm flex items-center gap-2">
                  <Users size={16} className="text-blue-500" />
                  <span className="text-sm font-black">구독자 {formatNumber(channel.statistics.subscriberCount)}</span>
                </div>
                <div className="bg-white dark:bg-[#1a1a1a] border dark:border-white/5 px-4 py-2 rounded-2xl shadow-sm flex items-center gap-2">
                  <PlayCircle size={16} className="text-red-500" />
                  <span className="text-sm font-black">총 조회수 {formatNumber(channel.statistics.viewCount)}</span>
                </div>
                <div className="bg-white dark:bg-[#1a1a1a] border dark:border-white/5 px-4 py-2 rounded-2xl shadow-sm flex items-center gap-2">
                  <Zap size={16} className="text-amber-500" />
                  <span className="text-sm font-black">영상 {channel.statistics.videoCount}개</span>
                </div>
              </div>
            </div>
          </div>

          {/* Advanced Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard 
              label="평균 조회수 (최근 50개)" 
              value={analytics ? formatNumber(analytics.avgViews) : '-'} 
              color="text-red-600" 
              bg="bg-red-50 dark:bg-red-900/10" 
            />
            <MetricCard 
              label="참여율 (조회수 대비)" 
              value={analytics ? `${analytics.engagementRate.toFixed(1)}%` : '-'} 
              color="text-pink-600" 
              bg="bg-pink-50 dark:bg-pink-900/10" 
            />
            <MetricCard 
              label="예상 월 업로드" 
              value={analytics ? `${analytics.uploadsPerMonth.toFixed(1)}개` : '-'} 
              color="text-emerald-600" 
              bg="bg-emerald-50 dark:bg-emerald-900/10" 
            />
            <MetricCard 
              label="예상 월간 조회수" 
              value={analytics ? formatNumber(analytics.estimatedMonthlyViews) : '-'} 
              color="text-blue-600" 
              bg="bg-blue-50 dark:bg-blue-900/10" 
            />
          </div>

          {/* Revenue Analysis Section */}
          <div className="bg-slate-900 p-10 rounded-[40px] text-white space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-10 opacity-10">
              <DollarSign size={180} />
            </div>
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-2 text-red-500 font-black uppercase tracking-widest text-xs">
                <BarChart size={16} /> Business Value Report
              </div>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                  <h4 className="text-2xl font-black">예상 유튜브 월 광고 수익</h4>
                  <p className="text-slate-400 text-sm font-medium">채널 활동성과 한국 평균 CPM 데이터를 기반으로 산출된 추정 수익입니다.</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl md:text-5xl font-black text-red-500">
                    ₩{analytics ? formatCurrency(analytics.revMin) : '0'} ~ ₩{analytics ? formatCurrency(analytics.revMax) : '0'}
                  </div>
                  <p className="text-slate-500 text-[10px] font-bold mt-2 uppercase tracking-widest">Estimated monthly ad revenue (KRW)</p>
                </div>
              </div>
              
              <div className="pt-6 border-t border-white/10 flex items-start gap-3">
                <Info size={16} className="text-slate-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                  [면책조항] 본 수익 추정치는 YouTube API 데이터를 기반으로 한 산출값이자 단순 참고용이며, 실제 수익(유료 광고, 채널 멤버십, 슈퍼챗, 환율 등 제외)과는 차이가 있을 수 있습니다. 조회수 대비 단가는 영상의 길이, 주제, 시청 국가에 따라 크게 변동됩니다.
                </p>
              </div>
            </div>
          </div>

          {/* Performance Chart */}
          <div className="bg-white dark:bg-[#1a1a1a] p-8 rounded-[40px] border dark:border-white/5 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h4 className="text-xl font-black flex items-center gap-2">
                <TrendingUp className="text-red-600" />
                최근 조회수 성과 추이
              </h4>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Recent 50 Videos Trend</span>
            </div>
            <div className="h-72">
              {videosLoading ? <div className="h-full bg-slate-100 dark:bg-white/5 rounded-3xl animate-pulse" /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={videos?.slice().reverse().map((v, i) => ({ 
                    idx: i, 
                    views: parseInt(v.statistics.viewCount),
                    title: v.snippet.title
                  }))}>
                    <defs>
                      <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ff0000" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#ff0000" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#888" opacity={0.1} />
                    <XAxis dataKey="idx" hide />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', backgroundColor: '#1a1a1a', color: '#fff' }}
                      labelStyle={{ display: 'none' }}
                      itemStyle={{ color: '#ef4444', fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="views" stroke="#ff0000" strokeWidth={4} fill="url(#colorViews)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Video List / Analysis */}
          <div className="space-y-6 pb-20">
            <div className="flex items-center justify-between px-2">
              <h4 className="text-xl font-black">최근 영상 성과 리스트</h4>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sorted by upload date</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos?.slice().map(video => {
                const views = parseInt(video.statistics.viewCount);
                const subs = parseInt(channel.statistics.subscriberCount);
                const perf = ((views / (subs || 1)) * 100).toFixed(1);
                
                return (
                  <div key={video.id} className="bg-white dark:bg-[#1a1a1a] rounded-3xl overflow-hidden border dark:border-white/5 group hover:shadow-xl transition-all">
                    <div className="relative aspect-video">
                      <img src={video.snippet.thumbnails.medium.url} className="w-full h-full object-cover" alt="" />
                      <div className={`absolute bottom-3 left-3 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20 shadow-lg ${
                        parseFloat(perf) > 100 ? 'bg-red-600 text-white' : 'bg-black/60 text-white'
                      }`}>
                        성과지수 {perf}%
                      </div>
                    </div>
                    <div className="p-5 space-y-4">
                      <h5 className="font-bold text-sm line-clamp-2 h-10 group-hover:text-red-600 transition-colors leading-snug">{video.snippet.title}</h5>
                      <div className="grid grid-cols-2 gap-4 border-t dark:border-white/5 pt-4">
                        <div className="space-y-1">
                          <p className="text-[10px] font-black text-slate-400 uppercase">Views</p>
                          <p className="text-sm font-black">{formatNumber(video.statistics.viewCount)}</p>
                        </div>
                        <div className="space-y-1 text-right">
                          <p className="text-[10px] font-black text-slate-400 uppercase">Likes</p>
                          <p className="text-sm font-black">{formatNumber(video.statistics.likeCount)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                        <Calendar size={12} />
                        {new Date(video.snippet.publishedAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {queryParam === '' && !channelLoading && (
        <div className="py-32 text-center space-y-4 opacity-30">
          <Search size={80} className="mx-auto" />
          <p className="text-xl font-black uppercase tracking-widest">채널을 검색하여 수익과 성과 분석을 시작하세요</p>
        </div>
      )}
    </div>
  );
};

export default ChannelPage;
