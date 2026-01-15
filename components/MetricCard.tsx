
import React from 'react';
import { BarChart } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string;
  color: string;
  bg: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ label, value, color, bg }) => (
  <div className={`p-6 rounded-[28px] border dark:border-slate-800 shadow-sm flex flex-col gap-1 bg-white dark:bg-slate-900`}>
    <div className={`${bg} ${color} w-fit p-1.5 rounded-lg mb-2`}><BarChart size={16} /></div>
    <p className="text-slate-400 text-[10px] font-black uppercase tracking-wider">{label}</p>
    <p className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">{value}</p>
  </div>
);

export default MetricCard;
