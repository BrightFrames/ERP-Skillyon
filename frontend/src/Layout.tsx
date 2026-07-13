import { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users,
  BookOpen,
  MessageSquare,
  CreditCard,
  BarChart2,
  Settings,
  LogOut,
  Headset,
  Menu,
  X,
  Search,
  Bell,
  CircleHelp,
  Grid,
  GraduationCap,
  UserCheck
} from 'lucide-react';
import { useLanguage, t } from './lib/i18n';
import { fetchAndApplySettings } from './lib/settings';
import ThemeToggle from './components/ThemeToggle';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['ADMIN', 'TEACHER', 'STAFF'] },
  { name: 'Students', path: '/students', icon: Users, roles: ['ADMIN', 'TEACHER'] },
  { name: 'Academic', path: '/classes', icon: BookOpen, roles: ['ADMIN', 'TEACHER'] },
  { name: 'Staff', path: '/teachers', icon: UserCheck, roles: ['ADMIN'] },
  { name: 'Fees', path: '/fees', icon: CreditCard, roles: ['ADMIN', 'STAFF'] },
  { name: 'Messages', path: '/messages', icon: MessageSquare, roles: ['ADMIN', 'TEACHER', 'STAFF'] },
  { name: 'Reports', path: '/reports', icon: BarChart2, roles: ['ADMIN'] },
  { name: 'Settings', path: '/settings', icon: Settings, roles: ['ADMIN'] },
];

export default function Layout() {
  const lang = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const currentSearch = searchParams.get('search') || '';
  const searchInputRef = useRef<HTMLInputElement>(null);

  const userStr = localStorage.getItem('user');

  useEffect(() => {
    fetchAndApplySettings();
  }, []);
  const loggedInUser = userStr ? (() => { try { return JSON.parse(userStr); } catch { return {}; } })() : {};
  const displayName = loggedInUser.name || (loggedInUser.role === 'ADMIN' ? 'System Admin' : loggedInUser.role === 'TEACHER' ? 'Teacher' : 'Staff');
  const displayRole = loggedInUser.role || 'ADMIN';

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { 
        e.preventDefault(); 
        searchInputRef.current?.focus(); 
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  const QUICK_LINKS = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Students', path: '/students', icon: Users },
    { label: 'Academic / Gradebook', path: '/classes', icon: BookOpen },
    { label: 'Staff Management', path: '/teachers', icon: UserCheck },
    { label: 'Reports & Analytics', path: '/reports', icon: BarChart2 },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  const filteredLinks = searchQuery
    ? QUICK_LINKS.filter(l => l.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : QUICK_LINKS;

  const handleGlobalSearch = (path: string) => {
    navigate(path + (searchQuery && path === '/students' ? `?search=${searchQuery}` : ''));
    setSearchOpen(false);
    setSearchQuery('');
  };

  let roleDisplay = 'ADMIN PORTAL';
  let userRole = displayRole;
  if (loggedInUser.role === 'TEACHER') roleDisplay = 'TEACHER PORTAL';
  else if (loggedInUser.role === 'STAFF') roleDisplay = 'STAFF PORTAL';

  const filteredNavItems = navItems.filter(item => item.roles.includes(userRole));

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const newSearchParams = new URLSearchParams();
    if (val) {
      newSearchParams.set('search', val);
    }
    const searchString = newSearchParams.toString();
    navigate(`/students${searchString ? '?' + searchString : ''}`, { replace: true });
  };

  return (
    <div className="flex h-screen bg-[#f8fafc] dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 overflow-hidden selection:bg-indigo-500/30">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Premium Theme */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-[#0f172a] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] shadow-[4px_0_24px_rgba(0,0,0,0.1)] border-r border-slate-800/50 flex flex-col transform transition-transform duration-300 ease-in-out md:transform-none ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 flex flex-col gap-1">
          <div className="flex items-center justify-between md:justify-start gap-3 mb-2">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-500/30">
              <GraduationCap size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-white leading-tight">
                Skill<span className="text-indigo-400">yon</span>
              </h2>
              <p className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase">{roleDisplay}</p>
            </div>
            <button 
              className="md:hidden text-zinc-400 hover:text-white ml-auto"
              onClick={() => setSidebarOpen(false)}
            >
              <X size={24} />
            </button>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto mt-2">
          {filteredNavItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-4 py-3.5 rounded-xl transition-all text-sm font-semibold relative overflow-hidden group ${
                  isActive
                    ? 'text-indigo-300 bg-indigo-500/12 border border-indigo-500/30 shadow-[0_4px_12px_rgba(99,102,241,0.08)]'
                    : 'text-slate-400 hover:bg-indigo-500/5 hover:text-indigo-300'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-indigo-400 to-purple-500 rounded-r-full" />}
                  <item.icon size={20} strokeWidth={isActive ? 2.5 : 2} className={isActive ? 'text-indigo-400' : 'group-hover:text-indigo-400 transition-colors'} />
                  {t(item.name, lang)}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 space-y-3 mb-4">
          <button className="flex w-full items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-sm font-semibold text-white bg-slate-800 hover:bg-slate-700 transition-all border border-slate-700 shadow-sm hover:shadow-md">
            <Headset size={18} />
            {t("Support Center", lang)}
          </button>
          <button 
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              window.location.href = '/login';
            }}
            className="flex w-full items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-sm font-semibold text-red-400 bg-red-400/10 hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
          >
            <LogOut size={18} />
            {t("Sign Out", lang)}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col w-full md:w-auto h-full overflow-hidden bg-[#f8fafc] dark:bg-slate-900/40 relative">
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-indigo-50/50 to-transparent pointer-events-none"></div>
        {/* Top Header */}
        <header className="h-20 shrink-0 glass border-b border-slate-200/60 flex items-center justify-between px-6 lg:px-10 z-10 sticky top-0">
          <div className="flex items-center flex-1 gap-4">
            <button 
              className="md:hidden p-2 -ml-2 text-zinc-600 hover:text-zinc-900 bg-zinc-100 rounded-lg"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            
            {/* Search Input */}
            <div className="hidden sm:flex items-center relative w-full max-w-md bg-white border border-slate-200 shadow-sm focus-within:border-indigo-500 focus-within:ring-4 focus-within:ring-indigo-500/10 rounded-2xl transition-all group">
              <Search size={18} className="text-slate-400 absolute left-4 group-focus-within:text-indigo-500 transition-colors" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder={t("Search students, classes, or reports...", lang)}
                value={currentSearch}
                onChange={handleSearchChange}
                className="w-full bg-transparent border-none outline-none py-3 pl-12 pr-12 text-sm text-slate-800 placeholder:text-slate-400 font-medium"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold bg-slate-50 border border-slate-200 text-slate-400 px-2 py-1 rounded-md shadow-sm">⌘K</kbd>
            </div>
          </div>
          
          <div className="flex items-center gap-4 lg:gap-6 ml-4">
            <ThemeToggle />

            <button className="flex items-center gap-3 pl-2 group">
              <div className="hidden sm:block text-right">
                <div className="text-sm font-bold text-slate-900 leading-tight group-hover:text-indigo-600 transition-colors">{displayName}</div>
                <div className="text-xs font-semibold text-slate-500">{displayRole}</div>
              </div>
              <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-700 flex items-center justify-center text-sm font-bold border-2 border-white shadow-md shrink-0 group-hover:scale-105 transition-transform">
                {displayName.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase()}
              </div>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto h-full">
            <Outlet />
          </div>
        </div>
      </main>

    </div>
  );
}
