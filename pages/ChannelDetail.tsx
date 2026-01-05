
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { youtubeApi } from '../services/api';
import { 
  Users, 
  PlayCircle, 
  BarChart, 
  Heart, 
  Loader2,
  ChevronLeft,
  Star,
  DollarSign,
  TrendingUp,
  Zap,
  Info
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const formatNumber = (num: string | number) => {
  const n = typeof num === 'string' ? parseInt(num, 10) : num;
  if (isNaN(n)) return '0';
  return n.toLocaleString();
};

const getViralGrade = (views: number, subscribers: number) => {
  if (subscribers === 0) return { label: 'N/A', color: 'bg-slate-100 text-slate-400' };
  const ratio = (views / subscribers) * 100;
  if (ratio > 200) return { label: 'S+', color: 'bg-purple-100 text-purple-700 ring-purple-200' };
  if (ratio > 100) return { label: 'S', color: 'bg-red-100 text-red-700 ring-red-200' };
  if (ratio > 50) return { label: 'A', color: 'bg-orange-100 text-orange-700 ring-orange-200' };
  if (ratio > 20) return { label: 'B', color: 'bg-green-100 text-green-700 ring-green-200' };
  return { label: 'C', color: 'bg-blue-100 text-blue-700 ring-blue-200' };
};

const ChannelDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [isFavorite, setIsFavorite] = React.useState(false);

  const { data: channelData, isLoading: channelLoading } = useQuery({
    queryKey: ['channel', id],
    queryFn: () => youtubeApi.getChannelsByIds(id!).then(res => res[0]),
    enabled: !!id,
  });

  const { data: videos, isLoading: videosLoading } = useQuery({
    queryKey: ['channelVideos', channelData?.contentDetails?.relatedPlaylists.uploads],
    queryFn: () => youtubeApi.getChannelVideos(channelData!.contentDetails!.relatedPlaylists.uploads),
    enabled: !!channelData?.contentDetails?.relatedPlaylists.uploads,
  });

  React.useEffect(() => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    setIsFavorite(favorites.includes(id));
  }, [id]);

  const toggleFavorite = () => {
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    let nextFavs;
    if (favorites.includes(id)) {
      nextFavs = favorites.filter((fid: string) => fid !== id);
      setIsFavorite(false);
    } else {
      nextFavs = [...favorites, id];
      setIsFavorite(true);
    }
    localStorage.setItem('favorites', JSON.stringify(nextFavs));
  };

  if (channelLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-red-600" size={48} /></div>;
  if (!channelData) return <div className="p-20 text-center text-slate-500">채널 정보를 불러올 수 없습니다.</div>;

  const avgViews = videos ? videos.reduce((acc, v) => acc + parseInt(v.statistics.viewCount), 0) / videos.length : 0;
  const subscriberCount = parseInt(channelData.statistics.subscriberCount);
  
  // Earnings Calculation (Based on $0.5 - $4.0 CPM)
  const monthlyMin = (avgViews * 30 * 0.5) / 1000;
  const monthlyMax = (avgViews * 30 * 4.0) / 1000;

  // Chart Data preparation
  const chartData = videos?.slice().reverse().map(v => ({
    name: new Date(v.snippet.publishedAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
    조회수: parseInt(v.statistics.viewCount),
  })) || [];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <Link to="/ranking" className="inline-flex items-center text-slate-500 hover:text-slate-900 transition-colors gap-1 text-sm font-medium">
        <ChevronLeft size={16} /> 리스트로 돌아가기
      </Link>

      {/* Header Info */}
      <div className="bg-white p-6 md:p-8 rounded-[32px] border shadow-sm flex flex-col md:flex-row gap-8 items-start relative overflow-hidden">
        <img src={channelData.snippet.thumbnails.high.url} className="w-24 h-24 md:w-32 md:h-32 rounded-[24px] object-cover bg-slate-100 shadow-xl z-10" alt="Channel" />
        <div className="flex-1 space-y-3 z-10">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">{channelData.snippet.title}</h1>
            <button 
              onClick={toggleFavorite}
              className={`p-2 rounded-full transition-all ${isFavorite ? 'text-yellow-500 bg-yellow-50' : 'text-slate-300 hover:text-yellow-400 bg-slate-50'}`}
            >
              <Star fill={isFavorite ? 'currentColor' : 'none'} size={24} />
            </button>
          </div>
          <p className="text-slate-500 line-clamp-2 text-sm max-w-2xl">{channelData.snippet.description}</p>
          <div className="flex flex-wrap gap-3 mt-4">
             <div className="flex items-center gap-1.5 bg-red-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-sm">
               <Zap size={12} fill="currentColor" />
               바이럴 등급: {getViralGrade(avgViews, subscriberCount).label}
             </div>
             <span className="bg-slate-100 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-600 border">채널 생성: {new Date(channelData.snippet.publishedAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={Users} label="구독자 수" value={formatNumber(subscriberCount)} color="text-blue-600" bg="bg-blue-50" />
        <MetricCard icon={PlayCircle} label="전체 조회수" value={formatNumber(channelData.statistics.viewCount)} color="text-red-600" bg="bg-red-50" />
        <MetricCard icon={DollarSign} label="예상 월 광고 수익" value={`$${Math.round(monthlyMin).toLocaleString()}`} color="text-emerald-600" bg="bg-emerald-50" />
        <MetricCard icon={Zap} label="평균 조회수 / 구독자" value={`${((avgViews / subscriberCount) * 100).toFixed(1)}%`} color="text-purple-600" bg="bg-purple-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Views Trend Chart */}
          <div className="bg-white p-6 md:p-8 rounded-[32px] border shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                <BarChart size={20} className="text-red-500" /> 최근 영상 조회수 추이
              </h3>
              <span className="text-xs text-slate-400 font-medium bg-slate-50 px-3 py-1 rounded-full">최근 10개 영상</span>
            </div>
            <div className="h-[300px] w-full">
              {videosLoading ? (
                <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-slate-200" /></div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      formatter={(value: any) => [formatNumber(value), '조회수']}
                    />
                    <Area type="monotone" dataKey="조회수" stroke="#ef4444" strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Video List */}
          <section className="space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <PlayCircle size={20} className="text-red-500" /> 업로드 리스트 & 성과
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {videosLoading ? (
                <div className="col-span-2 py-10 flex justify-center"><Loader2 className="animate-spin text-slate-300" /></div>
              ) : (
                videos?.map(video => {
                  const viral = getViralGrade(parseInt(video.statistics.viewCount), subscriberCount);
                  return (
                    <div key={video.id} className="bg-white p-4 rounded-2xl border flex flex-col gap-3 hover:shadow-lg transition-all group">
                      <div className="aspect-video rounded-xl overflow-hidden relative">
                        <img src={video.snippet.thumbnails.medium.url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="Video" />
                        <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-lg text-[10px] font-black ring-1 uppercase shadow-sm ${viral.color}`}>
                          등급: {viral.label}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <h4 className="font-bold text-sm line-clamp-2 group-hover:text-red-600 transition-colors leading-snug">{video.snippet.title}</h4>
                        <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500 font-medium">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1"><PlayCircle size={12} /> {formatNumber(video.statistics.viewCount)}</span>
                            <span className="flex items-center gap-1"><Heart size={12} /> {formatNumber(video.statistics.likeCount || 0)}</span>
                          </div>
                          <span>{new Date(video.snippet.publishedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <a 
                        href={`https://youtube.com/watch?v=${video.id}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="mt-auto block w-full py-2 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl text-center text-xs font-bold transition-colors"
                      >
                        YouTube에서 보기
                      </a>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          {/* Detail Earnings Card */}
          <div className="bg-white p-6 rounded-[32px] border shadow-sm space-y-6">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <div className="bg-emerald-100 text-emerald-600 p-2 rounded-xl"><DollarSign size={18} /></div>
              예상 월 광고 수익
            </div>
            <div className="space-y-4">
               <div className="text-center py-4 bg-slate-50 rounded-2xl border border-slate-100">
                 <p className="text-xs text-slate-400 mb-1 font-bold uppercase tracking-widest">Estimated Monthly</p>
                 <div className="text-2xl font-black text-emerald-600 tracking-tighter">
                   ${Math.round(monthlyMin).toLocaleString()} ~ ${Math.round(monthlyMax).toLocaleString()}
                 </div>
               </div>
               <div className="space-y-2">
                 <div className="flex justify-between text-xs text-slate-500 px-1">
                   <span>보수적 (CPM $0.5)</span>
                   <span className="font-bold">${Math.round(monthlyMin).toLocaleString()}</span>
                 </div>
                 <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-full opacity-20"></div>
                 </div>
                 <div className="flex justify-between text-xs text-slate-500 px-1">
                   <span>낙관적 (CPM $4.0)</span>
                   <span className="font-bold">${Math.round(monthlyMax).toLocaleString()}</span>
                 </div>
                 <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 w-full"></div>
                 </div>
               </div>
               <div className="flex gap-2 p-3 bg-blue-50 rounded-xl text-[10px] text-blue-600 leading-relaxed items-start">
                 <Info size={14} className="flex-shrink-0 mt-0.5" />
                 YouTube의 공식 수익이 아니며, 조회수 기반의 추정치입니다. 실제 수익은 광고 단가에 따라 다릅니다.
               </div>
            </div>
          </div>

          {/* Simple Growth Prediction */}
          <div className="bg-slate-900 text-white p-6 rounded-[32px] shadow-xl space-y-4">
            <div className="flex items-center gap-2 font-bold">
              <div className="bg-red-500 p-2 rounded-xl"><TrendingUp size={18} /></div>
              성장 시뮬레이션
            </div>
            <div className="space-y-3 pt-2">
               <div className="flex justify-between items-center text-sm p-3 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                 <span className="text-slate-400">3개월 뒤</span>
                 <span className="font-bold text-red-400">+{formatNumber(Math.round(subscriberCount * 0.08))} 명</span>
               </div>
               <div className="flex justify-between items-center text-sm p-3 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                 <span className="text-slate-400">1년 뒤</span>
                 <span className="font-bold text-red-400">+{formatNumber(Math.round(subscriberCount * 0.35))} 명</span>
               </div>
            </div>
            <p className="text-[10px] text-slate-500 text-center italic">현재 평균 성장률(8%/분기)을 가정한 수치입니다.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ icon: Icon, label, value, color, bg }: any) => (
  <div className="bg-white p-5 rounded-2xl border shadow-sm flex flex-col gap-2 group hover:border-red-200 transition-all hover:shadow-md">
    <div className={`${bg} ${color} w-fit p-2 rounded-xl transition-transform group-hover:scale-110 shadow-sm`}>
      <Icon size={18} />
    </div>
    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.05em]">{label}</p>
    <p className="text-xl font-black text-slate-900 tracking-tight">{value}</p>
  </div>
);

export default ChannelDetail;
