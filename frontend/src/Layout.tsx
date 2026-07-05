import { useState, useEffect, useRef } from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
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
  UserCheck,
} from "lucide-react";
import { useLanguage, t } from "./lib/i18n";
import { fetchAndApplySettings } from "./lib/settings";
import ThemeToggle from "./components/ThemeToggle";

const navItems = [
  {
    name: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
    roles: ["ADMIN", "TEACHER", "STAFF"],
  },
  {
    name: "Students",
    path: "/students",
    icon: Users,
    roles: ["ADMIN", "TEACHER"],
  },
  {
    name: "Academic",
    path: "/classes",
    icon: BookOpen,
    roles: ["ADMIN", "TEACHER"],
  },
  { name: "Staff", path: "/teachers", icon: UserCheck, roles: ["ADMIN"] },
  { name: "Fees", path: "/fees", icon: CreditCard, roles: ["ADMIN", "STAFF"] },
  {
    name: "Messages",
    path: "/messages",
    icon: MessageSquare,
    roles: ["ADMIN", "TEACHER", "STAFF"],
  },
  { name: "Reports", path: "/reports", icon: BarChart2, roles: ["ADMIN"] },
  { name: "Settings", path: "/settings", icon: Settings, roles: ["ADMIN"] },
];

export default function Layout() {
  const lang = useLanguage();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const currentSearch = searchParams.get("search") || "";
  const searchInputRef = useRef<HTMLInputElement>(null);

  const userStr = localStorage.getItem("user");

  useEffect(() => {
    fetchAndApplySettings();
  }, []);
  const loggedInUser = userStr
    ? (() => {
        try {
          return JSON.parse(userStr);
        } catch {
          return {};
        }
      })()
    : {};
  const displayName =
    loggedInUser.name ||
    (loggedInUser.role === "ADMIN"
      ? "System Admin"
      : loggedInUser.role === "TEACHER"
        ? "Teacher"
        : "Staff");
  const displayRole = loggedInUser.role || "ADMIN";

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  const QUICK_LINKS = [
    { label: "Dashboard", path: "/", icon: LayoutDashboard },
    { label: "Students", path: "/students", icon: Users },
    { label: "Academic / Gradebook", path: "/classes", icon: BookOpen },
    { label: "Staff Management", path: "/teachers", icon: UserCheck },
    { label: "Reports & Analytics", path: "/reports", icon: BarChart2 },
    { label: "Settings", path: "/settings", icon: Settings },
  ];

  const filteredLinks = searchQuery
    ? QUICK_LINKS.filter((l) =>
        l.label.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : QUICK_LINKS;

  const handleGlobalSearch = (path: string) => {
    navigate(
      path +
        (searchQuery && path === "/students" ? `?search=${searchQuery}` : ""),
    );
    setSearchOpen(false);
    setSearchQuery("");
  };

  let roleDisplay = "ADMIN PORTAL";
  let userRole = displayRole;
  if (loggedInUser.role === "TEACHER") roleDisplay = "TEACHER PORTAL";
  else if (loggedInUser.role === "STAFF") roleDisplay = "STAFF PORTAL";

  const filteredNavItems = navItems.filter((item) =>
    item.roles.includes(userRole),
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const currentPath = location.pathname;
    const newSearchParams = new URLSearchParams(location.search);
    if (val) {
      newSearchParams.set("search", val);
    } else {
      newSearchParams.delete("search");
    }
    const searchString = newSearchParams.toString();
    navigate(`${currentPath}${searchString ? "?" + searchString : ""}`, {
      replace: true,
    });
  };

  return (
    <div className="flex h-screen bg-background font-sans text-foreground overflow-hidden selection:bg-primary/30">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Premium Theme */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-72 bg-card border-r border-border flex flex-col transform transition-transform duration-300 ease-in-out md:transform-none ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}
      >
        <div className="p-6 flex flex-col gap-1">
          <div className="flex items-center justify-between md:justify-start gap-3 mb-2">
            <div className="bg-primary p-2 rounded-xl text-primary-foreground shadow-lg shadow-indigo-500/30">
              <GraduationCap size={24} strokeWidth={2.5} />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-foreground leading-tight">
                Skill<span className="text-indigo-400">yon</span>
              </h2>
              <p className="text-[10px] font-bold text-muted-foreground tracking-[0.2em] uppercase">
                {roleDisplay}
              </p>
            </div>
            <button
              className="md:hidden text-muted-foreground hover:text-foreground ml-auto"
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
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-sm font-medium group ${
                  isActive
                    ? "text-primary bg-primary/10"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    size={18}
                    strokeWidth={isActive ? 2.5 : 2}
                    className={
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground group-hover:text-foreground transition-colors"
                    }
                  />
                  {t(item.name, lang)}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 space-y-3 mb-4">
          <button className="flex w-full items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-sm font-semibold text-foreground bg-muted hover:bg-muted/80 transition-all border border-border shadow-sm hover:shadow-md">
            <Headset size={18} />
            {t("Support Center", lang)}
          </button>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              window.location.href = "/login";
            }}
            className="flex w-full items-center justify-center gap-2 px-4 py-3.5 rounded-xl text-sm font-semibold text-red-400 bg-red-400/10 hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
          >
            <LogOut size={18} />
            {t("Sign Out", lang)}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col w-full md:w-auto h-full overflow-hidden bg-background relative">
        {/* Top Header */}
        <header className="h-16 shrink-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border flex items-center justify-between px-6 lg:px-8 z-10 sticky top-0">
          <div className="flex items-center flex-1 gap-4">
            <button
              className="md:hidden p-2 -ml-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>

            {/* Search Input */}
            <div className="hidden sm:flex items-center relative w-full max-w-md bg-muted/50 border border-transparent hover:bg-muted/80 focus-within:bg-background focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50 rounded-lg transition-all group">
              <Search
                size={16}
                className="text-muted-foreground absolute left-3 group-focus-within:text-primary transition-colors"
              />
              <input
                ref={searchInputRef}
                type="text"
                placeholder={t("Search students, classes, or reports...", lang)}
                value={currentSearch}
                onChange={handleSearchChange}
                className="w-full bg-transparent border-none outline-none py-2 pl-9 pr-12 text-sm text-foreground placeholder:text-muted-foreground font-medium"
              />
              <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] font-semibold bg-background border border-border text-muted-foreground px-1.5 py-0.5 rounded shadow-sm">
                ⌘K
              </kbd>
            </div>
          </div>

          <div className="flex items-center gap-4 lg:gap-6 ml-4">
            <ThemeToggle />
            <button className="flex items-center gap-3 group">
              <div className="hidden sm:block text-right">
                <div className="text-sm font-semibold text-foreground leading-tight group-hover:text-primary transition-colors">
                  {displayName}
                </div>
                <div className="text-xs text-muted-foreground font-medium">
                  {displayRole}
                </div>
              </div>
              <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold shadow-sm shrink-0">
                {displayName
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .substring(0, 2)
                  .toUpperCase()}
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
