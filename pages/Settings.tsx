
import React, { useEffect } from 'react';
import { Trash2, Info, Moon, Sun } from 'lucide-react';
import InfoRow from '../components/InfoRow.tsx';

const Settings: React.FC = () => {
  const [darkMode, setDarkMode] = React.useState(() => localStorage.getItem('theme') === 'dark');

  const toggleDarkMode = () => {
    const next = !darkMode;
    setDarkMode(next);
    const root = window.document.documentElement;
    if (next) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    window.dispatchEvent(new Event('storage'));
  };

  useEffect(() => {
    const handleStorageChange = () => {
      setDarkMode(localStorage.getItem('theme') === 'dark');
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const clearStorage = () => {
    if (confirm('저장된 모든 즐겨찾기 데이터를 삭제하시겠습니까?')) {
      localStorage.removeItem('favorites');
      window.location.reload();
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">설정</h1>
        <p className="text-slate-500 text-sm">앱 환경을 관리하고 서비스 정보를 확인합니다.</p>
      </header>

      <div className="space-y-4">
        <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
              {darkMode ? <Moon size={18} className="text-blue-500" /> : <Sun size={18} className="text-yellow-500" />}
              <span>다크 모드</span>
            </div>
            <button 
              onClick={toggleDarkMode}
              className={`w-12 h-6 rounded-full transition-colors relative ${darkMode ? 'bg-red-600' : 'bg-slate-200'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${darkMode ? 'left-7' : 'left-1'}`}></div>
            </button>
          </div>
          <p className="text-xs text-slate-500 font-medium leading-relaxed">눈의 피로를 줄이기 위해 다크 모드를 지원합니다.</p>
        </section>

        <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
            <Trash2 size={18} className="text-red-500" />
            <span>데이터 초기화</span>
          </div>
          <button onClick={clearStorage} className="w-full py-3 bg-red-50 dark:bg-red-900/10 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors text-sm">
            즐겨찾기 목록 비우기
          </button>
        </section>

        <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
            <Info size={18} className="text-blue-500" />
            <span>서비스 정보</span>
          </div>
          <div className="space-y-3">
            <InfoRow label="버전" value="v1.1.0 (Advanced)" />
            <InfoRow label="데이터 출처" value="YouTube Data API v3" />
            <InfoRow label="주요 기능" value="AI 떡상 예보, 쇼츠 분석" />
          </div>
        </section>
      </div>
    </div>
  );
};

export default Settings;
