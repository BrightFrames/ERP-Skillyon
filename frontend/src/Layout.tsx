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

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['ADMIN', 'TEACHER', 'STAFF'] },
  { name: 'Students', path: '/students', icon: Users, roles: ['ADMIN', 'TEACHER'] },
  { name: 'Academic', path: '/classes', icon: BookOpen, roles: ['ADMIN', 'TEACHER'] },
  { name: 'Staff', path: '/teachers', icon: UserCheck, roles: ['ADMIN'] },
  { name: 'Messages', path: '/messages', icon: MessageSquare, roles: ['ADMIN', 'TEACHER', 'STAFF'] },
  { name: 'Fees', path: '/fees', icon: CreditCard, roles: ['ADMIN', 'STAFF'] },
  { name: 'Reports', path: '/reports', icon: BarChart2, roles: ['ADMIN'] },
  { name: 'Settings', path: '/settings', icon: Settings, roles: ['ADMIN'] },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const currentSearch = searchParams.get('search') || '';
  const searchInputRef = useRef<HTMLInputElement>(null);

  const userStr = localStorage.getItem('user');
  const loggedInUser = userStr ? (() => { try { return JSON.parse(userStr); } catch { return {}; } })() : {};
  const displayName = loggedInUser.name || (loggedInUser.role === 'ADMIN' ? 'System Admin' : loggedInUser.role === 'TEACHER' ? 'Teacher' : 'Staff');
  const displayRole = loggedInUser.role || 'ADMIN';

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(true); }
      if (e.key === 'Escape') setSearchOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    if (searchOpen) setTimeout(() => searchInputRef.current?.focus(), 50);
  }, [searchOpen]);

  const QUICK_LINKS = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Students', path: '/students', icon: Users },
    { label: 'Academic / Gradebook', path: '/classes', icon: BookOpen },
    { label: 'Staff Management', path: '/teachers', icon: UserCheck },
    { label: 'Fee Management', path: '/fees', icon: MessageSquare },
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
    const currentPath = location.pathname;
    const newSearchParams = new URLSearchParams(location.search);
    if (val) { newSearchParams.set('search', val); } else { newSearchParams.delete('search'); }
    const searchString = newSearchParams.toString();
    navigate(`${currentPath}${searchString ? '?' + searchString : ''}`, { replace: true });
  };

  return (
    <div className="flex h-screen bg-zinc-50 font-sans text-zinc-900 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Dark Theme */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-[#1a1c2c] border-r border-[#26283b] flex flex-col transform transition-transform duration-200 ease-in-out md:transform-none ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 flex flex-col gap-1">
          <div className="flex items-center justify-between md:justify-start gap-3">
            <div className="bg-[#3b3dbf] p-1.5 rounded-lg text-white">
              <GraduationCap size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white leading-tight">
                EduCore ERP
              </h2>
              <p className="text-[10px] font-bold text-zinc-400 tracking-wider">{roleDisplay}</p>
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
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-semibold ${
                  isActive
                    ? 'bg-[#3b3dbf] text-white shadow-lg shadow-[#3b3dbf]/20'
                    : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
                }`
              }
            >
              <item.icon size={20} strokeWidth={2.5} />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 space-y-2 mb-2">
          <button className="flex w-full items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold text-white bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
            <Headset size={18} />
            Support Center
          </button>
          <button 
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              window.location.href = '/login';
            }}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-red-400 hover:bg-red-400/10 transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col w-full md:w-auto h-full overflow-hidden bg-zinc-50/50">
        {/* Top Header */}
        <header className="h-20 shrink-0 bg-white border-b border-zinc-200 flex items-center justify-between px-6 lg:px-10 z-10">
          <div className="flex items-center flex-1 gap-4">
            <button 
              className="md:hidden p-2 -ml-2 text-zinc-600 hover:text-zinc-900 bg-zinc-100 rounded-lg"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            
            {/* Global Search trigger */}
            <div className="hidden sm:flex items-center relative w-full max-w-md">
              <button
                onClick={() => setSearchOpen(true)}
                className="w-full flex items-center gap-3 pl-4 pr-3 py-2.5 bg-zinc-100/80 hover:bg-zinc-100 border border-transparent hover:border-zinc-200 rounded-xl text-sm text-zinc-400 font-medium transition-all"
              >
                <Search size={16} className="text-zinc-400" />
                <span>Search pages, students...</span>
                <kbd className="ml-auto text-[10px] font-bold bg-white border border-zinc-200 text-zinc-400 px-1.5 py-0.5 rounded shadow-sm">⌘K</kbd>
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-4 lg:gap-6 ml-4">
            <div className="hidden sm:flex items-center gap-3 text-zinc-500">
              <button className="p-2 hover:bg-zinc-100 rounded-full transition-colors relative">
                <Bell size={20} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </button>
              <button className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                <CircleHelp size={20} />
              </button>
              <button className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
                <Grid size={20} />
              </button>
            </div>
            
            <div className="h-8 w-px bg-zinc-200 hidden sm:block"></div>

            <button className="hidden sm:flex bg-[#3b3dbf] hover:bg-[#2c2eb5] text-white px-5 py-2.5 rounded-full text-sm font-semibold transition-colors shadow-sm">
              Check In
            </button>
            
            <button className="flex items-center gap-3 pl-2">
              <div className="hidden sm:block text-right">
                <div className="text-sm font-bold text-zinc-900 leading-tight">{displayName}</div>
                <div className="text-xs font-semibold text-zinc-500">{displayRole}</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-indigo-100 text-[#3b3dbf] flex items-center justify-center text-sm font-bold border border-zinc-200 shadow-sm shrink-0">
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

      {/* Global Search Spotlight */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 bg-black/40 backdrop-blur-sm" onClick={() => setSearchOpen(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-zinc-100">
              <Search size={18} className="text-zinc-400 shrink-0" />
              <input
                ref={searchInputRef}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && filteredLinks.length > 0) handleGlobalSearch(filteredLinks[0].path);
                }}
                placeholder="Search pages, students, staff..."
                className="flex-1 text-sm font-medium text-zinc-800 bg-transparent focus:outline-none placeholder:text-zinc-400"
              />
              <button onClick={() => setSearchOpen(false)} className="p-1 text-zinc-400 hover:text-zinc-600">
                <X size={16} />
              </button>
            </div>
            <div className="py-2">
              {filteredLinks.length === 0 ? (
                <div className="px-4 py-6 text-center text-sm text-zinc-400">No results found</div>
              ) : (
                filteredLinks.map(link => (
                  <button
                    key={link.path}
                    onClick={() => handleGlobalSearch(link.path)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-indigo-50 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-[#3b3dbf] flex items-center justify-center shrink-0">
                      <link.icon size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-zinc-800">{link.label}</p>
                      <p className="text-[10px] text-zinc-400 font-medium">{link.path}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
            <div className="px-4 py-2.5 border-t border-zinc-100 bg-zinc-50 flex items-center gap-3 text-[10px] font-bold text-zinc-400">
              <span>↵ to open</span>
              <span>esc to close</span>
              <span className="ml-auto">⌘K to open anywhere</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
