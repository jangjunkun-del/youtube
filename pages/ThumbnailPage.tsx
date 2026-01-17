
import React from 'react';
const ThumbnailPage: React.FC = () => (
  <div className="py-20 text-center space-y-8">
    <div className="max-w-3xl mx-auto space-y-4">
      <h2 className="text-4xl font-black tracking-tight">유튜브 썸네일 분석</h2>
      <p className="text-slate-500 font-bold">클릭률이 높은 썸네일의 공통적인 컬러와 구도, <br />텍스트 배치를 시각적으로 분석합니다.</p>
    </div>
    <div className="bg-white dark:bg-[#1a1a1a] p-12 rounded-[40px] border-2 border-dashed dark:border-white/10 text-slate-400 font-black uppercase tracking-widest">
      썸네일 스타일 분류 AI 기능 업데이트 준비 중...
    </div>
  </div>
);
export default ThumbnailPage;
