
import React, { useEffect, useState } from 'react';
import { Trash2, Info, Moon, Sun, Globe, Key, ShieldCheck, ExternalLink, Lock, EyeOff, mousePointer2 as ClickIcon, Layers, CreditCard } from 'lucide-react';
import InfoRow from '../components/InfoRow.tsx';

const Settings: React.FC = () => {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [userKey, setUserKey] = useState(() => localStorage.getItem('user_youtube_api_key') || '');
  const [isSaved, setIsSaved] = useState(false);

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
  };

  const saveApiKey = () => {
    if (userKey.trim()) {
      localStorage.setItem('user_youtube_api_key', userKey.trim());
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } else {
      localStorage.removeItem('user_youtube_api_key');
      alert('키가 제거되었습니다. 이제 서버 할당량을 사용합니다.');
    }
  };

  const clearStorage = () => {
    if (confirm('저장된 모든 즐겨찾기 데이터를 삭제하시겠습니까?')) {
      localStorage.removeItem('favorites');
      window.location.reload();
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-8 animate-in fade-in duration-500">
      <header className="space-y-1">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">설정</h1>
        <p className="text-slate-500 text-sm font-medium">서비스 이용 환경과 API 설정을 관리합니다.</p>
      </header>

      <div className="space-y-4">
        {/* API 키 설정 및 발급 가이드 */}
        <section className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border-2 border-emerald-500/20 shadow-xl space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <ShieldCheck size={100} className="text-emerald-500" />
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-black text-emerald-600">
              <Lock size={20} />
              <span>YouTube Data API 개인 키 등록</span>
            </div>
            
            <div className="bg-emerald-50 dark:bg-emerald-900/10 p-5 rounded-2xl border border-emerald-100 dark:border-emerald-900/30 space-y-4">
              <div className="flex items-center gap-2 text-xs font-black text-emerald-700 dark:text-emerald-400">
                <EyeOff size={14} />
                <span>기술적 보안: 키는 본인 브라우저에만 저장되며 서버는 접근할 수 없습니다.</span>
              </div>
            </div>
          </div>

          {/* 비주얼 가이드 단계 추가 */}
          <div className="space-y-4">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">무료 API 키 발급 가이드 (1분 소요)</h4>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border dark:border-white/5">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-black shrink-0 shadow-lg shadow-emerald-500/20">1</div>
                <div className="text-xs font-bold leading-relaxed">
                  <a href="https://console.cloud.google.com/" target="_blank" className="text-emerald-600 underline">Google Cloud Console</a> 접속 후 새 프로젝트를 생성합니다.
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border dark:border-white/5">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-black shrink-0 shadow-lg shadow-emerald-500/20">2</div>
                <div className="text-xs font-bold leading-relaxed">
                  [API 및 서비스] -> [라이브러리]에서 <span className="text-red-600">YouTube Data API v3</span>를 찾아 '사용' 버튼을 클릭합니다.
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border dark:border-white/5">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-black shrink-0 shadow-lg shadow-emerald-500/20">3</div>
                <div className="text-xs font-bold leading-relaxed">
                  [사용자 인증 정보] 탭에서 'API 키 만들기'를 클릭하여 생성된 키를 아래에 복사+붙여넣기 하세요.
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t dark:border-white/5">
            <div className="relative">
              <input 
                type="password"
                value={userKey}
                onChange={(e) => setUserKey(e.target.value)}
                placeholder="AIzaSy... 로 시작하는 키를 입력하세요"
                className="w-full p-4 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-mono outline-none focus:border-emerald-500 transition-all"
              />
              <button 
                onClick={saveApiKey}
                className={`absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 rounded-xl text-xs font-black transition-all ${
                  isSaved ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white hover:bg-emerald-600'
                }`}
              >
                {isSaved ? '보안 저장 완료' : '키 안전하게 저장'}
              </button>
            </div>
          </div>
        </section>

        {/* 테마 설정 */}
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
        </section>

        {/* 데이터 관리 */}
        <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
            <Trash2 size={18} className="text-red-500" />
            <span>데이터 초기화</span>
          </div>
          <button onClick={clearStorage} className="w-full py-3 bg-red-50 dark:bg-red-900/10 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors text-sm">
            즐겨찾기 및 모든 로컬 데이터 비우기
          </button>
        </section>

        {/* 서비스 정보 */}
        <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
            <Info size={18} className="text-blue-500" />
            <span>서비스 정보</span>
          </div>
          <div className="space-y-3">
            <InfoRow label="버전" value="v1.3.3 (Visual Guide Update)" />
            <InfoRow label="데이터 출처" value="YouTube Data API v3" />
            <InfoRow label="보안 설계" value="Client-Side Direct P2P API Call" />
          </div>
        </section>
      </div>
    </div>
  );
};

export default Settings;
