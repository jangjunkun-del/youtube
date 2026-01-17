
import React, { useState, useEffect } from 'react';
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
  MessageSquare
} from 'lucide-react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const ChannelPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryParam = searchParams.get('q') || '';
  const [input, setInput] = useState(queryParam);

  const { data: channel, isLoading: channelLoading, error: channelError } = useQuery({
    queryKey: ['channelAnalysis', queryParam],
    queryFn: () => youtubeApi.getChannelDetail(queryParam),
    enabled: !!queryParam,
  });

  const { data: videos, isLoading: videosLoading } = useQuery({
    queryKey: ['channelVideosAnalysis', channel?.contentDetails?.relatedPlaylists.uploads],
    queryFn: () => youtubeApi.getChannelVideos(channel!.contentDetails!.relatedPlaylists.uploads),
    enabled: !!channel,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) setSearchParams({ q: input.trim() });
  };

  const formatNumber = (num: string | number) => {
    const n = typeof num === 'string' ? parseInt(num) : num;
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toLocaleString();
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
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          {/* Channel Summary */}
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <img src={channel.snippet.thumbnails.high.url} className="w-32 h-32 rounded-[32px] shadow-2xl object-cover" alt="" />
            <div className="flex-1 space-y-4 pt-2">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="text-4xl font-black tracking-tight">{channel.snippet.title}</h3>
                <span className="bg-red-50 dark:bg-red-600/10 text-red-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-100 dark:border-red-900/30">Verified Analytic</span>
              </div>
              <p className="text-slate-500 dark:text-slate-400 font-medium line-clamp-2 max-w-2xl">{channel.snippet.description}</p>
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

          {/* Performance Chart */}
          <div className="bg-white dark:bg-[#1a1a1a] p-8 rounded-[40px] border dark:border-white/5 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h4 className="text-xl font-black flex items-center gap-2">
                <TrendingUp className="text-red-600" />
                최근 조회수 성과 추이
              </h4>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Recent 50 Videos</span>
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
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                      labelStyle={{ display: 'none' }}
                    />
                    <Area type="monotone" dataKey="views" stroke="#ff0000" strokeWidth={4} fill="url(#colorViews)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Video List / Analysis */}
          <div className="space-y-6">
            <h4 className="text-xl font-black px-2">영상별 상대 성과 분석 (구독자 대비 조회수)</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos?.map(video => {
                const views = parseInt(video.statistics.viewCount);
                const subs = parseInt(channel.statistics.subscriberCount);
                const perf = ((views / subs) * 100).toFixed(1);
                
                return (
                  <div key={video.id} className="bg-white dark:bg-[#1a1a1a] rounded-3xl overflow-hidden border dark:border-white/5 group hover:shadow-xl transition-all">
                    <div className="relative aspect-video">
                      <img src={video.snippet.thumbnails.medium.url} className="w-full h-full object-cover" alt="" />
                      <div className={`absolute bottom-3 left-3 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20 shadow-lg ${
                        parseFloat(perf) > 100 ? 'bg-red-600 text-white' : 'bg-black/60 text-white'
                      }`}>
                        성능 {perf}%
                      </div>
                    </div>
                    <div className="p-5 space-y-4">
                      <h5 className="font-bold text-sm line-clamp-2 h-10 group-hover:text-red-600 transition-colors">{video.snippet.title}</h5>
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

      {queryParam === '' && (
        <div className="py-32 text-center space-y-4 opacity-30">
          <Search size={80} className="mx-auto" />
          <p className="text-xl font-black uppercase tracking-widest">채널을 검색하여 분석을 시작하세요</p>
        </div>
      )}
    </div>
  );
};

export default ChannelPage;
