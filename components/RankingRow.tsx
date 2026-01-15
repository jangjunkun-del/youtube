
import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface RankingRowProps {
  rank: number;
  title: string;
  value: string;
  color: string;
  img: string;
  prefix?: string;
  trend?: 'up' | 'down' | 'none';
}

const RankingRow: React.FC<RankingRowProps> = ({ rank, title, value, color, img, prefix, trend }) => (
  <Link 
    to={`/ranking?q=${encodeURIComponent(title)}`} 
    className="flex items-center justify-between py-2 border-b dark:border-slate-800 last:border-0 group cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/20 px-1 rounded-lg transition-colors"
  >
    <div className="flex items-center gap-3">
      <span className="text-xs font-black text-slate-400 w-5 text-center group-hover:text-red-500 transition-colors">{rank}</span>
      <div className="w-6 h-6 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-sm">
        <img src={img} className="w-full h-full object-cover" alt="" loading="lazy" />
      </div>
      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate max-w-[130px] group-hover:text-red-600 group-hover:underline transition-colors">{title}</span>
    </div>
    <div className="flex items-center gap-1">
      {trend === 'up' && <TrendingUp size={10} className="text-red-500" />}
      {trend === 'down' && <TrendingDown size={10} className="text-blue-500" />}
      {trend === 'none' && <Minus size={10} className="text-slate-300" />}
      <span className={`text-[11px] font-black ${color}`}>{prefix}{value}</span>
    </div>
  </Link>
);

export default RankingRow;
