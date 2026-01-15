
import React from 'react';
import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

interface RankingBoardProps {
  title: string;
  icon: LucideIcon;
  iconColor: string;
  filterLabel?: string;
  filterActive?: boolean;
  link: string;
  children: React.ReactNode;
}

const RankingBoard: React.FC<RankingBoardProps> = ({ 
  title, 
  icon: Icon, 
  iconColor, 
  filterLabel, 
  filterActive = true,
  link, 
  children 
}) => (
  <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border dark:border-slate-800 shadow-sm space-y-6 flex flex-col h-full">
    <div className="flex items-center justify-between">
      <Link to={link} className="group">
        <h3 className="font-black text-lg flex items-center gap-2 dark:text-white group-hover:text-red-500 transition-colors">
          <Icon className={iconColor} size={20} /> {title}
        </h3>
      </Link>
      {filterLabel && (
        <div className="flex gap-2">
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-widest ${
            filterActive 
            ? 'text-red-500 bg-red-50 dark:bg-red-900/10' 
            : 'text-slate-400 bg-slate-50 dark:bg-slate-800'
          }`}>
            {filterLabel}
          </span>
        </div>
      )}
    </div>
    
    <div className="space-y-4 flex-1">
      {children}
    </div>

    <Link to={link} className="flex justify-center pt-2 group">
      <div className="flex items-center gap-0.5">
        <div className="w-1 h-1 bg-slate-200 group-hover:bg-red-500 rounded-full transition-colors"></div>
        <div className="w-1 h-1 bg-slate-200 group-hover:bg-red-500 rounded-full transition-colors"></div>
        <div className="w-1 h-1 bg-slate-200 group-hover:bg-red-500 rounded-full transition-colors"></div>
      </div>
    </Link>
  </div>
);

export default RankingBoard;
