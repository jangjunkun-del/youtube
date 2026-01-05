
import React, { useState } from 'react';
import { Search, TrendingUp, Users, PlayCircle, Star } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';

const Home: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/ranking?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <section className="text-center py-12 space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          데이터로 증명하는 <span className="text-red-600">유튜브 랭킹</span>
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
          관심 있는 키워드로 채널을 찾고, 경쟁사 분석과 성장 지표를 한눈에 확인하세요.
        </p>
        
        <form onSubmit={handleSearch} className="relative max-w-xl mx-auto mt-8">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="채널 이름 또는 키워드를 입력하세요..."
            className="w-full pl-12 pr-4 py-4 rounded-2xl border-none shadow-xl ring-1 ring-slate-200 focus:ring-2 focus:ring-red-500 transition-all outline-none"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <button 
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-red-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-red-700 transition-colors"
          >
            검색
          </button>
        </form>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-4">
          <div className="bg-red-50 p-3 rounded-xl text-red-600">
            <Users />
          </div>
          <div>
            <p className="text-sm text-slate-500">실시간 순위 분석</p>
            <p className="font-bold text-xl">키워드 기반</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-4">
          <div className="bg-blue-50 p-3 rounded-xl text-blue-600">
            <TrendingUp />
          </div>
          <div>
            <p className="text-sm text-slate-500">성장 가능성 측정</p>
            <p className="font-bold text-xl">조회수 가중치</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border shadow-sm flex items-center gap-4">
          <div className="bg-green-50 p-3 rounded-xl text-green-600">
            <PlayCircle />
          </div>
          <div>
            <p className="text-sm text-slate-500">채널 경쟁력 비교</p>
            <p className="font-bold text-xl">최대 5개 채널</p>
          </div>
        </div>
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Star className="text-yellow-400 fill-yellow-400" /> 즐겨찾는 채널
          </h2>
        </div>
        {favorites.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center">
            <p className="text-slate-400">아직 즐겨찾는 채널이 없습니다. 검색을 통해 채널을 추가해 보세요!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Added Link import fix */}
            {favorites.map((id: string) => (
              <Link 
                key={id} 
                to={`/channel/${id}`}
                className="bg-white p-4 rounded-xl border shadow-sm hover:shadow-md transition-shadow block"
              >
                <p className="text-slate-600 font-medium truncate">채널 ID: {id}</p>
                <p className="text-xs text-slate-400 mt-1">상세 분석 보기 &rarr;</p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
