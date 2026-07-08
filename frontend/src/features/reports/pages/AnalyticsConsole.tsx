import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import reportService from '../services/reportService';
import { ProjectStats, TaskStats, AssetStats, TicketStats, DashboardSummary } from '../types/reportTypes';
import { BarChart3, Users, Clock, AlertCircle, Laptop, BookOpen, Layers, CheckSquare, Loader2, ShieldAlert } from 'lucide-react';

const RenderDonutChart: React.FC<{
  data: { label: string; value: number; color: string }[];
  total: number;
}> = ({ data, total }) => {
  let accumulatedPercent = 0;
  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
      <div className="relative w-36 h-36 flex-shrink-0">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="15.915" fill="none" stroke="#1e293b" strokeWidth="3" />
          {data.map((item, idx) => {
            if (total === 0) return null;
            const percent = (item.value / total) * 100;
            if (percent === 0) return null;
            const strokeDasharray = `${percent} ${100 - percent}`;
            const strokeDashoffset = 100 - accumulatedPercent;
            accumulatedPercent += percent;
            return (
              <circle
                key={idx}
                cx="18"
                cy="18"
                r="15.915"
                fill="none"
                stroke={item.color}
                strokeWidth="3.2"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-500"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-extrabold text-slate-100">{total}</span>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Tasks</span>
        </div>
      </div>

      <div className="flex-1 space-y-2.5 w-full">
        {data.map((item, idx) => {
          const pct = total > 0 ? (item.value / total) * 100 : 0;
          return (
            <div key={idx} className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-300 font-semibold">{item.label}</span>
              </div>
              <span className="text-slate-400 font-bold">{item.value} ({pct.toFixed(0)}%)</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const RenderBarChart: React.FC<{
  data: { label: string; value: number; color: string }[];
  total: number;
}> = ({ data, total }) => {
  const maxVal = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 h-48 pt-4 px-2 border-b border-slate-800">
        {data.map((item, idx) => {
          const heightPercent = (item.value / maxVal) * 80;
          return (
            <div key={idx} className="flex-1 flex flex-col items-center gap-2 group relative">
              <div className="absolute -top-8 px-2 py-1 rounded bg-slate-950 border border-slate-800 text-[10px] font-bold text-slate-200 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                {item.value} Projects ({total > 0 ? ((item.value / total) * 100).toFixed(0) : 0}%)
              </div>
              
              <div
                className="w-full sm:w-10 rounded-t-lg transition-all duration-500 hover:brightness-110 cursor-pointer"
                style={{
                  height: `${heightPercent || 4}%`,
                  backgroundColor: item.color,
                }}
              />
              
              <span className="text-[10px] text-slate-400 font-medium tracking-wide truncate max-w-full text-center mt-1">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const RenderPieChart: React.FC<{
  data: { label: string; value: number; color: string }[];
  total: number;
}> = ({ data, total }) => {
  let accumulatedPercent = 0;
  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
      <div className="relative w-36 h-36 flex-shrink-0">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="15.915" fill="none" stroke="#1e293b" strokeWidth="6" />
          {data.map((item, idx) => {
            if (total === 0) return null;
            const percent = (item.value / total) * 100;
            if (percent === 0) return null;
            const strokeDasharray = `${percent} ${100 - percent}`;
            const strokeDashoffset = 100 - accumulatedPercent;
            accumulatedPercent += percent;
            return (
              <circle
                key={idx}
                cx="18"
                cy="18"
                r="15.915"
                fill="none"
                stroke={item.color}
                strokeWidth="6"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-500"
              />
            );
          })}
        </svg>
      </div>

      <div className="flex-1 space-y-2.5 w-full">
        {data.map((item, idx) => {
          const pct = total > 0 ? (item.value / total) * 100 : 0;
          return (
            <div key={idx} className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span className="text-slate-300 font-semibold">{item.label}</span>
              </div>
              <span className="text-slate-400 font-bold">{item.value} ({pct.toFixed(0)}%)</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const AnalyticsConsole: React.FC = () => {
  const { user, login } = useAuth();

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [projectStats, setProjectStats] = useState<ProjectStats | null>(null);
  const [taskStats, setTaskStats] = useState<TaskStats | null>(null);
  const [assetStats, setAssetStats] = useState<AssetStats | null>(null);
  const [ticketStats, setTicketStats] = useState<TicketStats | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fallback dev login
  useEffect(() => {
    if (!user) {
      login('dummy-token', {
        id: '603d2e1b12cf000000000005',
        name: 'Sarah Connor',
        email: 'sarah.connor@wfm.com',
        role: 'OrgAdmin',
        orgId: '603d2e1b12cf000000000001',
      });
    }
  }, [user, login]);

  const loadAnalyticsData = async () => {
    if (!user || user.role === 'Employee') return;
    setIsLoading(true);
    setError(null);
    try {
      const [sum, proj, task, asset, ticket] = await Promise.all([
        reportService.getDashboardSummary(),
        reportService.getProjectStats(),
        reportService.getTaskStats(),
        reportService.getAssetStats(),
        reportService.getTicketStats(),
      ]);
      setSummary(sum);
      setProjectStats(proj);
      setTaskStats(task);
      setAssetStats(asset);
      setTicketStats(ticket);
    } catch (err: any) {
      console.error('Failed to load reports metrics:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch report aggregates');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAnalyticsData();
  }, [user]);

  const handleRoleChange = (role: string) => {
    login('dummy-token', {
      id: '603d2e1b12cf000000000005',
      name: 'Sarah Connor',
      email: 'sarah.connor@wfm.com',
      role: role,
      orgId: '603d2e1b12cf000000000001',
    });
  };

  const currentRole = user?.role || 'OrgAdmin';
  const hasAccess = ['SuperAdmin', 'OrgAdmin', 'Manager'].includes(currentRole);

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-[#0b0f19] text-slate-100 font-sans p-6 md:p-10 flex flex-col items-center justify-center">
        {/* Dev Sandbox Role Switcher */}
        <div className="w-full max-w-xl mb-8 p-4 bg-slate-900/50 border border-slate-800/80 rounded-2xl flex flex-wrap items-center justify-between gap-4 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-violet-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">🔧 Dev Sandbox: Role Switcher</span>
          </div>
          <div className="flex gap-2">
            {['SuperAdmin', 'OrgAdmin', 'Manager', 'Employee'].map((role) => (
              <button
                key={role}
                onClick={() => handleRoleChange(role)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold border cursor-pointer ${
                  currentRole === role
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-transparent'
                    : 'bg-slate-800 text-slate-400 border-slate-700/60'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        <div className="max-w-md w-full p-8 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-4 shadow-2xl">
          <ShieldAlert size={48} className="mx-auto text-rose-500 animate-bounce" />
          <h2 className="text-xl font-bold text-slate-100">Access Restricted</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            The Analytics Console is restricted to administrative and management roles only. Switch your sandbox role above to test access states.
          </p>
        </div>
      </div>
    );
  }

  // Map project stats for bar charts
  const mappedProjects = projectStats
    ? [
        { label: 'Planning', value: projectStats.statusCounts.Planning, color: '#3b82f6' },
        { label: 'Active', value: projectStats.statusCounts.Active, color: '#10b981' },
        { label: 'Completed', value: projectStats.statusCounts.Completed, color: '#6366f1' },
        { label: 'On Hold', value: projectStats.statusCounts.OnHold, color: '#f59e0b' },
      ]
    : [];

  // Map task stats for donut charts
  const mappedTasks = taskStats
    ? [
        { label: 'Todo', value: taskStats.statusCounts.Todo, color: '#64748b' },
        { label: 'In Progress', value: taskStats.statusCounts.InProgress, color: '#3b82f6' },
        { label: 'In Review', value: taskStats.statusCounts.Review, color: '#f59e0b' },
        { label: 'Completed', value: taskStats.statusCounts.Completed, color: '#10b981' },
      ]
    : [];

  // Map asset stats for pie charts
  const mappedAssets = assetStats
    ? [
        { label: 'Hardware', value: assetStats.typeCounts.Hardware, color: '#8b5cf6' },
        { label: 'Software', value: assetStats.typeCounts.Software, color: '#06b6d4' },
        { label: 'Furniture', value: assetStats.typeCounts.Furniture, color: '#f59e0b' },
      ]
    : [];

  // Map ticket stats for bar charts
  const mappedTickets = ticketStats
    ? [
        { label: 'IT', value: ticketStats.categoryCounts.IT, color: '#3b82f6' },
        { label: 'HR', value: ticketStats.categoryCounts.HR, color: '#10b981' },
        { label: 'Facilities', value: ticketStats.categoryCounts.Facilities, color: '#f59e0b' },
        { label: 'Finance', value: ticketStats.categoryCounts.Finance, color: '#ec4899' },
      ]
    : [];

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 font-sans p-6 md:p-10">
      {/* Dev Sandbox Role Switcher */}
      <div className="mb-8 p-4 bg-slate-900/50 border border-slate-800/80 rounded-2xl flex flex-wrap items-center justify-between gap-4 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-violet-500 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">🔧 Dev Sandbox: Role Switcher</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {['SuperAdmin', 'OrgAdmin', 'Manager', 'Employee'].map((role) => (
            <button
              key={role}
              onClick={() => handleRoleChange(role)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all duration-200 cursor-pointer ${
                currentRole === role
                  ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-transparent shadow-lg shadow-violet-950/40'
                  : 'bg-slate-800/60 text-slate-400 border-slate-700/60 hover:text-slate-200'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-100 flex items-center gap-2.5">
          <BarChart3 className="text-violet-500" size={28} />
          Analytics Console
        </h1>
        <p className="text-slate-400 text-sm mt-1.5">
          Visual metrics analysis, department statistics, device inventory distribution ratios, and support ticket log aggregates.
        </p>
      </div>

      {error && (
        <div className="mb-8 p-4 bg-rose-600/10 border border-rose-500/20 text-rose-400 rounded-2xl flex items-center gap-3">
          <ShieldAlert size={20} />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 className="animate-spin text-violet-500" size={44} />
          <p className="text-slate-400 text-sm">Compiling platform aggregate analytics...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Dashboard summaries metrics */}
          {summary && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900/40 border border-slate-800/60 p-5 rounded-2xl flex items-center justify-between shadow-lg">
                <div>
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Total Staff</p>
                  <p className="text-3xl font-bold text-slate-100 mt-1">{summary.employeeCount}</p>
                </div>
                <Users className="text-violet-500/20" size={36} />
              </div>

              <div className="bg-slate-900/40 border border-slate-800/60 p-5 rounded-2xl flex items-center justify-between shadow-lg">
                <div>
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Pending Leaves</p>
                  <p className="text-3xl font-bold text-slate-100 mt-1">{summary.pendingLeaves}</p>
                </div>
                <Clock className="text-blue-500/20" size={36} />
              </div>

              <div className="bg-slate-900/40 border border-slate-800/60 p-5 rounded-2xl flex items-center justify-between shadow-lg">
                <div>
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Open Tickets</p>
                  <p className="text-3xl font-bold text-slate-100 mt-1">{summary.openTickets}</p>
                </div>
                <AlertCircle className="text-amber-500/20" size={36} />
              </div>

              <div className="bg-slate-900/40 border border-slate-800/60 p-5 rounded-2xl flex items-center justify-between shadow-lg">
                <div>
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Allocated Devices</p>
                  <p className="text-3xl font-bold text-slate-100 mt-1">{summary.allocatedAssets}</p>
                </div>
                <Laptop className="text-indigo-500/20" size={36} />
              </div>
            </div>
          )}

          {/* Project & Task stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Project status counts */}
            {projectStats && (
              <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6 space-y-6 shadow-xl">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Layers size={16} className="text-violet-400" />
                  Projects distribution status ({projectStats.total})
                </h3>
                <RenderBarChart data={mappedProjects} total={projectStats.total} />
              </div>
            )}

            {/* Task stats status counts */}
            {taskStats && (
              <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6 space-y-6 shadow-xl">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <CheckSquare size={16} className="text-emerald-400" />
                  Tasks completion ratios ({taskStats.total})
                </h3>
                <RenderDonutChart data={mappedTasks} total={taskStats.total} />
              </div>
            )}
          </div>

          {/* Assets & Ticket stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Asset stats type counts */}
            {assetStats && (
              <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6 space-y-6 shadow-xl">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Laptop size={16} className="text-indigo-400" />
                  Hardware Category Distribution ({assetStats.total})
                </h3>
                <RenderPieChart data={mappedAssets} total={assetStats.total} />
              </div>
            )}

            {/* Ticket category counts */}
            {ticketStats && (
              <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6 space-y-6 shadow-xl">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <BookOpen size={16} className="text-amber-400" />
                  Ticketing Category Inquiries ({ticketStats.total})
                </h3>
                <RenderBarChart data={mappedTickets} total={ticketStats.total} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsConsole;
