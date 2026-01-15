
import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BarChart3, 
  Youtube, 
  Copy, 
  Settings as SettingsIcon,
  Menu,
  X,
  Moon,
  Sun
} from 'lucide-react';
import Home from './pages/Home.tsx';
import Ranking from './pages/Ranking.tsx';
import ChannelDetail from './pages/ChannelDetail.tsx';
import Compare from './pages/Compare.tsx';
import Settings from './pages/Settings.tsx';
import SidebarItem from './components/SidebarItem.tsx';

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

        <nav className="flex-1 px-4 space-y-2 mt-4 md:mt-0">
          <SidebarItem to="/" icon={LayoutDashboard} label="대시보드" active={location.pathname === '/'} />
          <SidebarItem to="/ranking" icon={BarChart3} label="채널 랭킹" active={location.pathname === '/ranking'} />
          <SidebarItem to="/compare" icon={Copy} label="채널 비교" active={location.pathname === '/compare'} />
          <SidebarItem to="/settings" icon={SettingsIcon} label="설정" active={location.pathname === '/settings'} />
        </nav>

        <div className="p-4 border-t dark:border-slate-800 text-xs text-slate-400 text-center">
          &copy; 2024 YouRank Analytics
        </div>
      </aside>

      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 md:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      <main className="flex-1 overflow-y-auto p-4 md:p-8 dark:text-slate-200">
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
