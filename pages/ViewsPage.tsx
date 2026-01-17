
import React from 'react';
const ViewsPage: React.FC = () => (
  <div className="py-20 text-center space-y-8">
    <div className="max-w-3xl mx-auto space-y-4">
      <h2 className="text-4xl font-black tracking-tight">유튜브 조회수 분석</h2>
      <p className="text-slate-500 font-bold">조회수 성장 속도 지수(Velocity Index)를 기반으로 <br />알고리즘 추천 가능성을 분석합니다.</p>
    </div>
    <div className="bg-white dark:bg-[#1a1a1a] p-12 rounded-[40px] border-2 border-dashed dark:border-white/10 text-slate-400 font-black uppercase tracking-widest">
      업로드 후 24시간 내 성과 분석 기능 업데이트 준비 중...
    </div>
  </div>
);
export default ViewsPage;
