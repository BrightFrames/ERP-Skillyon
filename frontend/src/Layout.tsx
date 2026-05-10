import { useState } from 'react';
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
  GraduationCap
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['ADMIN', 'TEACHER', 'STAFF'] },
  { name: 'Students', path: '/students', icon: Users, roles: ['ADMIN', 'TEACHER'] },
  { name: 'Academic', path: '/classes', icon: BookOpen, roles: ['ADMIN', 'TEACHER'] },
  { name: 'Messages', path: '/messages', icon: MessageSquare, roles: ['ADMIN', 'TEACHER', 'STAFF'] },
  { name: 'Fees', path: '/fees', icon: CreditCard, roles: ['ADMIN', 'STAFF'] },
  { name: 'Reports', path: '/reports', icon: BarChart2, roles: ['ADMIN'] },
  { name: 'Settings', path: '/settings', icon: Settings, roles: ['ADMIN'] },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const currentSearch = searchParams.get('search') || '';

  let roleDisplay = 'ADMIN PORTAL';
  let userRole = 'ADMIN';
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      userRole = user.role || 'ADMIN';
      if (user.role === 'TEACHER') roleDisplay = 'TEACHER PORTAL';
      else if (user.role === 'STAFF') roleDisplay = 'STAFF PORTAL';
    } catch(e) {}
  }

  const filteredNavItems = navItems.filter(item => item.roles.includes(userRole));

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const currentPath = location.pathname;
    
    const newSearchParams = new URLSearchParams(location.search);
    if (val) {
      newSearchParams.set('search', val);
    } else {
      newSearchParams.delete('search');
    }

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
            
            <div className="hidden sm:flex items-center relative w-full max-w-md">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search size={18} className="text-zinc-400" />
              </div>
              <input 
                type="text" 
                value={currentSearch}
                onChange={handleSearchChange}
                placeholder="Search students, staff or records..."
                className="w-full pl-11 pr-4 py-2.5 bg-zinc-100/80 border-transparent rounded-xl text-sm focus:border-zinc-300 focus:bg-white focus:ring-0 transition-all placeholder:text-zinc-400 font-medium"
              />
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
                <div className="text-sm font-bold text-zinc-900 leading-tight">
                  {(() => {
                    const user = localStorage.getItem('user');
                    if (user) {
                      try {
                        const parsed = JSON.parse(user);
                        if (parsed.role === 'TEACHER') return 'Dr. Sarah Wilson';
                        if (parsed.role === 'ADMIN') return 'System Admin';
                        return parsed.name || 'User';
                      } catch(e) {}
                    }
                    return 'User';
                  })()}
                </div>
                <div className="text-xs font-semibold text-zinc-500">
                  {(() => {
                    const user = localStorage.getItem('user');
                    if (user) {
                      try {
                        const parsed = JSON.parse(user);
                        if (parsed.role === 'TEACHER') return 'Senior Teacher';
                        return parsed.role;
                      } catch(e) {}
                    }
                    return '';
                  })()}
                </div>
              </div>
              <img 
                src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                alt="User Profile" 
                className="w-10 h-10 rounded-full object-cover border border-zinc-200 shadow-sm"
              />
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
