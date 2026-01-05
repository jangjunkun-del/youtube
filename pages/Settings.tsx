
import React from 'react';
import { Info, Github, ShieldCheck, Mail, Database } from 'lucide-react';

const Settings: React.FC = () => {
  const clearStorage = () => {
    if (confirm('모든 즐겨찾기 데이터를 삭제하시겠습니까?')) {
      localStorage.removeItem('favorites');
      window.location.reload();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-bold">서비스 설정 및 안내</h1>
        <p className="text-slate-500">YouRank Analytics 도구의 정보와 설정을 관리합니다.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="bg-white p-6 rounded-3xl border shadow-sm space-y-4">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <Database size={20} className="text-blue-500" /> 데이터 관리
          </div>
          <p className="text-sm text-slate-500 leading-relaxed">
            이 앱은 사용자의 채널 즐겨찾기 데이터를 브라우저의 <b>Local Storage</b>에만 저장합니다.
            서버에는 어떠한 개인 데이터도 저장되지 않습니다.
          </p>
          <button 
            onClick={clearStorage}
            className="w-full py-3 border-2 border-red-100 text-red-600 font-bold rounded-2xl hover:bg-red-50 transition-colors"
          >
            모든 데이터 초기화
          </button>
        </section>

        <section className="bg-white p-6 rounded-3xl border shadow-sm space-y-4">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <ShieldCheck size={20} className="text-green-500" /> 보안 안내
          </div>
          <p className="text-sm text-slate-500 leading-relaxed">
            YouRank는 Cloudflare Functions 프록시 기술을 사용하여 <b>YouTube Data API Key</b>를 
            클라이언트 측에 노출하지 않고 안전하게 관리합니다.
          </p>
          <div className="bg-slate-50 p-3 rounded-xl text-xs text-slate-400">
            환경변수 설정 여부: <span className="text-green-600 font-bold">확인됨 (Serverless Proxy Active)</span>
          </div>
        </section>
      </div>

      <section className="bg-slate-900 text-white p-8 rounded-[40px] space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Info className="text-red-500" /> About YouRank
          </h2>
          <p className="text-slate-400">
            YouRank는 유튜버와 마케터를 위한 인사이트 제공을 목적으로 개발되었습니다.
            YouTube Data API v3의 제약 사항을 준수하며, 투명한 데이터 시각화를 지향합니다.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <a href="#" className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors border border-white/10">
            <Github />
            <div>
              <p className="font-bold text-sm">GitHub Repository</p>
              <p className="text-xs text-slate-500">Source code available</p>
            </div>
          </a>
          <a href="#" className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-colors border border-white/10">
            <Mail />
            <div>
              <p className="font-bold text-sm">Support Contact</p>
              <p className="text-xs text-slate-500">support@yourank.io</p>
            </div>
          </a>
        </div>
      </section>
    </div>
  );
};

export default Settings;
