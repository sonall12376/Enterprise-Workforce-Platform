import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import reportService from '../services/reportService';
import { ProjectStats, TaskStats, AssetStats, TicketStats, DashboardSummary } from '../types/reportTypes';
import { BarChart3, Users, Clock, AlertCircle, Laptop, BookOpen, Layers, CheckSquare, Loader2, ShieldAlert } from 'lucide-react';

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
              <div className="bg-slate-900/40 border border-slate-800/60 p-5 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Total Staff</p>
                  <p className="text-3xl font-bold text-slate-100 mt-1">{summary.employeeCount}</p>
                </div>
                <Users className="text-violet-500/20" size={36} />
              </div>

              <div className="bg-slate-900/40 border border-slate-800/60 p-5 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Pending Leaves</p>
                  <p className="text-3xl font-bold text-slate-100 mt-1">{summary.pendingLeaves}</p>
                </div>
                <Clock className="text-blue-500/20" size={36} />
              </div>

              <div className="bg-slate-900/40 border border-slate-800/60 p-5 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Open Tickets</p>
                  <p className="text-3xl font-bold text-slate-100 mt-1">{summary.openTickets}</p>
                </div>
                <AlertCircle className="text-amber-500/20" size={36} />
              </div>

              <div className="bg-slate-900/40 border border-slate-800/60 p-5 rounded-2xl flex items-center justify-between">
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
              <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6 space-y-6">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Layers size={16} className="text-violet-400" />
                  Projects distribution status ({projectStats.total})
                </h3>
                <div className="space-y-4">
                  {Object.entries(projectStats.statusCounts).map(([status, count]) => {
                    const pct = projectStats.total > 0 ? (count / projectStats.total) * 100 : 0;
                    return (
                      <div key={status} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold text-slate-300">
                          <span>{status}</span>
                          <span>
                            {count} ({pct.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-violet-500 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Task stats status counts */}
            {taskStats && (
              <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6 space-y-6">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <CheckSquare size={16} className="text-emerald-400" />
                  Tasks completion ratios ({taskStats.total})
                </h3>
                <div className="space-y-4">
                  {Object.entries(taskStats.statusCounts).map(([status, count]) => {
                    const pct = taskStats.total > 0 ? (count / taskStats.total) * 100 : 0;
                    return (
                      <div key={status} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold text-slate-300">
                          <span>{status === 'InProgress' ? 'In Progress' : status}</span>
                          <span>
                            {count} ({pct.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Assets & Ticket stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Asset stats type counts */}
            {assetStats && (
              <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6 space-y-6">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Laptop size={16} className="text-indigo-400" />
                  Hardware Category Distribution ({assetStats.total})
                </h3>
                <div className="space-y-4">
                  {Object.entries(assetStats.typeCounts).map(([type, count]) => {
                    const pct = assetStats.total > 0 ? (count / assetStats.total) * 100 : 0;
                    return (
                      <div key={type} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold text-slate-300">
                          <span>{type}</span>
                          <span>
                            {count} ({pct.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Ticket category counts */}
            {ticketStats && (
              <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6 space-y-6">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <BookOpen size={16} className="text-amber-400" />
                  Ticketing Category Inquiries ({ticketStats.total})
                </h3>
                <div className="space-y-4">
                  {Object.entries(ticketStats.categoryCounts).map(([category, count]) => {
                    const pct = ticketStats.total > 0 ? (count / ticketStats.total) * 100 : 0;
                    return (
                      <div key={category} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold text-slate-300">
                          <span>{category}</span>
                          <span>
                            {count} ({pct.toFixed(0)}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsConsole;
