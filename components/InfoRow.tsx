
import React from 'react';

interface InfoRowProps {
  label: string;
  value: string;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value }) => (
  <div className="flex items-center justify-between text-sm py-1 border-b dark:border-slate-800 last:border-0">
    <span className="text-slate-500">{label}</span>
    <span className="font-medium text-slate-900 dark:text-slate-300">{value}</span>
  </div>
);

export default InfoRow;
