import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  Menu,
  X,
  User,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  Users,
  Briefcase,
  Layers,
  Laptop,
  HelpCircle,
  BarChart3,
  Bot,
  Clock,
  Calendar,
  DollarSign,
  Award,
  Bell,
  Settings,
  Shield,
  Key,
} from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const currentRole = user?.role || 'Employee';
  const isAdmin = ['SuperAdmin', 'OrgAdmin'].includes(currentRole);

  const links = [
    { to: '/', label: 'Home Dashboard', icon: LayoutDashboard, roles: ['SuperAdmin', 'OrgAdmin', 'Manager', 'Employee'] },
    { to: '/employees/directory', label: 'Employee Directory', icon: Users, roles: ['SuperAdmin', 'OrgAdmin', 'Manager', 'Employee'] },
    { to: '/recruitment', label: 'Recruitment Board', icon: Briefcase, roles: ['SuperAdmin', 'OrgAdmin', 'Manager', 'Employee'] },
    { to: '/projects', label: 'Project Dashboard', icon: Layers, roles: ['SuperAdmin', 'OrgAdmin', 'Manager', 'Employee'] },
    { to: '/assets', label: 'Asset Registry', icon: Laptop, roles: ['SuperAdmin', 'OrgAdmin', 'Manager', 'Employee'] },
    { to: '/helpdesk', label: 'Support Center', icon: HelpCircle, roles: ['SuperAdmin', 'OrgAdmin', 'Manager', 'Employee'] },
    { to: '/reports', label: 'Analytics Console', icon: BarChart3, roles: ['SuperAdmin', 'OrgAdmin', 'Manager', 'Employee'] },
    { to: '/ai-assistant', label: 'AI Operations', icon: Bot, roles: ['SuperAdmin', 'OrgAdmin', 'Manager', 'Employee'] },
    { to: '/attendance', label: 'Attendance Hub', icon: Clock, roles: ['SuperAdmin', 'OrgAdmin', 'Manager', 'Employee'] },
    { to: '/leaves', label: 'Leave Center', icon: Calendar, roles: ['SuperAdmin', 'OrgAdmin', 'Manager', 'Employee'] },
    { to: '/payroll', label: 'Payroll Hub', icon: DollarSign, roles: ['SuperAdmin', 'OrgAdmin', 'Manager', 'Employee'] },
    { to: '/performance', label: 'Performance Hub', icon: Award, roles: ['SuperAdmin', 'OrgAdmin', 'Manager', 'Employee'] },
    { to: '/notifications', label: 'Notifications', icon: Bell, roles: ['SuperAdmin', 'OrgAdmin', 'Manager', 'Employee'] },
  ];

  const adminLinks = [
    { to: '/organization/settings', label: 'Org Settings', icon: Settings },
    { to: '/organization/departments', label: 'Departments', icon: Shield },
    { to: '/organization/designations', label: 'Designations', icon: Key },
  ];

  const getPageTitle = () => {
    const allLinks = [...links, ...adminLinks, { to: '/profile', label: 'My Profile' }, { to: '/change-password', label: 'Change Password' }];
    const match = allLinks.find((l) => l.to === location.pathname);
    if (match) return match.label;
    if (location.pathname.startsWith('/employees/')) return 'Employee Profile';
    if (location.pathname.startsWith('/candidates/')) return 'Candidate Profile';
    if (location.pathname.startsWith('/helpdesk/tickets/')) return 'Ticket details';
    return 'Enterprise Workforce Platform';
  };

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 font-sans flex relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-indigo-600/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-violet-600/5 blur-[120px] pointer-events-none" />

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 lg:hidden"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 w-64 bg-slate-950/80 backdrop-blur-xl border-r border-slate-900 z-40 transform transition-transform duration-300 lg:translate-x-0 lg:static flex flex-col ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-slate-900 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2" onClick={() => setSidebarOpen(false)}>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center font-bold text-white text-sm">
              WFM
            </div>
            <span className="font-extrabold text-slate-100 text-lg tracking-tight">Enterprise WFM</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-slate-200">
            <X size={20} />
          </button>
        </div>

        {/* Sidebar Links */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1.5 scrollbar-thin">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 mb-2">
            Modules
          </div>
          {links
            .filter((link) => link.roles.includes(currentRole))
            .map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border-l-2 border-indigo-500 text-indigo-400 font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                  }`}
                >
                  <Icon size={18} />
                  <span>{link.label}</span>
                </Link>
              );
            })}

          {isAdmin && (
            <>
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-3 pt-6 mb-2">
                Administration
              </div>
              {adminLinks.map((link) => {
                const Icon = link.icon;
                const isActive = location.pathname === link.to;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border-l-2 border-indigo-500 text-indigo-400 font-bold'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                    }`}
                  >
                    <Icon size={18} />
                    <span>{link.label}</span>
                  </Link>
                );
              })}
            </>
          )}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 border-b border-slate-900 bg-slate-950/40 backdrop-blur-md flex items-center justify-between px-6 z-20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-slate-400 hover:text-slate-200 transition-colors"
            >
              <Menu size={22} />
            </button>
            <h2 className="text-lg font-bold text-slate-200 hidden sm:block">
              {getPageTitle()}
            </h2>
          </div>

          {/* User profile dropdown menu */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-slate-900/60 transition-all duration-200"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center font-bold text-white text-xs">
                {user?.name ? user.name.substring(0, 2).toUpperCase() : 'US'}
              </div>
              <span className="text-sm font-semibold text-slate-300 hidden md:block">{user?.name}</span>
              <ChevronDown size={14} className="text-slate-500" />
            </button>

            {profileDropdownOpen && (
              <>
                <div
                  onClick={() => setProfileDropdownOpen(false)}
                  className="fixed inset-0 z-40 cursor-default"
                />
                <div className="absolute right-0 mt-2 w-48 bg-slate-950/95 border border-slate-900 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2 border-b border-slate-900 text-xs">
                    <div className="font-bold text-slate-300">{user?.name}</div>
                    <div className="text-slate-500 mt-0.5 truncate">{user?.email}</div>
                  </div>
                  <div className="py-1">
                    <Link
                      to="/profile"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 transition-colors"
                    >
                      <User size={16} />
                      Profile
                    </Link>
                    <Link
                      to="/change-password"
                      onClick={() => setProfileDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 transition-colors"
                    >
                      <Key size={16} />
                      Change Password
                    </Link>
                    <button
                      onClick={() => {
                        setProfileDropdownOpen(false);
                        handleLogout();
                      }}
                      className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-rose-400 hover:text-rose-300 hover:bg-rose-950/20 transition-colors cursor-pointer"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Dynamic Outlet */}
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
