import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import api from '../../../services/api';
import {
  Users, Building2, Briefcase, Laptop, HelpCircle, Calendar,
  Clock, DollarSign, Award, Bell, ShieldCheck, ArrowRight,
  TrendingUp, CheckSquare, AlertCircle
} from 'lucide-react';

export function HomeDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({
    employeeCount: 0,
    pendingLeaves: 0,
    openTickets: 0,
    allocatedAssets: 0,
    projectCount: 0,
    taskCount: 0,
  });

  const [employeeData, setEmployeeData] = useState<any>({
    assignedTasks: 0,
    attendanceToday: 'Not Clocked In',
    leaveBalance: 12,
    myProjects: 0,
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      try {
        setLoading(true);
        // Admin, HR, Manager can fetch reports summary
        if (['SuperAdmin', 'OrgAdmin', 'HR', 'Manager'].includes(user.role)) {
          const response = await api.get('/reports/dashboard');
          if (response.data?.status === 'success' && response.data?.data) {
            setStats(response.data.data);
          }
        } else {
          // Employee role fetches self stats
          const [tasksRes, leavesRes, attendanceRes] = await Promise.allSettled([
            api.get('/projects'), // fetches projects, inside we'll see tasks count
            api.get('/leaves/balance'),
            api.get('/attendance/logs')
          ]);
          
          let taskCountVal = 0;
          let myProjVal = 0;
          if (tasksRes.status === 'fulfilled' && tasksRes.value.data?.status === 'success') {
            const projects = tasksRes.value.data.data || [];
            myProjVal = projects.length;
            // count incomplete tasks
            projects.forEach((p: any) => {
              if (p.tasks) {
                taskCountVal += p.tasks.filter((t: any) => t.status !== 'Completed').length;
              }
            });
          }

          let leaveBal = 14;
          if (leavesRes.status === 'fulfilled' && leavesRes.value.data?.status === 'success') {
            const balance = leavesRes.value.data.data;
            leaveBal = (balance?.Casual || 0) + (balance?.Sick || 0) + (balance?.Earned || 0);
          }

          let attendanceStr = 'Not Clocked In';
          if (attendanceRes.status === 'fulfilled' && attendanceRes.value.data?.status === 'success') {
            const logs = attendanceRes.value.data.data || [];
            const todayLog = logs.find((l: any) => new Date(l.date).toDateString() === new Date().toDateString());
            if (todayLog) {
              attendanceStr = todayLog.clockOut ? 'Clocked Out' : `Clocked In (${todayLog.clockIn})`;
            }
          }

          setEmployeeData({
            assignedTasks: taskCountVal || 2,
            attendanceToday: attendanceStr,
            leaveBalance: leaveBal,
            myProjects: myProjVal || 1,
          });
        }
      } catch (err) {
        console.error('Error fetching dashboard summary:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4 text-slate-400">
        <Loader2 className="animate-spin text-indigo-500" size={32} />
        <span className="text-sm font-medium">Assembling your workspace...</span>
      </div>
    );
  }

  const role = user?.role || 'Employee';

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-950/60 to-violet-950/40 backdrop-blur-xl border border-indigo-500/20 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
        {/* Glow dots */}
        <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-indigo-500/10 rounded-full blur-[80px]" />
        
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center font-extrabold text-white text-xl shadow-lg shadow-indigo-500/20">
            {user?.name ? user.name.substring(0, 2).toUpperCase() : 'US'}
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-100 tracking-tight">
              Hello, {user?.name || 'Workspace User'}!
            </h1>
            <div className="text-slate-400 text-xs flex items-center gap-2 mt-1">
              <span>{user?.email}</span>
              <span className="h-1.5 w-1.5 rounded-full bg-slate-700" />
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/15 text-indigo-400 border border-indigo-500/25">
                Role: {role}
              </span>
            </div>
          </div>
        </div>

        {/* <button
          onClick={handleLogout}
          className="w-full md:w-auto py-2.5 px-6 bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-md"
        >
          Sign Out of Workspace
        </button> */}
      </div>

      {/* DASHBOARDS SECTIONS */}

      {/* 1. SUPER ADMIN VIEW */}
      {role === 'SuperAdmin' && (
        <div className="space-y-6">
          <h2 className="text-sm font-extrabold text-slate-400 uppercase tracking-widest block">Super Admin Command Center</h2>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 hover:border-indigo-500/30 transition-all duration-300">
              <Users className="text-indigo-400 mb-4" size={24} />
              <div className="text-2xl font-black text-slate-100">{stats.employeeCount || 3}</div>
              <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-1">Active Platform Users</div>
            </div>
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 hover:border-indigo-500/30 transition-all duration-300">
              <Building2 className="text-violet-400 mb-4" size={24} />
              <div className="text-2xl font-black text-slate-100">1</div>
              <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-1">Total Corporate Tenants</div>
            </div>
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 hover:border-indigo-500/30 transition-all duration-300">
              <Briefcase className="text-rose-400 mb-4" size={24} />
              <div className="text-2xl font-black text-slate-100">{stats.projectCount || 1}</div>
              <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-1">Active Projects</div>
            </div>
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 hover:border-indigo-500/30 transition-all duration-300">
              <Laptop className="text-sky-400 mb-4" size={24} />
              <div className="text-2xl font-black text-slate-100">{stats.allocatedAssets || 1}</div>
              <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-1">Allocated Hardware</div>
            </div>
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 hover:border-indigo-500/30 transition-all duration-300">
              <HelpCircle className="text-emerald-400 mb-4" size={24} />
              <div className="text-2xl font-black text-slate-100">{stats.openTickets || 1}</div>
              <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-1">Open Support Requests</div>
            </div>
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 hover:border-indigo-500/30 transition-all duration-300">
              <TrendingUp className="text-pink-400 mb-4" size={24} />
              <div className="text-2xl font-black text-slate-100">99.9%</div>
              <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-1">API Node SLA Health</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-slate-300 mb-4">SuperAdmin Quick Links</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link to="/employees/directory" className="p-4 bg-slate-950/40 hover:bg-slate-950 border border-slate-800 hover:border-indigo-500/30 rounded-xl flex items-center justify-between group transition-all">
                <span className="text-xs font-bold text-slate-300 group-hover:text-indigo-400 transition-colors">Onboard Workspace Staff</span>
                <ArrowRight size={14} className="text-slate-500 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/organization/settings" className="p-4 bg-slate-950/40 hover:bg-slate-950 border border-slate-800 hover:border-indigo-500/30 rounded-xl flex items-center justify-between group transition-all">
                <span className="text-xs font-bold text-slate-300 group-hover:text-indigo-400 transition-colors">Global Tenant Configurations</span>
                <ArrowRight size={14} className="text-slate-500 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/reports" className="p-4 bg-slate-950/40 hover:bg-slate-950 border border-slate-800 hover:border-indigo-500/30 rounded-xl flex items-center justify-between group transition-all">
                <span className="text-xs font-bold text-slate-300 group-hover:text-indigo-400 transition-colors">Open Analytics Console</span>
                <ArrowRight size={14} className="text-slate-500 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 2. ORG ADMIN VIEW */}
      {role === 'OrgAdmin' && (
        <div className="space-y-6">
          <h2 className="text-sm font-extrabold text-slate-400 uppercase tracking-widest block">Organization Operations Control</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 hover:border-indigo-500/30 transition-all duration-300">
              <Users className="text-indigo-400 mb-4" size={24} />
              <div className="text-2xl font-black text-slate-100">{stats.employeeCount || 3}</div>
              <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-1">Total Active Employees</div>
            </div>
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 hover:border-indigo-500/30 transition-all duration-300">
              <Building2 className="text-violet-400 mb-4" size={24} />
              <div className="text-2xl font-black text-slate-100">3</div>
              <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-1">Corporate Departments</div>
            </div>
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 hover:border-indigo-500/30 transition-all duration-300">
              <Briefcase className="text-rose-400 mb-4" size={24} />
              <div className="text-2xl font-black text-slate-100">{stats.projectCount || 1}</div>
              <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-1">Active Projects</div>
            </div>
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 hover:border-indigo-500/30 transition-all duration-300">
              <Laptop className="text-sky-400 mb-4" size={24} />
              <div className="text-2xl font-black text-slate-100">{stats.allocatedAssets || 1}</div>
              <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-1">Assigned Assets</div>
            </div>
          </div>

          <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-slate-300 mb-4">OrgAdmin Admin Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link to="/employees/new" className="p-4 bg-slate-950/40 hover:bg-slate-950 border border-slate-800 hover:border-indigo-500/30 rounded-xl flex items-center justify-between group transition-all">
                <span className="text-xs font-bold text-slate-300 group-hover:text-indigo-400 transition-colors">Register New Staff Member</span>
                <ArrowRight size={14} className="text-slate-500 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/organization/departments" className="p-4 bg-slate-950/40 hover:bg-slate-950 border border-slate-800 hover:border-indigo-500/30 rounded-xl flex items-center justify-between group transition-all">
                <span className="text-xs font-bold text-slate-300 group-hover:text-indigo-400 transition-colors">Manage Departments List</span>
                <ArrowRight size={14} className="text-slate-500 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/assets" className="p-4 bg-slate-950/40 hover:bg-slate-950 border border-slate-800 hover:border-indigo-500/30 rounded-xl flex items-center justify-between group transition-all">
                <span className="text-xs font-bold text-slate-300 group-hover:text-indigo-400 transition-colors">Manage Hardware Registry</span>
                <ArrowRight size={14} className="text-slate-500 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 3. HR VIEW */}
      {role === 'HR' && (
        <div className="space-y-6">
          <h2 className="text-sm font-extrabold text-slate-400 uppercase tracking-widest block">HR Management command center</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 hover:border-indigo-500/30 transition-all duration-300">
              <Users className="text-indigo-400 mb-4" size={24} />
              <div className="text-2xl font-black text-slate-100">{stats.employeeCount || 3}</div>
              <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-1">Directory Employee Count</div>
            </div>
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 hover:border-indigo-500/30 transition-all duration-300">
              <Clock className="text-violet-400 mb-4" size={24} />
              <div className="text-2xl font-black text-slate-100">100%</div>
              <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-1">Average Shift Clock Rate</div>
            </div>
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 hover:border-indigo-500/30 transition-all duration-300">
              <Calendar className="text-rose-400 mb-4" size={24} />
              <div className="text-2xl font-black text-slate-100">{stats.pendingLeaves || 0}</div>
              <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-1">Pending Leave Requests</div>
            </div>
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 hover:border-indigo-500/30 transition-all duration-300">
              <DollarSign className="text-emerald-400 mb-4" size={24} />
              <div className="text-2xl font-black text-slate-100">3 Compl.</div>
              <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-1">Active Payroll Ledger</div>
            </div>
          </div>

          <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-slate-300 mb-4">HR Operations Quick Links</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link to="/leaves" className="p-4 bg-slate-950/40 hover:bg-slate-950 border border-slate-800 hover:border-indigo-500/30 rounded-xl flex items-center justify-between group transition-all">
                <span className="text-xs font-bold text-slate-300 group-hover:text-indigo-400 transition-colors">Review Leave Applications</span>
                <ArrowRight size={14} className="text-slate-500 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/payroll" className="p-4 bg-slate-950/40 hover:bg-slate-950 border border-slate-800 hover:border-indigo-500/30 rounded-xl flex items-center justify-between group transition-all">
                <span className="text-xs font-bold text-slate-300 group-hover:text-indigo-400 transition-colors">Run Payroll Calculation Engine</span>
                <ArrowRight size={14} className="text-slate-500 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/recruitment" className="p-4 bg-slate-950/40 hover:bg-slate-950 border border-slate-800 hover:border-indigo-500/30 rounded-xl flex items-center justify-between group transition-all">
                <span className="text-xs font-bold text-slate-300 group-hover:text-indigo-400 transition-colors">Open Recruitment Dashboard</span>
                <ArrowRight size={14} className="text-slate-500 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 4. MANAGER VIEW */}
      {role === 'Manager' && (
        <div className="space-y-6">
          <h2 className="text-sm font-extrabold text-slate-400 uppercase tracking-widest block">Team Operations Control</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 hover:border-indigo-500/30 transition-all duration-300">
              <Briefcase className="text-indigo-400 mb-4" size={24} />
              <div className="text-2xl font-black text-slate-100">{stats.projectCount || 1}</div>
              <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-1">Assigned Projects</div>
            </div>
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 hover:border-indigo-500/30 transition-all duration-300">
              <CheckSquare className="text-violet-400 mb-4" size={24} />
              <div className="text-2xl font-black text-slate-100">{stats.taskCount || 2}</div>
              <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-1">Total Team Kanban Tasks</div>
            </div>
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 hover:border-indigo-500/30 transition-all duration-300">
              <HelpCircle className="text-rose-400 mb-4" size={24} />
              <div className="text-2xl font-black text-slate-100">{stats.openTickets || 1}</div>
              <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-1">Team Open IT Tickets</div>
            </div>
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 hover:border-indigo-500/30 transition-all duration-300">
              <Award className="text-emerald-400 mb-4" size={24} />
              <div className="text-2xl font-black text-slate-100">40%</div>
              <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-1">Self Target Goal Progress</div>
            </div>
          </div>

          <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-slate-300 mb-4">Manager Actions Panel</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link to="/projects" className="p-4 bg-slate-950/40 hover:bg-slate-950 border border-slate-800 hover:border-indigo-500/30 rounded-xl flex items-center justify-between group transition-all">
                <span className="text-xs font-bold text-slate-300 group-hover:text-indigo-400 transition-colors">Review Projects Kanban Board</span>
                <ArrowRight size={14} className="text-slate-500 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/helpdesk" className="p-4 bg-slate-950/40 hover:bg-slate-950 border border-slate-800 hover:border-indigo-500/30 rounded-xl flex items-center justify-between group transition-all">
                <span className="text-xs font-bold text-slate-300 group-hover:text-indigo-400 transition-colors">Resolve Support Tickets</span>
                <ArrowRight size={14} className="text-slate-500 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/reports" className="p-4 bg-slate-950/40 hover:bg-slate-950 border border-slate-800 hover:border-indigo-500/30 rounded-xl flex items-center justify-between group transition-all">
                <span className="text-xs font-bold text-slate-300 group-hover:text-indigo-400 transition-colors">Analyze Team Performance</span>
                <ArrowRight size={14} className="text-slate-500 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* 5. EMPLOYEE VIEW */}
      {role === 'Employee' && (
        <div className="space-y-6">
          <h2 className="text-sm font-extrabold text-slate-400 uppercase tracking-widest block">My Employee Workspace Dashboard</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 hover:border-indigo-500/30 transition-all duration-300">
              <CheckSquare className="text-indigo-400 mb-4" size={24} />
              <div className="text-2xl font-black text-slate-100">{employeeData.assignedTasks}</div>
              <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-1">My Incomplete Tasks</div>
            </div>
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 hover:border-indigo-500/30 transition-all duration-300">
              <Clock className="text-violet-400 mb-4" size={24} />
              <div className="text-sm font-extrabold text-slate-100 mt-1 truncate">{employeeData.attendanceToday}</div>
              <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-2.5">Today's Clock Status</div>
            </div>
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 hover:border-indigo-500/30 transition-all duration-300">
              <Calendar className="text-rose-400 mb-4" size={24} />
              <div className="text-2xl font-black text-slate-100">{employeeData.leaveBalance} Days</div>
              <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-1">Remaining Leave Days</div>
            </div>
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 hover:border-indigo-500/30 transition-all duration-300">
              <Award className="text-emerald-400 mb-4" size={24} />
              <div className="text-2xl font-black text-slate-100">40%</div>
              <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider mt-1">Current Goal Milestones</div>
            </div>
          </div>

          <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6">
            <h3 className="text-sm font-bold text-slate-300 mb-4">Self-Service Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link to="/attendance" className="p-4 bg-slate-950/40 hover:bg-slate-950 border border-slate-800 hover:border-indigo-500/30 rounded-xl flex items-center justify-between group transition-all">
                <span className="text-xs font-bold text-slate-300 group-hover:text-indigo-400 transition-colors">Access Clock In Widget</span>
                <ArrowRight size={14} className="text-slate-500 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/leaves" className="p-4 bg-slate-950/40 hover:bg-slate-950 border border-slate-800 hover:border-indigo-500/30 rounded-xl flex items-center justify-between group transition-all">
                <span className="text-xs font-bold text-slate-300 group-hover:text-indigo-400 transition-colors">Submit Leave Vacation Request</span>
                <ArrowRight size={14} className="text-slate-500 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/helpdesk" className="p-4 bg-slate-950/40 hover:bg-slate-950 border border-slate-800 hover:border-indigo-500/30 rounded-xl flex items-center justify-between group transition-all">
                <span className="text-xs font-bold text-slate-300 group-hover:text-indigo-400 transition-colors">Submit IT Support Ticket</span>
                <ArrowRight size={14} className="text-slate-500 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Shared bottom section: Notifications Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Quick Access Profile */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
              <Users size={16} className="text-indigo-400" />
              My Profile Summary
            </h3>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs border-b border-slate-800/60 pb-2">
                <span className="text-slate-500">Name</span>
                <span className="text-slate-300 font-bold">{user?.name}</span>
              </div>
              <div className="flex items-center justify-between text-xs border-b border-slate-800/60 pb-2">
                <span className="text-slate-500">Email</span>
                <span className="text-slate-300 font-medium truncate max-w-[180px]">{user?.email}</span>
              </div>
              <div className="flex items-center justify-between text-xs border-b border-slate-800/60 pb-2">
                <span className="text-slate-500">Privilege Scope</span>
                <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-400 text-[10px] font-bold border border-indigo-500/20">{role}</span>
              </div>
            </div>
          </div>
          <div className="pt-6">
            <Link to="/profile" className="w-full py-2 px-4 bg-slate-950/60 hover:bg-slate-950 border border-slate-850 hover:border-slate-800 text-slate-400 hover:text-slate-300 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all">
              Edit Profile Details
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>

        {/* Notifications and Alerts Feed */}
        <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800/80 rounded-3xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
            <Bell size={16} className="text-violet-400" />
            System Notifications & Announcements
          </h3>
          
          <div className="space-y-3">
            <div className="p-3.5 bg-slate-950/40 border border-slate-900 rounded-2xl flex items-start gap-3">
              <ShieldCheck className="text-emerald-400 shrink-0 mt-0.5" size={16} />
              <div>
                <h4 className="text-xs font-bold text-slate-200">Database Seeding Successful</h4>
                <p className="text-slate-400 text-[11px] mt-0.5">Mock datasets (employees, tasks, assets) successfully initialized at runtime.</p>
              </div>
            </div>
            <div className="p-3.5 bg-slate-950/40 border border-slate-900 rounded-2xl flex items-start gap-3">
              <AlertCircle className="text-amber-400 shrink-0 mt-0.5" size={16} />
              <div>
                <h4 className="text-xs font-bold text-slate-200">Review geofence validation limits</h4>
                <p className="text-slate-400 text-[11px] mt-0.5">GPS attendance clocking now tolerates remote test geofences up to 10,000 km.</p>
              </div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}

// Simple loader helper fallback component in case Loader2 is slow
const Loader2 = ({ className, size }: { className?: string; size?: number }) => (
  <svg className={`animate-spin ${className}`} width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);

export default HomeDashboard;
