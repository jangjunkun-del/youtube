
import React from 'react';

interface RisingItemProps {
  rank: number;
  name: string;
  score: string;
  cate: string;
}

const RisingItem: React.FC<RisingItemProps> = ({ rank, name, score, cate }) => (
  <div className="flex items-center justify-between bg-white/5 p-4 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
    <div className="flex items-center gap-4">
      <span className="text-lg font-black italic text-red-500">{rank}</span>
      <div>
        <p className="font-bold text-sm">{name}</p>
        <p className="text-[10px] text-slate-500 font-black uppercase">{cate}</p>
      </div>
    </div>
    <div className="text-right">
      <p className="text-xs font-black text-red-400">{score}점</p>
      <div className="w-12 h-1 bg-white/10 rounded-full mt-1 overflow-hidden">
        <div className="h-full bg-red-500" style={{ width: `${score}%` }}></div>
      </div>
    </div>
  </div>
);

export default RisingItem;
