
import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Link } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BarChart3, 
  Youtube, 
  Copy, 
  Settings as SettingsIcon,
  Menu,
  X,
  Moon,
  Sun,
  Mail,
  MapPin,
  Phone,
  DollarSign,
  Radio,
  Trophy,
  UserPlus,
  PlayCircle
} from 'lucide-react';
import Home from './pages/Home.tsx';
import Ranking from './pages/Ranking.tsx';
import ChannelDetail from './pages/ChannelDetail.tsx';
import Compare from './pages/Compare.tsx';
import Settings from './pages/Settings.tsx';
import SidebarItem from './components/SidebarItem.tsx';
import SidebarSection from './components/SidebarSection.tsx';

const App: React.FC = () => {
  const location = useLocation();
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
    const handleStorageChange = () => {
      setDarkMode(localStorage.getItem('theme') === 'dark');
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  useEffect(() => {
    setIsSidebarOpen(false);
    const baseTitle = 'YouRank - 유튜브 분석';
    let subTitle = '';
    if (location.pathname === '/') subTitle = '대시보드';
    else if (location.pathname.includes('/ranking')) subTitle = '채널 랭킹';
    else if (location.pathname.includes('/channel/')) subTitle = '상세 분석';
    else if (location.pathname.includes('/compare')) subTitle = '채널 비교';
    else if (location.pathname.includes('/settings')) subTitle = '설정';
    document.title = subTitle ? `${subTitle} | ${baseTitle}` : baseTitle;
  }, [location.pathname]);

  const isActiveRanking = (query: string) => {
    return location.pathname === '/ranking' && location.search.includes(encodeURIComponent(query));
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <header className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-slate-900 border-b dark:border-slate-800 sticky top-0 z-50">
        <div className="flex items-center gap-2 font-bold text-red-600 text-xl">
          <Youtube />
          <span>YouRank</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setDarkMode(!darkMode)} className="p-2 text-slate-600 dark:text-slate-400 hover:text-red-500 transition-colors">
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-600 dark:text-slate-400">
            {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      <aside className={`
        fixed inset-0 z-40 md:relative md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r dark:border-slate-800 transition-transform duration-300 transform
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="hidden md:flex items-center justify-between p-6 border-b dark:border-slate-800 mb-4">
          <div className="flex items-center gap-2 font-bold text-red-600 text-2xl">
            <Youtube size={32} />
            <span>YouRank</span>
          </div>
          <button onClick={() => setDarkMode(!darkMode)} className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4 md:mt-0 overflow-y-auto custom-scrollbar">
          <SidebarSection label="Main" />
          <SidebarItem to="/" icon={LayoutDashboard} label="대시보드" active={location.pathname === '/'} />
          
          <SidebarSection label="Analytics & Rank" />
          <SidebarItem to="/ranking" icon={BarChart3} label="전체 채널 랭킹" active={location.pathname === '/ranking' && !location.search} />
          <SidebarItem to="/ranking?q=슈퍼챗" icon={DollarSign} label="슈퍼챗 순위" active={isActiveRanking('슈퍼챗')} />
          <SidebarItem to="/ranking?q=라이브" icon={Radio} label="라이브 시청자" active={isActiveRanking('라이브')} />
          <SidebarItem to="/ranking?q=인기" icon={Trophy} label="인기 순위" active={isActiveRanking('인기')} />
          <SidebarItem to="/ranking?q=급상승" icon={UserPlus} label="구독자 급상승" active={isActiveRanking('급상승')} />
          <SidebarItem to="/ranking?q=최다조회" icon={PlayCircle} label="최다 조회 영상" active={isActiveRanking('최다조회')} />
          
          <SidebarSection label="Tools" />
          <SidebarItem to="/compare" icon={Copy} label="채널 비교" active={location.pathname === '/compare'} />
          <SidebarItem to="/settings" icon={SettingsIcon} label="설정" active={location.pathname === '/settings'} />
        </nav>

        <div className="p-4 border-t dark:border-slate-800 text-[10px] font-bold text-slate-400 text-center uppercase tracking-widest">
          Analytic Solutions
        </div>
      </aside>

      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 md:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <main className="flex-1 flex flex-col overflow-y-auto">
        <div className="flex-1 p-4 md:p-8 dark:text-slate-200">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/ranking" element={<Ranking />} />
            <Route path="/channel/:id" element={<ChannelDetail />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>

        {/* Global Footer */}
        <footer className="bg-white dark:bg-slate-900 border-t dark:border-slate-800 py-12 px-8">
          <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-4">
              <div className="flex items-center gap-2 font-bold text-red-600 text-2xl">
                <Youtube size={24} />
                <span>YouRank</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed font-medium">
                전 세계 2.3천만 유튜브 채널을 전문가용 필터로 <br className="hidden sm:block" /> 검색하고 데이터 기반으로 분석하세요.
              </p>
              <div className="flex gap-4">
                <Link to="/settings" className="text-xs font-bold text-slate-500 hover:text-red-600">서비스 이용약관</Link>
                <Link to="/settings" className="text-xs font-bold text-slate-500 hover:text-red-600">개인정보 처리방침</Link>
              </div>
            </div>

            <div className="space-y-4">
              <h5 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Contact Info</h5>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Mail size={14} className="text-red-500" />
                  <span>support@yourank.io</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Phone size={14} className="text-slate-400" />
                  <span>1668-3054 (유료)</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <MapPin size={14} className="text-slate-400" />
                  <span className="leading-tight text-xs">서울특별시 강남구 테헤란로79길 6, 5층 브이852호</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h5 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Company Info</h5>
              <div className="space-y-1 text-[11px] text-slate-400 leading-5">
                <p>회사명 : (주)디프닷 | 대표 : 왕효근</p>
                <p>사업자등록번호 : 841-86-01821</p>
                <p>통신판매업신고번호 : 제2022-서울강남-05034호</p>
                <p className="mt-4 font-black">© 2026 DIFF., Inc. All Rights Reserved</p>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default App;
