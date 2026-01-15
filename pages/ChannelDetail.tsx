
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { youtubeApi } from '../services/api';
import { 
  Users, PlayCircle, BarChart, Heart, Loader2, ChevronLeft, Star, Coins, TrendingUp, Zap, Info, Calendar, Youtube, RefreshCw, AlertCircle, Clock, PieChart
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const parseISO8601Duration = (duration: string) => {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
  const hours = (parseInt(match?.[1] || '0') || 0);
  const minutes = (parseInt(match?.[2] || '0') || 0);
  const seconds = (parseInt(match?.[3] || '0') || 0);
  return hours * 3600 + minutes * 60 + seconds;
};

const ChannelDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [isFavorite, setIsFavorite] = React.useState(false);

  const { data: channelData, isLoading: channelLoading } = useQuery({
    queryKey: ['channel', id],
    queryFn: () => youtubeApi.getChannelsByIds(id!).then(res => res[0]),
  });

  const { data: videos, isLoading: videosLoading } = useQuery({
    queryKey: ['channelVideos', channelData?.contentDetails?.relatedPlaylists.uploads],
    queryFn: () => youtubeApi.getChannelVideos(channelData!.contentDetails!.relatedPlaylists.uploads),
    enabled: !!channelData,
  });

  // 6. 유사 채널 추천 (채널명을 검색어로 사용)
  const { data: similarChannels } = useQuery({
    queryKey: ['similarChannels', channelData?.snippet.title],
    queryFn: () => youtubeApi.searchChannels(channelData!.snippet.title, 4),
    enabled: !!channelData,
  });

  React.useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setIsFavorite(favorites.includes(id));
  }, [id]);

  if (channelLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-red-600" size={48} /></div>;
  if (!channelData) return <div className="p-20 text-center">채널 정보 없음</div>;

  // 3. 쇼츠 vs 일반 영상 비중 분석
  const shortsCount = videos?.filter(v => parseISO8601Duration(v.contentDetails.duration) <= 60).length || 0;
  const longFormCount = (videos?.length || 0) - shortsCount;
  const shortsRatio = Math.round((shortsCount / (videos?.length || 1)) * 100);

  // 5. 업로드 주기 진단
  let frequencyLabel = "진단 중...";
  if (videos && videos.length >= 2) {
    const firstDate = new Date(videos[videos.length - 1].snippet.publishedAt).getTime();
    const lastDate = new Date(videos[0].snippet.publishedAt).getTime();
    const diffDays = (lastDate - firstDate) / (1000 * 3600 * 24);
    const avgDays = diffDays / (videos.length - 1);
    frequencyLabel = avgDays <= 2 ? "주 3~4회 이상 (매우성실)" : avgDays <= 7 ? "주 1~2회 (정기적)" : "비정기적 업로드";
  }

  const formatNumber = (num: string | number) => Number(num).toLocaleString();

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <Link to="/ranking" className="inline-flex items-center text-slate-500 gap-1 text-sm font-bold"><ChevronLeft size={16} /> 뒤로가기</Link>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border dark:border-slate-800 shadow-sm flex flex-col md:flex-row gap-8 items-start relative overflow-hidden group">
        <img src={channelData.snippet.thumbnails.high.url} className="w-32 h-32 rounded-[24px] object-cover shadow-xl z-10" alt="Channel" />
        <div className="flex-1 space-y-3 z-10">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">{channelData.snippet.title}</h1>
            <button onClick={() => {
              const favs = JSON.parse(localStorage.getItem('favorites') || '[]');
              const next = isFavorite ? favs.filter((f: any) => f !== id) : [...favs, id];
              localStorage.setItem('favorites', JSON.stringify(next));
              setIsFavorite(!isFavorite);
            }} className={`p-2 rounded-full ${isFavorite ? 'text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20' : 'text-slate-200'}`}>
              <Star fill={isFavorite ? 'currentColor' : 'none'} size={24} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
             <div className="flex items-center gap-1.5 bg-slate-900 dark:bg-red-600 text-white px-4 py-1.5 rounded-full text-[11px] font-black uppercase">
               <Clock size={12} /> {frequencyLabel}
             </div>
             <div className="flex items-center gap-1.5 bg-red-50 dark:bg-slate-800 text-red-600 dark:text-red-400 px-4 py-1.5 rounded-full text-[11px] font-black uppercase">
               <PieChart size={12} /> Shorts {shortsRatio}% 비중
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard label="현재 구독자" value={formatNumber(channelData.statistics.subscriberCount)} color="text-blue-600" bg="bg-blue-50 dark:bg-blue-900/10" />
        <MetricCard label="누적 조회수" value={formatNumber(channelData.statistics.viewCount)} color="text-red-600" bg="bg-red-50 dark:bg-red-900/10" />
        <MetricCard label="쇼츠 비중" value={`${shortsRatio}%`} color="text-purple-600" bg="bg-purple-50 dark:bg-purple-900/10" />
        <MetricCard label="업로드 주기" value={frequencyLabel.split(' ')[0]} color="text-emerald-600" bg="bg-emerald-50 dark:bg-emerald-900/10" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Analysis Graph */}
          <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border dark:border-slate-800 shadow-sm space-y-6">
            <h3 className="text-lg font-black flex items-center gap-2"><TrendingUp className="text-red-500" /> 최근 조회수 추이</h3>
            <div className="h-64 w-full">
               {videosLoading ? <div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-slate-200" /></div> : (
                 <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={videos?.slice().reverse().map(v => ({ name: '', views: parseInt(v.statistics.viewCount) }))}>
                      <defs><linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/><stop offset="95%" stopColor="#ef4444" stopOpacity={0}/></linearGradient></defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" opacity={0.5}/>
                      <XAxis hide />
                      <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }} />
                      <Area type="monotone" dataKey="views" stroke="#ef4444" strokeWidth={4} fill="url(#colorViews)" />
                    </AreaChart>
                 </ResponsiveContainer>
               )}
            </div>
          </div>

          {/* Similar Channels (Feature 6) */}
          <section className="space-y-4">
            <h3 className="text-lg font-black flex items-center gap-2"><Zap className="text-yellow-500" /> 유사한 분석 채널 추천</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {similarChannels?.filter(c => c.id !== id).map(channel => (
                <Link key={channel.id} to={`/channel/${channel.id}`} className="bg-white dark:bg-slate-900 p-4 rounded-[24px] border dark:border-slate-800 text-center space-y-2 hover:border-red-500 transition-all">
                  <img src={channel.snippet.thumbnails.default.url} className="w-12 h-12 rounded-full mx-auto" />
                  <p className="text-[11px] font-black truncate text-slate-900 dark:text-slate-200">{channel.snippet.title}</p>
                </Link>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 p-8 rounded-[32px] text-white shadow-2xl space-y-6">
            <div className="flex items-center gap-2 font-black italic text-red-500 uppercase tracking-widest text-xs">Strategy AI Info</div>
            <div className="space-y-4">
               <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                 <p className="text-[10px] text-slate-500 font-bold mb-1">채널 성격</p>
                 <p className="text-sm font-bold">{shortsRatio > 70 ? "쇼츠 집중형" : shortsRatio > 30 ? "하이브리드형" : "롱폼 정석형"}</p>
               </div>
               <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                 <p className="text-[10px] text-slate-500 font-bold mb-1">성장 활성도</p>
                 <p className="text-sm font-bold">{frequencyLabel.split(' ')[0]}</p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, color, bg }: any) => (
  <div className={`p-6 rounded-[28px] border dark:border-slate-800 shadow-sm flex flex-col gap-1 bg-white dark:bg-slate-900`}>
    <div className={`${bg} ${color} w-fit p-1.5 rounded-lg mb-2`}><BarChart size={16} /></div>
    <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider">{label}</p>
    <p className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">{value}</p>
  </div>
);

export default ChannelDetail;
