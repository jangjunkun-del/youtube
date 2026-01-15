
import React from 'react';
import { Activity, Database, Video, Radio, ShieldCheck } from 'lucide-react';

const ServiceStats: React.FC = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-8 border-y dark:border-slate-800">
    <StatItem icon={Database} label="분석 중인 채널" value="23,617,654" />
    <StatItem icon={Video} label="분석 중인 영상" value="2,908,728,754" />
    <StatItem icon={Radio} label="분석 중인 라이브" value="300,823,217" />
    <StatItem icon={ShieldCheck} label="분석 중인 광고" value="20,605,347" />
  </div>
);

const StatItem = ({ icon: Icon, label, value }: any) => (
  <div className="flex flex-col items-center text-center space-y-1">
    <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl mb-1">
      <Icon size={18} className="text-slate-400" />
    </div>
    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">{label}</p>
    <p className="text-sm font-black text-slate-900 dark:text-white tracking-tighter">{value}</p>
  </div>
);

export default ServiceStats;
