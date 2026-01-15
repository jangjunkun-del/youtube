
import React from 'react';
import { TrendingUp, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface TopicItem {
  rank: number;
  title: string;
  change: number | string;
}

interface TopicChartProps {
  category: string;
  items: TopicItem[];
}

const TopicChart: React.FC<TopicChartProps> = ({ category, items }) => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-[28px] border dark:border-slate-800 shadow-sm space-y-4">
    <div className="flex items-center justify-between border-b dark:border-slate-800 pb-3">
      <h4 className="font-black text-sm dark:text-white flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
        {category}
      </h4>
      <Link to={`/ranking?q=${category}`} className="text-[10px] font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest">
        View All
      </Link>
    </div>
    <div className="space-y-3">
      {items.map((item) => (
        <div key={item.rank} className="flex items-center justify-between group">
          <div className="flex items-center gap-3">
            <span className={`text-xs font-black ${item.rank <= 3 ? 'text-slate-900 dark:text-white' : 'text-slate-300'}`}>
              {item.rank}
            </span>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 truncate max-w-[120px] group-hover:text-red-500 transition-colors">
              {item.title}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp size={10} className="text-red-500" />
            <span className="text-[10px] font-black text-red-500">{item.change}</span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default TopicChart;
