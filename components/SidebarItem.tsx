
import React from 'react';
import { Link } from 'react-router-dom';

interface SidebarItemProps {
  to: string;
  icon: any;
  label: string;
  active: boolean;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ to, icon: Icon, label, active }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
      active 
        ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 font-semibold shadow-sm' 
        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
    }`}
  >
    <Icon size={20} />
    <span>{label}</span>
  </Link>
);

export default SidebarItem;
