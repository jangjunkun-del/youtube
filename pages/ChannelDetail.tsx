
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
  Info,
  Calendar
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
  if (ratio > 200) return { label: '폭발적(S+)', color: 'bg-purple-100 text-purple-700 ring-purple-200' };
  if (ratio > 100) return { label: '매우높음(S)', color: 'bg-red-100 text-red-700 ring-red-200' };
  if (ratio > 50) return { label: '우수(A)', color: 'bg-orange-100 text-orange-700 ring-orange-200' };
  if (ratio > 20) return { label: '보통(B)', color: 'bg-green-100 text-green-700 ring-green-200' };
  return { label: '정체기(C)', color: 'bg-blue-100 text-blue-700 ring-blue-200' };
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

  // Chart Data
  const chartData = videos?.slice().reverse().map(v => ({
    name: new Date(v.snippet.publishedAt).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
    views: parseInt(v.statistics.viewCount),
  })) || [];

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <Link to="/ranking" className="inline-flex items-center text-slate-500 hover:text-red-600 transition-colors gap-1 text-sm font-bold">
        <ChevronLeft size={16} /> 분석 리스트로 돌아가기
      </Link>

      {/* Header Info */}
      <div className="bg-white p-6 md:p-8 rounded-[32px] border shadow-sm flex flex-col md:flex-row gap-8 items-start relative overflow-hidden group">
        <img src={channelData.snippet.thumbnails.high.url} className="w-24 h-24 md:w-32 md:h-32 rounded-[24px] object-cover bg-slate-100 shadow-xl z-10 group-hover:rotate-2 transition-transform" alt="Channel" />
        <div className="flex-1 space-y-3 z-10">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl md:text-3xl font-black tracking-tighter text-slate-900">{channelData.snippet.title}</h1>
            <button 
              onClick={toggleFavorite}
              className={`p-2 rounded-full transition-all ${isFavorite ? 'text-yellow-500 bg-yellow-50' : 'text-slate-200 hover:text-yellow-400 bg-slate-50'}`}
            >
              <Star fill={isFavorite ? 'currentColor' : 'none'} size={24} />
            </button>
          </div>
          <p className="text-slate-500 line-clamp-2 text-sm max-w-2xl leading-relaxed">{channelData.snippet.description}</p>
          <div className="flex flex-wrap gap-2 mt-4">
             <div className="flex items-center gap-1.5 bg-slate-900 text-white px-4 py-1.5 rounded-full text-[11px] font-black shadow-lg">
               <TrendingUp size={12} className="text-red-500" />
               성장 잠재력: {getViralGrade(avgViews, subscriberCount).label}
             </div>
             <div className="flex items-center gap-1.5 bg-slate-100 px-4 py-1.5 rounded-full text-[11px] font-bold text-slate-600 border">
               <Calendar size={12} />
               생성일: {new Date(channelData.snippet.publishedAt).toLocaleDateString()}
             </div>
          </div>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard icon={Users} label="현재 구독자" value={formatNumber(subscriberCount)} color="text-blue-600" bg="bg-blue-50" />
        <MetricCard icon={PlayCircle} label="누적 조회수" value={formatNumber(channelData.statistics.viewCount)} color="text-red-600" bg="bg-red-50" />
        <MetricCard icon={DollarSign} label="예상 월 수익(최대)" value={`$${Math.round(monthlyMax).toLocaleString()}`} color="text-emerald-600" bg="bg-emerald-50" />
        <MetricCard icon={Zap} label="평균 조회 기여도" value={`${((avgViews / subscriberCount) * 100).toFixed(1)}%`} color="text-purple-600" bg="bg-purple-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Views Trend Chart */}
          <div className="bg-white p-6 md:p-8 rounded-[32px] border shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black flex items-center gap-2 tracking-tight">
                <BarChart size={20} className="text-red-500" /> 최근 콘텐츠 성과 분석
              </h3>
              <span className="text-[10px] text-slate-400 font-black bg-slate-50 px-3 py-1 rounded-full border">LAST 10 VIDEOS</span>
            </div>
            <div className="h-[300px] w-full">
              {videosLoading ? (
                <div className="h-full flex items-center justify-center"><Loader2 className="animate-spin text-slate-200" /></div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 600 }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8' }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontSize: '12px', fontWeight: 'bold' }}
                      formatter={(value: any) => [formatNumber(value), '조회수']}
                    />
                    <Area type="monotone" dataKey="views" stroke="#ef4444" strokeWidth={4} fillOpacity={1} fill="url(#colorViews)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Video List */}
          <section className="space-y-4">
            <h3 className="text-lg font-black flex items-center gap-2 tracking-tight">
              <PlayCircle size={20} className="text-red-500" /> 영상별 잠재력 등급
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {videosLoading ? (
                <div className="col-span-2 py-10 flex justify-center"><Loader2 className="animate-spin text-slate-300" /></div>
              ) : (
                videos?.map(video => {
                  const viral = getViralGrade(parseInt(video.statistics.viewCount), subscriberCount);
                  return (
                    <div key={video.id} className="bg-white p-4 rounded-[24px] border flex flex-col gap-3 hover:shadow-xl hover:-translate-y-1 transition-all group">
                      <div className="aspect-video rounded-2xl overflow-hidden relative">
                        <img src={video.snippet.thumbnails.medium.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Video" />
                        <div className={`absolute bottom-2 left-2 px-3 py-1 rounded-full text-[9px] font-black uppercase shadow-lg border-2 border-white ${viral.color}`}>
                          {viral.label}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-bold text-sm line-clamp-2 group-hover:text-red-600 transition-colors leading-snug">{video.snippet.title}</h4>
                        <div className="flex items-center justify-between mt-2 text-[10px] text-slate-400 font-bold">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-1"><PlayCircle size={10} /> {formatNumber(video.statistics.viewCount)}</span>
                            <span className="flex items-center gap-1"><Heart size={10} /> {formatNumber(video.statistics.likeCount || 0)}</span>
                          </div>
                          <span>{new Date(video.snippet.publishedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-6 rounded-[32px] shadow-2xl space-y-6 border border-white/5">
            <div className="flex items-center gap-2 font-black italic text-red-500">
              <TrendingUp size={20} />
              GROWTH PREDICTION
            </div>
            
            <div className="space-y-4">
               <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
                 <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">현재 성장 동력</p>
                 <div className="text-xl font-black text-white">
                   {Math.round((avgViews / subscriberCount) * 100)}% <span className="text-xs text-slate-500 font-medium">/ 100% (활성도)</span>
                 </div>
               </div>

               <div className="space-y-3">
                  <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                    <span className="text-xs font-bold text-slate-400">3개월 예상 구독자</span>
                    <span className="text-sm font-black text-red-500">+{formatNumber(Math.round(subscriberCount * 0.12))}명</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/5 p-3 rounded-xl border border-white/5">
                    <span className="text-xs font-bold text-slate-400">1년 예상 구독자</span>
                    <span className="text-sm font-black text-red-500">+{formatNumber(Math.round(subscriberCount * 0.55))}명</span>
                  </div>
               </div>
            </div>

            <div className="p-3 bg-red-500/10 rounded-xl text-[10px] text-red-300 leading-relaxed font-medium">
              * 위 예측치는 최근 10개 영상의 활성도를 기반으로 한 낙관적 시뮬레이션입니다. 채널의 업로드 주기와 콘텐츠 일관성에 따라 달라질 수 있습니다.
            </div>
          </div>

          <div className="bg-white p-6 rounded-[32px] border shadow-sm space-y-4">
            <div className="flex items-center gap-2 font-black text-slate-800 uppercase tracking-tighter text-sm">
              <Info size={16} className="text-blue-500" /> 분석 가이드
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">
              성장 잠재력 지수가 <strong className="text-slate-800">우수(A) 이상</strong>인 채널은 구독자 대비 높은 도달력을 가지고 있습니다. 이는 알고리즘이 해당 채널의 콘텐츠를 적극적으로 추천하고 있음을 시사합니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ icon: Icon, label, value, color, bg }: any) => (
  <div className="bg-white p-6 rounded-[28px] border shadow-sm flex flex-col gap-2 group hover:border-red-500 transition-all">
    <div className={`${bg} ${color} w-fit p-2 rounded-xl transition-transform group-hover:scale-110`}>
      <Icon size={18} />
    </div>
    <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider">{label}</p>
    <p className="text-xl font-black text-slate-900 tracking-tighter">{value}</p>
  </div>
);

export default ChannelDetail;
