import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  GraduationCap, 
  Presentation,
  UserCog,
  BookOpen,
  Building2,
  CreditCard, 
  CalendarCheck,
  FileText,
  Megaphone,
  LogOut,
  Settings,
  School,
  Menu,
  X
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Students', path: '/students', icon: GraduationCap },
  { name: 'Teachers', path: '/teachers', icon: Presentation },
  { name: 'Workers & Staff', path: '/workers', icon: UserCog },
  { name: 'Classes', path: '/classes', icon: BookOpen },
  { name: 'Departments', path: '/departments', icon: Building2 },
  { name: 'Attendance', path: '/attendance', icon: CalendarCheck },
  { name: 'Fee Management', path: '/fees', icon: CreditCard },
  { name: 'Exams & Results', path: '/exams', icon: FileText },
  { name: 'Notice Board', path: '/notices', icon: Megaphone },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-zinc-50 font-sans text-zinc-900 overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-zinc-200 flex flex-col transform transition-transform duration-200 ease-in-out md:transform-none ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6 flex items-center justify-between md:block">
          <h2 className="text-2xl font-bold tracking-tight text-blue-600 flex items-center gap-2">
            <School size={28} />
            Skillyon
          </h2>
          <button 
            className="md:hidden text-zinc-500 hover:text-zinc-900"
            onClick={() => setSidebarOpen(false)}
          >
            <X size={24} />
          </button>
        </div>
        
        <nav className="flex-1 px-4 py-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium ${
                  isActive
                    ? 'bg-zinc-100 text-zinc-900'
                    : 'text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900'
                }`
              }
            >
              <item.icon size={20} />
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-zinc-200 space-y-2">
          <button className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors">
            <Settings size={20} />
            Settings
          </button>
          <button 
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              window.location.href = '/login';
            }}
            className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col w-full md:w-auto h-full overflow-hidden">
        {/* Top Header */}
        <header className="h-16 shrink-0 bg-white/50 backdrop-blur-sm border-b border-zinc-200 flex items-center justify-between md:justify-end px-4 md:px-8">
          <button 
            className="md:hidden p-2 text-zinc-600 hover:text-zinc-900"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                SA
            </div>
            <span className="text-sm font-medium hidden sm:inline-block">System Admin</span>
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
