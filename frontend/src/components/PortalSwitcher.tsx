import { useState, useRef, useEffect } from 'react';
import { LayoutGrid, GraduationCap, School, HeartHandshake, ShieldCheck, ExternalLink, X } from 'lucide-react';
import { getPortals } from '../lib/portals';

interface PortalSwitcherProps {
  currentPortalId?: 'school' | 'student' | 'parent' | 'superadmin';
  variant?: 'dropdown' | 'bar';
  includeSuperAdmin?: boolean;
}

export default function PortalSwitcher({ 
  currentPortalId = 'school', 
  variant = 'dropdown',
  includeSuperAdmin = false,
}: PortalSwitcherProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const portals = getPortals(currentPortalId, includeSuperAdmin);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getPortalIcon = (id: string) => {
    switch (id) {
      case 'school':
        return <School size={18} className="text-indigo-600 dark:text-indigo-400" />;
      case 'student':
        return <GraduationCap size={18} className="text-sky-600 dark:text-sky-400" />;
      case 'parent':
        return <HeartHandshake size={18} className="text-teal-600 dark:text-teal-400" />;
      case 'superadmin':
        return <ShieldCheck size={18} className="text-amber-600 dark:text-amber-400" />;
      default:
        return <School size={18} />;
    }
  };

  if (variant === 'bar') {
    return (
      <div className="w-full py-3.5 px-4 sm:px-6 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/60 dark:border-slate-800 shadow-sm">
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
            <LayoutGrid size={13} /> Skillyon Ecosystem Portals
          </span>
          <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 hidden sm:inline">
            Single sign-on ready
          </span>
        </div>
        <div className={`grid grid-cols-1 ${portals.length === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-4'} gap-3`}>
          {portals.map((p) => {
            const isCurrent = p.id === currentPortalId;
            return (
              <a
                key={p.id}
                href={p.url}
                target={isCurrent ? undefined : '_blank'}
                rel="noreferrer"
                className={`p-3 rounded-xl border flex flex-col gap-1.5 transition-all group ${
                  isCurrent
                    ? 'bg-indigo-50/70 border-indigo-200 dark:bg-indigo-950/40 dark:border-indigo-800'
                    : 'bg-slate-50/50 hover:bg-white border-slate-200/60 dark:bg-slate-900/50 dark:hover:bg-slate-800 dark:border-slate-800 hover:shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className={`p-1.5 rounded-lg ${p.bgLight}`}>{getPortalIcon(p.id)}</div>
                  {isCurrent ? (
                    <span className="text-[9px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-600 text-white">Active</span>
                  ) : (
                    <ExternalLink size={13} className="text-slate-400 group-hover:text-indigo-600 transition-colors" />
                  )}
                </div>
                <div className="font-bold text-xs text-slate-800 dark:text-slate-200 truncate mt-1">{p.name}</div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate">{p.desc}</div>
              </a>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-2 ${
          isOpen
            ? 'bg-indigo-50 border-indigo-300 text-indigo-700 dark:bg-indigo-950/50 dark:border-indigo-700 dark:text-indigo-300 shadow-sm'
            : 'border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800'
        }`}
        title={`Switch Portal (${portals.map(p => p.name).join(', ')})`}
      >
        <LayoutGrid size={18} />
        <span className="hidden lg:inline text-xs font-bold text-slate-700 dark:text-slate-200">Portals</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600">
                <LayoutGrid size={16} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wide">
                  ERP Portals
                </h4>
                <p className="text-[11px] text-slate-400">Switch between Skillyon apps</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-1 rounded-lg"
            >
              <X size={16} />
            </button>
          </div>

          <div className="space-y-2">
            {portals.map((p) => {
              const isCurrent = p.id === currentPortalId;
              return (
                <a
                  key={p.id}
                  href={p.url}
                  target={isCurrent ? undefined : '_blank'}
                  rel="noreferrer"
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all group ${
                    isCurrent
                      ? 'bg-indigo-50/70 border-indigo-200 dark:bg-indigo-950/40 dark:border-indigo-800 ring-1 ring-indigo-500/20'
                      : 'hover:bg-slate-50 border-transparent hover:border-slate-200 dark:hover:bg-slate-800/60 dark:hover:border-slate-700'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${p.bgLight}`}>
                    {getPortalIcon(p.id)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {p.name}
                      </span>
                      {isCurrent && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase bg-indigo-600 text-white">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{p.desc}</p>
                  </div>
                  {!isCurrent && (
                    <ExternalLink size={14} className="text-slate-400 group-hover:text-indigo-600 transition-colors shrink-0" />
                  )}
                </a>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
