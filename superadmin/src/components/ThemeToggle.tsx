import { useState, useEffect } from 'react';
import { Sun, Moon } from 'lucide-react';
import { getAppearance, applySettings } from '../lib/settings';

function getResolvedTheme(theme: string) {
  if (theme === 'dark') return 'dark';
  if (theme === 'system' && typeof window !== 'undefined') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => getResolvedTheme(getAppearance().theme));

  useEffect(() => {
    const handleSync = () => {
      setTheme(getResolvedTheme(getAppearance().theme));
    };
    window.addEventListener('appearance-changed', handleSync);
    return () => window.removeEventListener('appearance-changed', handleSync);
  }, []);

  const toggleTheme = (selectedTheme: 'light' | 'dark', event: React.MouseEvent<HTMLButtonElement>) => {
    if (theme === selectedTheme) return;

    const supportsViewTransition = (document as any).startViewTransition;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!supportsViewTransition || prefersReducedMotion) {
      const appearance = getAppearance();
      appearance.theme = selectedTheme;
      applySettings(appearance);
      setTheme(selectedTheme);
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;

    const transition = (document as any).startViewTransition(() => {
      const appearance = getAppearance();
      appearance.theme = selectedTheme;
      applySettings(appearance);
      setTheme(selectedTheme);
    });

    transition.ready.then(() => {
      const clipPath = [
        `circle(0px at ${x}px ${y}px)`,
        `circle(${Math.hypot(window.innerWidth, window.innerHeight)}px at ${x}px ${y}px)`,
      ];
      document.documentElement.animate(
        {
          clipPath: clipPath,
        },
        {
          duration: 500,
          easing: 'ease-in-out',
          pseudoElement: '::view-transition-new(root)',
        }
      );
    });
  };

  return (
    <div className="flex items-center bg-slate-100/80 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200/50 dark:border-slate-800/40 p-1 rounded-full shadow-inner relative select-none">
      {/* Light Option */}
      <button
        onClick={(e) => toggleTheme('light', e)}
        className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 cursor-pointer ${
          theme === 'light'
            ? 'text-white bg-gradient-to-r from-violet-600 to-indigo-600 shadow-[0_2px_10px_rgba(91,61,245,0.4)] scale-105'
            : 'text-slate-500 hover:text-slate-800 hover:scale-105'
        }`}
        title="Light Mode"
      >
        <Sun size={16} strokeWidth={2.5} className={theme === 'light' ? 'drop-shadow-[0_0_4px_rgba(255,255,255,0.6)]' : ''} />
      </button>

      {/* Dark Option */}
      <button
        onClick={(e) => toggleTheme('dark', e)}
        className={`relative z-10 flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 cursor-pointer ${
          theme === 'dark'
            ? 'text-white bg-gradient-to-r from-violet-600 to-indigo-600 shadow-[0_2px_10px_rgba(91,61,245,0.4)] scale-105'
            : 'text-slate-400 hover:text-slate-200 dark:hover:text-slate-100 hover:scale-105'
        }`}
        title="Dark Mode"
      >
        <Moon size={16} strokeWidth={2.5} className={theme === 'dark' ? 'drop-shadow-[0_0_4px_rgba(255,255,255,0.6)]' : ''} />
      </button>
    </div>
  );
}
