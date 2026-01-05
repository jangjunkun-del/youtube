
import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BarChart3, 
  Youtube, 
  Copy, 
  Settings as SettingsIcon,
  Menu,
  X
} from 'lucide-react';
import Home from './pages/Home.tsx';
import Ranking from './pages/Ranking.tsx';
import ChannelDetail from './pages/ChannelDetail.tsx';
import Compare from './pages/Compare.tsx';
import Settings from './pages/Settings.tsx';

const SidebarItem = ({ to, icon: Icon, label, active }: { to: string, icon: any, label: string, active: boolean }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
      active 
        ? 'bg-red-50 text-red-600 font-semibold shadow-sm' 
        : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900'
    }`}
  >
    <Icon size={20} />
    <span>{label}</span>
  </Link>
);

const App: React.FC = () => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Dynamic Title for SEO
  useEffect(() => {
    setIsSidebarOpen(false);
    
    const baseTitle = 'YouRank - 유튜브 채널 분석';
    let subTitle = '';

    if (location.pathname === '/') subTitle = '데이터 대시보드';
    else if (location.pathname.includes('/ranking')) subTitle = '채널 랭킹 분석';
    else if (location.pathname.includes('/channel/')) subTitle = '채널 상세 성과';
    else if (location.pathname.includes('/compare')) subTitle = '채널 지표 비교';
    else if (location.pathname.includes('/settings')) subTitle = '설정';

    document.title = subTitle ? `${subTitle} | ${baseTitle}` : baseTitle;
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      <header className="md:hidden flex items-center justify-between p-4 bg-white border-b sticky top-0 z-50">
        <div className="flex items-center gap-2 font-bold text-red-600 text-xl">
          <Youtube />
          <span>YouRank</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-slate-600">
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </header>

      <aside className={`
        fixed inset-0 z-40 md:relative md:flex flex-col w-64 bg-white border-r transition-transform duration-300 transform
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="hidden md:flex items-center gap-2 p-6 font-bold text-red-600 text-2xl border-b mb-4">
          <Youtube size={32} />
          <span>YouRank</span>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4 md:mt-0">
          <SidebarItem to="/" icon={LayoutDashboard} label="대시보드" active={location.pathname === '/'} />
          <SidebarItem to="/ranking" icon={BarChart3} label="채널 랭킹" active={location.pathname === '/ranking'} />
          <SidebarItem to="/compare" icon={Copy} label="채널 비교" active={location.pathname === '/compare'} />
          <SidebarItem to="/settings" icon={SettingsIcon} label="설정" active={location.pathname === '/settings'} />
        </nav>

        <div className="p-4 border-t text-xs text-slate-400 text-center">
          &copy; 2024 YouRank Analytics
        </div>
      </aside>

      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 md:hidden" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/ranking" element={<Ranking />} />
          <Route path="/channel/:id" element={<ChannelDetail />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
