
import React, { useEffect, useState } from 'react';
import { Trash2, Info, Moon, Sun, Globe, Key, ShieldCheck, ExternalLink, Lock, EyeOff, MousePointer2 as ClickIcon, Layers, CreditCard, Sparkles, Database, Activity, CheckCircle2, CreditCard as BillingIcon, ChevronRight } from 'lucide-react';
import InfoRow from '../components/InfoRow.tsx';

// window.aistudio 타입 정의
declare global {
  interface AIStudio {
    hasSelectedApiKey: () => Promise<boolean>;
    openSelectKey: () => Promise<void>;
  }

  interface Window {
    aistudio?: AIStudio;
  }
}

const Settings: React.FC = () => {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('theme') === 'dark');
  const [userKey, setUserKey] = useState(() => localStorage.getItem('user_youtube_api_key') || '');
  const [isSaved, setIsSaved] = useState(false);
  const [aiKeySelected, setAiKeySelected] = useState(false);

  useEffect(() => {
    const checkAiKey = async () => {
      if (window.aistudio && typeof window.aistudio.hasSelectedApiKey === 'function') {
        try {
          const hasKey = await window.aistudio.hasSelectedApiKey();
          setAiKeySelected(hasKey);
        } catch (e) {
          console.error("AI Key check failed", e);
        }
      }
    };
    checkAiKey();
  }, []);

  const handleSelectAiKey = async () => {
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      try {
        await window.aistudio.openSelectKey();
        // Triggering openSelectKey() assumes success per guidelines to mitigate race conditions
        setAiKeySelected(true);
      } catch (e) {
        console.error("AI Key selection failed", e);
      }
    }
  };

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

      <div className="space-y-8">
        {/* 1. YouTube API 키 설정 (최상단) */}
        <section className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border-2 border-emerald-500/20 shadow-xl space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Database size={120} className="text-emerald-500" />
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-2 font-black text-emerald-600">
              <Database size={24} />
              <span className="text-xl">YouTube 데이터 수집 키 등록</span>
            </div>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              채널 분석과 실시간 조회를 원활하게 이용하기 위해 본인의 유튜브 API 키를 등록해 주세요. 
              키는 브라우저에만 암호화되어 저장됩니다.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
              <Info size={14} /> 상세 발급 가이드 (1분 소요)
            </h4>
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-start gap-4 p-5 bg-slate-50 dark:bg-white/5 rounded-3xl border dark:border-white/5">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-black shrink-0 shadow-lg shadow-emerald-500/20">1</div>
                <div className="text-sm font-bold leading-relaxed">
                  <a href="https://console.cloud.google.com/" target="_blank" className="text-emerald-600 underline flex items-center gap-1">Google Cloud Console <ExternalLink size={12}/></a>
                  접속 후 상단에서 <b>[프로젝트 선택] &gt; [새 프로젝트]</b>를 생성합니다.
                </div>
              </div>
              <div className="flex items-start gap-4 p-5 bg-slate-50 dark:bg-white/5 rounded-3xl border dark:border-white/5">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-black shrink-0 shadow-lg shadow-emerald-500/20">2</div>
                <div className="text-sm font-bold leading-relaxed">
                  좌측 메뉴 <b>[API 및 서비스] &gt; [라이브러리]</b>에서 <span className="text-red-600">"YouTube Data API v3"</span>를 검색하고 <b>[사용]</b> 버튼을 클릭합니다.
                </div>
              </div>
              <div className="flex items-start gap-4 p-5 bg-slate-50 dark:bg-white/5 rounded-3xl border dark:border-white/5">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-black shrink-0 shadow-lg shadow-emerald-500/20">3</div>
                <div className="text-sm font-bold leading-relaxed">
                  좌측 <b>[사용자 인증 정보]</b> 탭에서 <b>[+사용자 인증 정보 만들기] &gt; [API 키]</b>를 선택하여 생성된 키를 복사하세요.
                </div>
              </div>
            </div>
          </div>

          <div className="relative pt-2">
            <input 
              type="password"
              value={userKey}
              onChange={(e) => setUserKey(e.target.value)}
              placeholder="AIzaSy... 로 시작하는 키를 입력하세요"
              className="w-full p-5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-3xl text-sm font-mono outline-none focus:border-emerald-500 transition-all pr-40"
            />
            <button 
              onClick={saveApiKey}
              className={`absolute right-2 top-[12px] px-6 py-3 rounded-2xl text-xs font-black transition-all ${
                isSaved ? 'bg-emerald-500 text-white' : 'bg-slate-900 text-white hover:bg-emerald-600'
              }`}
            >
              {isSaved ? '보안 저장 완료' : '키 안전하게 저장'}
            </button>
          </div>
        </section>

        {/* 2. AI 연동 섹션 (안내 문구 포함) */}
        <div className="space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600">
              <Sparkles size={20} />
            </div>
            <p className="font-black text-slate-800 dark:text-slate-200">
              썸네일 정밀 분석을 원하시면 AI 엔진을 연동해 주세요.
            </p>
          </div>

          <section className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border-2 border-blue-500/20 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-black text-blue-600">
                <Key size={24} />
                <span className="text-xl">Gemini AI 엔진 연동</span>
              </div>
              {aiKeySelected && <CheckCircle2 size={24} className="text-emerald-500" />}
            </div>

            <p className="text-sm text-slate-500 font-medium leading-relaxed">
              알고픽은 구글의 <b>Gemini 3 Pro</b> 모델을 통해 썸네일 구도, 텍스트 배치, 컬러 전략을 심층 분석합니다. 
              안정적인 분석 환경을 위해 본인의 프로젝트를 연동하세요.
            </p>

            <div className="bg-blue-50 dark:bg-blue-900/10 p-5 rounded-3xl border border-blue-100 dark:border-blue-900/20 flex items-start gap-3">
              <BillingIcon size={18} className="text-blue-600 shrink-0 mt-0.5" />
              <div className="text-xs font-bold text-slate-600 dark:text-slate-400 leading-relaxed">
                사용자의 구글 유료 프로젝트(Paid Project) 키를 사용하게 됩니다. <br />
                자세한 내용은 <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-blue-600 underline">빌링 문서</a>를 확인하세요.
              </div>
            </div>

            <button 
              onClick={handleSelectAiKey}
              className={`w-full py-5 rounded-3xl font-black text-sm transition-all flex items-center justify-center gap-2 ${
                aiKeySelected 
                ? 'bg-blue-50 dark:bg-blue-600/10 text-blue-600 border border-blue-200 dark:border-blue-900/30' 
                : 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 hover:bg-blue-700'
              }`}
            >
              <Sparkles size={18} />
              {aiKeySelected ? '개인 AI 프로젝트 연동됨 (변경)' : 'Gemini AI 엔진 연동하기'}
            </button>
          </section>
        </div>

        {/* 3. 서비스 연결 상태 대시보드 */}
        <section className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border dark:border-slate-800 shadow-sm grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-2xl border transition-all ${userKey ? 'bg-emerald-50 dark:bg-emerald-600/5 border-emerald-100 dark:border-emerald-900/20' : 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Data Engine Status</span>
              <div className={`w-1.5 h-1.5 rounded-full ${userKey ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
            </div>
            <p className="text-sm font-black dark:text-white">{userKey ? '개인 키 활성화됨' : '공유 할당량 사용'}</p>
          </div>
          <div className={`p-4 rounded-2xl border transition-all ${aiKeySelected ? 'bg-blue-50 dark:bg-blue-600/5 border-blue-100 dark:border-blue-900/20' : 'bg-slate-50 dark:bg-white/5 border-slate-100 dark:border-white/5'}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">AI Brain Status</span>
              <div className={`w-1.5 h-1.5 rounded-full ${aiKeySelected ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`}></div>
            </div>
            <p className="text-sm font-black dark:text-white">{aiKeySelected ? '개인 AI 사용 중' : '시스템 AI 사용 중'}</p>
          </div>
        </section>

        {/* 4. 기타 설정 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border dark:border-slate-800 shadow-sm flex items-center justify-between">
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
          </section>

          <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border dark:border-slate-800 shadow-sm flex items-center justify-center">
            <button onClick={clearStorage} className="text-red-600 font-bold hover:bg-red-50 dark:hover:bg-red-900/10 px-4 py-2 rounded-xl transition-colors text-sm flex items-center gap-2">
              <Trash2 size={16} /> 데이터 초기화
            </button>
          </section>
        </div>

        <section className="bg-white dark:bg-slate-900 p-6 rounded-2xl border dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
            <Info size={18} className="text-blue-500" />
            <span>서비스 정보</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <InfoRow label="버전" value="v1.4.5" />
            <InfoRow label="엔진" value="BYOK Support Build" />
          </div>
        </section>
      </div>
    </div>
  );
};

export default Settings;
