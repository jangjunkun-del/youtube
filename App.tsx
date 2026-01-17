
import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Link, useNavigate } from 'react-router-dom';
import { 
  Home as HomeIcon, 
  Search, 
  BarChart3, 
  Image as ImageIcon, 
  Trophy, 
  Zap, 
  BookOpen, 
  Menu, 
  X, 
  Moon, 
  Sun,
  Youtube,
  Play,
  TrendingUp,
  Layout
} from 'lucide-react';

// Lazy loading or direct imports for new pages
import HomePage from './pages/HomePage.tsx';
import ChannelPage from './pages/ChannelPage.tsx';
import ViewsPage from './pages/ViewsPage.tsx';
import ThumbnailPage from './pages/ThumbnailPage.tsx';
import RankingPage from './pages/RankingPage.tsx';
import SuccessVideosPage from './pages/SuccessVideosPage.tsx';
import GuidePage from './pages/GuidePage.tsx';

const App: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');

  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    setIsSidebarOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const navItems = [
    { to: '/', icon: HomeIcon, label: '홈' },
    { to: '/channel', icon: Search, label: '채널 분석' },
    { to: '/views', icon: BarChart3, label: '조회수 분석' },
    { to: '/thumbnail', icon: ImageIcon, label: '썸네일 분석' },
    { to: '/ranking', icon: Trophy, label: '성능 랭킹' },
    { to: '/success-videos', icon: Zap, label: '성공 영상' },
    { to: '/guide', icon: BookOpen, label: '성장 가이드' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#0f0f0f] transition-colors duration-300">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-white dark:bg-[#0f0f0f]/95 backdrop-blur-md border-b dark:border-white/10 px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full md:hidden"
          >
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <Link to="/" className="flex items-center gap-1.5 group">
            <div className="bg-red-600 p-1.5 rounded-lg group-hover:scale-110 transition-transform">
              <Play className="text-white fill-current" size={18} />
            </div>
            <h1 className="text-xl font-black tracking-tighter">유튜브분석툴</h1>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className={`px-4 py-2 text-sm font-bold rounded-full transition-all ${
                location.pathname === item.to 
                ? 'bg-red-600 text-white' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10'
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setDarkMode(!darkMode)}
            className="p-2.5 hover:bg-slate-100 dark:hover:bg-white/10 rounded-full transition-colors"
          >
            {darkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-slate-600" />}
          </button>
        </div>
      </header>

      {/* Mobile Sidebar */}
      <div className={`
        fixed inset-0 z-[60] md:hidden transition-transform duration-300
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
        <aside className="relative w-72 h-full bg-white dark:bg-[#0f0f0f] p-6 flex flex-col gap-8 shadow-2xl">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-red-600 p-1.5 rounded-lg"><Play className="text-white fill-current" size={18} /></div>
              <span className="text-xl font-black">유튜브분석툴</span>
            </Link>
            <button onClick={() => setIsSidebarOpen(false)}><X size={24} /></button>
          </div>
          <nav className="flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-base font-bold transition-all ${
                  location.pathname === item.to 
                  ? 'bg-red-50 dark:bg-red-600/10 text-red-600' 
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-white/5'
                }`}
              >
                <item.icon size={20} />
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>
      </div>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/channel" element={<ChannelPage />} />
          <Route path="/views" element={<ViewsPage />} />
          <Route path="/thumbnail" element={<ThumbnailPage />} />
          <Route path="/ranking" element={<RankingPage />} />
          <Route path="/success-videos" element={<SuccessVideosPage />} />
          <Route path="/guide" element={<GuidePage />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="bg-slate-50 dark:bg-black/40 border-t dark:border-white/5 py-16 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="col-span-1 md:col-span-2 space-y-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-red-600 p-1.5 rounded-lg"><Play className="text-white fill-current" size={18} /></div>
              <span className="text-2xl font-black">유튜브분석툴</span>
            </Link>
            <p className="text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-md">
              유튜브분석툴은 구독자 대비 조회수가 잘 나오는 영상을 분석하여 썸네일 성과와 유튜브 트렌드를 알려주는 전문가용 유튜브 데이터 분석 플랫폼입니다.
            </p>
            <div className="flex gap-4">
              {['유튜브조회수분석', '유튜브썸네일분석', '유튜브성공영상'].map(tag => (
                <span key={tag} className="text-[11px] font-bold text-slate-400 border dark:border-white/10 px-2 py-1 rounded">#{tag}</span>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-black mb-6 uppercase tracking-widest text-slate-400">Quick Links</h4>
            <ul className="space-y-4">
              {navItems.map(item => (
                <li key={item.to}>
                  <Link to={item.to} className="text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-red-600 transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-black mb-6 uppercase tracking-widest text-slate-400">Company</h4>
            <p className="text-xs text-slate-500 leading-6">
              (주)유튜브분석툴 | 대표: 데이터왕 <br />
              사업자등록번호: 123-45-67890 <br />
              통신판매업: 제2024-서울강남-0000호 <br />
              이메일: hello@tubetool.kr
            </p>
            <p className="mt-8 text-[10px] font-black text-slate-400">© 2024 유튜브분석툴. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
