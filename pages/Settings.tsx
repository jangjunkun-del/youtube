
import React from 'react';
import { Trash2, Info, Youtube } from 'lucide-react';

const Settings: React.FC = () => {
  const clearStorage = () => {
    if (confirm('저장된 모든 즐겨찾기 데이터를 삭제하시겠습니까?')) {
      localStorage.removeItem('favorites');
      window.location.reload();
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 py-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-slate-900">설정</h1>
        <p className="text-slate-500 text-sm">앱 환경을 관리하고 서비스 정보를 확인합니다.</p>
      </header>

      <div className="space-y-4">
        {/* 데이터 관리 섹션 */}
        <section className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <Trash2 size={18} className="text-red-500" />
            <span>데이터 초기화</span>
          </div>
          <p className="text-sm text-slate-500 leading-relaxed">
            브라우저에 저장된 내 즐겨찾기 채널 목록을 모두 삭제합니다. 이 작업은 되돌릴 수 없습니다.
          </p>
          <button 
            onClick={clearStorage}
            className="w-full py-3 bg-red-50 text-red-600 font-bold rounded-xl hover:bg-red-100 transition-colors text-sm"
          >
            즐겨찾기 목록 비우기
          </button>
        </section>

        {/* 서비스 정보 섹션 */}
        <section className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
          <div className="flex items-center gap-2 font-bold text-slate-800">
            <Info size={18} className="text-blue-500" />
            <span>서비스 정보</span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm py-1 border-b border-slate-50">
              <span className="text-slate-500">버전</span>
              <span className="font-medium text-slate-900">v1.0.0</span>
            </div>
            <div className="flex items-center justify-between text-sm py-1 border-b border-slate-50">
              <span className="text-slate-500">데이터 출처</span>
              <span className="font-medium text-slate-900">YouTube Data API</span>
            </div>
            <div className="flex items-center justify-between text-sm py-1">
              <span className="text-slate-500">문의</span>
              <span className="font-medium text-slate-900">support@yourank.io</span>
            </div>
          </div>
        </section>
      </div>

      <footer className="text-center pt-8">
        <div className="flex items-center justify-center gap-2 text-slate-300 mb-2">
          <Youtube size={20} />
          <span className="font-black italic tracking-tighter">YouRank</span>
        </div>
        <p className="text-[10px] text-slate-400">© 2024 YouRank. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Settings;
