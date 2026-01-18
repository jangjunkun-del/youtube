
import React, { useState, useMemo, useEffect } from 'react';
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
  DollarSign,
  BarChart,
  Info,
  ShieldCheck,
  ChevronRight,
  Lock
} from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import MetricCard from '../components/MetricCard.tsx';

const ChannelPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const [input, setInput] = useState(queryParam);
  const [hasUserKey, setHasUserKey] = useState(false);

  useEffect(() => {
    setHasUserKey(!!localStorage.getItem('user_youtube_api_key'));
  }, []);

  const { data: channel, isLoading: channelLoading, error } = useQuery({
    queryKey: ['channelAnalysis', queryParam],
    queryFn: () => youtubeApi.getChannelDetail(queryParam),
    enabled: !!queryParam,
    retry: false
  });

  const { data: videos, isLoading: videosLoading } = useQuery({
    queryKey: ['channelVideosAnalysis', channel?.contentDetails?.relatedPlaylists.uploads],
    queryFn: () => youtubeApi.getChannelVideos(channel!.contentDetails!.relatedPlaylists.uploads),
    enabled: !!channel,
  });

  const isQuotaError = (error as any)?.message === 'QUOTA_LIMIT_REACHED';

  // 분석 지표 계산
  const analytics = useMemo(() => {
    if (!videos || !channel || videos.length === 0) return null;
    const totalViewsRecent = videos.reduce((acc, v) => acc + parseInt(v.statistics.viewCount || '0'), 0);
    const totalLikesRecent = videos.reduce((acc, v) => acc + parseInt(v.statistics.likeCount || '0'), 0);
    const totalCommentsRecent = videos.reduce((acc, v) => acc + parseInt(v.statistics.commentCount || '0'), 0);
    const avgViews = totalViewsRecent / videos.length;
    const engagementRate = ((totalLikesRecent + totalCommentsRecent) / totalViewsRecent) * 100;
    const firstDate = new Date(videos[videos.length - 1].snippet.publishedAt).getTime();
    const lastDate = new Date(videos[0].snippet.publishedAt).getTime();
    const daysDiff = Math.max(1, (lastDate - firstDate) / (1000 * 3600 * 24));
    const uploadsPerDay = videos.length / daysDiff;
    const estimatedMonthlyViews = avgViews * uploadsPerDay * 30;
    const revMin = (estimatedMonthlyViews / 1000) * 1500;
    const revMax = (estimatedMonthlyViews / 1000) * 4500;
    return { avgViews, engagementRate, estimatedMonthlyViews, revMin, revMax, uploadsPerMonth: uploadsPerDay * 30 };
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

  return (
    <div className="space-y-12">
      {/* API 키 안내 가이드 - 신뢰 중심 */}
      {!hasUserKey && (
        <div className="bg-emerald-50 dark:bg-emerald-600/5 border border-emerald-100 dark:border-emerald-900/20 p-4 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="text-emerald-600 shrink-0" size={24} />
            <div className="text-sm">
              <p className="font-black text-emerald-600">무제한 분석 모드 (서버 전송 0% 안심 보장)</p>
              <p className="text-slate-500 font-medium">개인 API 키를 사용하면 서버 한도와 관계 없이 24시간 끊김 없는 무제한 정밀 분석이 가능합니다.</p>
            </div>
          </div>
          <Link to="/settings" className="bg-emerald-600 text-white px-6 py-2.5 rounded-2xl text-xs font-black shadow-lg shadow-emerald-600/20 hover:scale-105 transition-all flex items-center gap-2 shrink-0">
            <Lock size={14} /> 보안 설정하러 가기 <ChevronRight size={14} />
          </Link>
        </div>
      )}

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

      {isQuotaError && (
        <div className="py-20 text-center bg-white dark:bg-slate-900 border-2 border-dashed border-red-200 dark:border-red-900/30 rounded-[40px] space-y-6 px-10">
          <Info className="mx-auto text-red-600" size={64} />
          <div className="space-y-2">
            <h3 className="text-2xl font-black text-red-600">서버 무료 할당량 소진</h3>
            <p className="text-slate-500 font-bold max-w-lg mx-auto leading-relaxed">
              현재 서버의 무료 분석 할당량이 모두 소진되었습니다. <br />
              보안이 보장되는 <Link to="/settings" className="text-emerald-600 underline">설정 페이지</Link>에서 본인의 API 키를 입력하시면 대기 없이 즉시 재개됩니다.
            </p>
          </div>
        </div>
      )}

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
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard label="평균 조회수 (최근 50개)" value={analytics ? formatNumber(analytics.avgViews) : '-'} color="text-red-600" bg="bg-red-50 dark:bg-red-900/10" />
            <MetricCard label="참여율 (조회수 대비)" value={analytics ? `${analytics.engagementRate.toFixed(1)}%` : '-'} color="text-pink-600" bg="bg-pink-50 dark:bg-pink-900/10" />
            <MetricCard label="예상 월 업로드" value={analytics ? `${analytics.uploadsPerMonth.toFixed(1)}개` : '-'} color="text-emerald-600" bg="bg-emerald-50 dark:bg-emerald-900/10" />
            <MetricCard label="예상 월간 조회수" value={analytics ? formatNumber(analytics.estimatedMonthlyViews) : '-'} color="text-blue-600" bg="bg-blue-50 dark:bg-blue-900/10" />
          </div>

          <div className="bg-white dark:bg-[#1a1a1a] p-8 rounded-[40px] border dark:border-white/5 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h4 className="text-xl font-black flex items-center gap-2">
                <TrendingUp className="text-red-600" />
                최근 조회수 성과 추이
              </h4>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={videos?.slice().reverse().map((v, i) => ({ idx: i, views: parseInt(v.statistics.viewCount) }))}>
                  <defs><linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ff0000" stopOpacity={0.2}/><stop offset="95%" stopColor="#ff0000" stopOpacity={0}/></linearGradient></defs>
                  <XAxis dataKey="idx" hide />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', backgroundColor: '#1a1a1a', color: '#fff' }} labelStyle={{ display: 'none' }} />
                  <Area type="monotone" dataKey="views" stroke="#ff0000" strokeWidth={4} fill="url(#colorViews)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChannelPage;
