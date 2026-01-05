
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { youtubeApi } from '../services/api';
import { 
  Users, 
  PlayCircle, 
  BarChart, 
  Calendar, 
  Heart, 
  MessageSquare, 
  Loader2,
  ChevronLeft,
  Star,
  DollarSign,
  TrendingUp,
  Zap
} from 'lucide-react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const formatNumber = (num: string | number) => {
  const n = typeof num === 'string' ? parseInt(num, 10) : num;
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

  if (channelLoading) return <div className="flex justify-center p-20"><Loader2 className="animate-spin" size={48} /></div>;
  if (!channelData) return <div>채널을 찾을 수 없습니다.</div>;

  const avgViews = videos ? videos.reduce((acc, v) => acc + parseInt(v.statistics.viewCount), 0) / videos.length : 0;
  const subscriberCount = parseInt(channelData.statistics.subscriberCount);
  
  // Earnings Calculation (Based on $0.5 - $4.0 CPM)
  const monthlyMin = (avgViews * 30 * 0.5) / 1000;
  const monthlyMax = (avgViews * 30 * 4.0) / 1000;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <Link to="/ranking" className="inline-flex items-center text-slate-500 hover:text-slate-900 transition-colors gap-1 text-sm font-medium">
        <ChevronLeft size={16} /> 랭킹으로 돌아가기
      </Link>

      {/* Header Card */}
      <div className="bg-white p-6 md:p-8 rounded-[32px] border shadow-sm flex flex-col md:flex-row gap-8 items-start relative overflow-hidden">
        <img src={channelData.snippet.thumbnails.high.url} className="w-24 h-24 md:w-32 md:h-32 rounded-[24px] object-cover bg-slate-100 shadow-xl z-10" />
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
             <div className="flex items-center gap-1.5 bg-slate-900 text-white px-3 py-1.5 rounded-full text-xs font-bold">
               <Zap size={12} fill="currentColor" />
               Viral Level: {getViralGrade(avgViews, subscriberCount).label}
             </div>
             <span className="bg-slate-100 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-600 border">ID: {channelData.id}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <MetricCard icon={Users} label="구독자" value={formatNumber(subscriberCount)} color="text-blue-600" bg="bg-blue-50" />
        <MetricCard icon={PlayCircle} label="전체 조회수" value={formatNumber(channelData.statistics.viewCount)} color="text-red-600" bg="bg-red-50" />
        <MetricCard icon={TrendingUp} label="예상 월 수익" value={`$${Math.round(monthlyMin)} - $${Math.round(monthlyMax)}`} color="text-emerald-600" bg="bg-emerald-50" />
        <MetricCard icon={Zap} label="바이럴 지수" value={`${((avgViews / subscriberCount) * 100).toFixed(1)}%`} color="text-purple-600" bg="bg-purple-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Recent Videos with Viral Score */}
          <section className="space-y-4">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <BarChart size={20} className="text-red-500" /> 최근 업로드 & 퍼포먼스
            </h3>
            <div className="space-y-3">
              {videosLoading ? (
                <div className="py-10 flex justify-center"><Loader2 className="animate-spin text-slate-300" /></div>
              ) : (
                videos?.map(video => {
                  const viral = getViralGrade(parseInt(video.statistics.viewCount), subscriberCount);
                  return (
                    <div key={video.id} className="bg-white p-4 rounded-2xl border flex gap-4 hover:shadow-md transition-all group items-center">
                      <div className="w-32 aspect-video rounded-xl overflow-hidden flex-shrink-0 relative">
                        <img src={video.snippet.thumbnails.medium.url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                        <div className={`absolute top-1 left-1 px-2 py-0.5 rounded-lg text-[10px] font-black ring-1 uppercase ${viral.color}`}>
                          {viral.label}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-sm truncate group-hover:text-red-600 transition-colors">{video.snippet.title}</h4>
                        <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                          <span className="flex items-center gap-1"><PlayCircle size={14} /> {formatNumber(video.statistics.viewCount)}</span>
                          <span className="flex items-center gap-1"><Heart size={14} /> {formatNumber(video.statistics.likeCount || 0)}</span>
                          <span>{new Date(video.snippet.publishedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <a 
                        href={`https://youtube.com/watch?v=${video.id}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-2 bg-slate-50 rounded-full text-slate-400 hover:text-red-600 transition-colors"
                      >
                        <PlayCircle size={20} />
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
          {/* Earnings Calculator */}
          <div className="bg-white p-6 rounded-[32px] border shadow-sm space-y-4">
            <div className="flex items-center gap-2 font-bold">
              <div className="bg-emerald-100 text-emerald-600 p-2 rounded-lg"><DollarSign size={18} /></div>
              예상 광고 수익
            </div>
            <div className="space-y-4">
               <div>
                 <p className="text-xs text-slate-400 mb-1 font-medium uppercase tracking-widest">Monthly Estimated</p>
                 <div className="text-2xl font-black text-emerald-600 tracking-tighter">
                   ${Math.round(monthlyMin).toLocaleString()} - ${Math.round(monthlyMax).toLocaleString()}
                 </div>
               </div>
               <div className="h-2 bg-slate-100 rounded-full overflow-hidden flex">
                  <div className="h-full bg-emerald-500 w-1/3 opacity-30"></div>
                  <div className="h-full bg-emerald-500 w-1/2"></div>
               </div>
               <div className="p-3 bg-slate-50 rounded-xl text-[10px] text-slate-400 leading-relaxed">
                 이 계산은 일반적인 YouTube CPM 범위를 기준으로 합니다. 실제 수익은 국가, 시청 연령층, 광고주 입찰가에 따라 크게 달라질 수 있습니다.
               </div>
            </div>
          </div>

          {/* Growth Simulator */}
          <div className="bg-white p-6 rounded-[32px] border shadow-sm space-y-4">
            <div className="flex items-center gap-2 font-bold">
              <div className="bg-blue-100 text-blue-600 p-2 rounded-lg"><TrendingUp size={18} /></div>
              성장 예측 (Simulation)
            </div>
            <div className="space-y-3">
               <div className="flex justify-between items-center text-sm p-3 bg-blue-50/50 rounded-2xl">
                 <span className="text-slate-500">6개월 뒤 예측</span>
                 <span className="font-bold text-blue-700">+{formatNumber(Math.round(subscriberCount * 0.15))}명</span>
               </div>
               <div className="flex justify-between items-center text-sm p-3 bg-blue-50/50 rounded-2xl">
                 <span className="text-slate-500">1년 뒤 예측</span>
                 <span className="font-bold text-blue-700">+{formatNumber(Math.round(subscriberCount * 0.35))}명</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ icon: Icon, label, value, color, bg }: any) => (
  <div className="bg-white p-5 rounded-2xl border shadow-sm flex flex-col gap-2 group hover:border-red-100 transition-colors">
    <div className={`${bg} ${color} w-fit p-2 rounded-lg transition-transform group-hover:scale-110`}>
      <Icon size={18} />
    </div>
    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.1em]">{label}</p>
    <p className="text-xl font-extrabold text-slate-900 tracking-tight">{value}</p>
  </div>
);

export default ChannelDetail;
