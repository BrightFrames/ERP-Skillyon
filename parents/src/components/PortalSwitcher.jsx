import React from 'react';
import { ExternalLink, School, HeartHandshake, ShieldCheck, GraduationCap } from 'lucide-react';

export default function PortalSwitcher({ current = 'parent' }) {
  const isLocal = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  const portals = [
    { id: 'school', name: 'School ERP', url: isLocal ? 'http://localhost:5173' : 'https://erp-skillyon-frontend.vercel.app', icon: School },
    { id: 'student', name: 'Students', url: isLocal ? 'http://localhost:5176' : 'https://erp-skillyon-student.vercel.app', icon: GraduationCap },
    { id: 'parent', name: 'Parents', url: isLocal ? 'http://localhost:5174' : 'https://erp-skillyon-pare.vercel.app', icon: HeartHandshake },
  ];

  return (
    <div className="w-full pt-4 mt-6 border-t border-slate-100 dark:border-slate-800/80">
      <div className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2 text-center">
        Switch Skillyon Portal
      </div>
      <div className="grid grid-cols-2 gap-2">
        {portals.map((p) => {
          const isCurrent = p.id === current;
          const Icon = p.icon;
          return (
            <a
              key={p.id}
              href={p.url}
              target={isCurrent ? undefined : '_blank'}
              rel="noreferrer"
              className={`flex items-center justify-between p-2.5 rounded-xl border text-xs font-bold transition-all ${
                isCurrent
                  ? 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-950/40 dark:border-teal-800'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200/60 dark:bg-slate-900/40 dark:text-slate-300 dark:border-slate-800 hover:shadow-2xs'
              }`}
            >
              <span className="flex items-center gap-1.5 truncate">
                <Icon size={14} className="shrink-0" /> {p.name}
              </span>
              {isCurrent ? (
                <span className="text-[9px] uppercase px-1 py-0.5 rounded bg-teal-500 text-white font-extrabold">Active</span>
              ) : (
                <ExternalLink size={12} className="opacity-50" />
              )}
            </a>
          );
        })}
      </div>
    </div>
  );
}

