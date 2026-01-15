
import React from 'react';

interface SidebarSectionProps {
  label: string;
}

const SidebarSection: React.FC<SidebarSectionProps> = ({ label }) => (
  <div className="px-4 pt-6 pb-2">
    <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] px-1">
      {label}
    </p>
  </div>
);

export default SidebarSection;
