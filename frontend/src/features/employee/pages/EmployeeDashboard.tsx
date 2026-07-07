import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { useEmployees } from '../hooks/useEmployees';
import { Users, UserCheck, Calendar, Briefcase, Plus, TrendingUp } from 'lucide-react';

export const EmployeeDashboard: React.FC = () => {
  const { user } = useAuth();
  const { employees, metadata } = useEmployees({ page: 1, limit: 1000 });

  const total = employees.length;
  const active = employees.filter((emp) => emp.status === 'Active').length;
  const onboarding = employees.filter((emp) => emp.status === 'Onboarding').length;
  const deptsCount = metadata?.depts?.length || 0;

  // Recent timeline events
  const allEvents = employees
    .flatMap((emp) =>
      emp.timeline.map((evt) => ({
        ...evt,
        empId: emp._id,
        empCode: emp.employeeId,
        empName: emp.name,
      }))
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 font-sans p-6 md:p-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-slate-300 to-indigo-300">
            Employee Operations
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Overview of the organization's active directory, departments, and onboarding logs.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/employees/directory"
            className="flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-800 font-semibold text-slate-300 transition-all"
          >
            Workforce Directory
          </Link>
          {['SuperAdmin', 'OrgAdmin'].includes(user?.role || '') && (
            <Link
              to="/employees/new"
              className="flex items-center gap-2 px-5 py-3 rounded-xl text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 font-semibold shadow-lg shadow-indigo-950/40 transition-all duration-200 hover:-translate-y-0.5"
            >
              <Plus size={18} />
              Onboard Employee
            </Link>
          )}
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {/* Total */}
        <div className="bg-slate-900/40 border border-slate-800/60 p-6 rounded-2xl flex items-center gap-4 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all duration-300" />
          <div className="p-3.5 bg-indigo-600/10 text-indigo-400 rounded-xl border border-indigo-500/10">
            <Users size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-100">{total}</p>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total Workforce</p>
          </div>
        </div>

        {/* Active */}
        <div className="bg-slate-900/40 border border-slate-800/60 p-6 rounded-2xl flex items-center gap-4 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all duration-300" />
          <div className="p-3.5 bg-emerald-600/10 text-emerald-400 rounded-xl border border-emerald-500/10">
            <UserCheck size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-100">{active}</p>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Active Staff</p>
          </div>
        </div>

        {/* Onboarding */}
        <div className="bg-slate-900/40 border border-slate-800/60 p-6 rounded-2xl flex items-center gap-4 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all duration-300" />
          <div className="p-3.5 bg-amber-600/10 text-amber-400 rounded-xl border border-amber-500/10">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-100">{onboarding}</p>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Onboarding</p>
          </div>
        </div>

        {/* Org Units */}
        <div className="bg-slate-900/40 border border-slate-800/60 p-6 rounded-2xl flex items-center gap-4 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 rounded-full blur-2xl group-hover:bg-violet-500/10 transition-all duration-300" />
          <div className="p-3.5 bg-violet-600/10 text-violet-400 rounded-xl border border-violet-500/10">
            <Briefcase size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-100">{deptsCount}</p>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Departments</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Department Distribution */}
        <div className="bg-slate-900/30 border border-slate-800/80 p-6 rounded-2xl flex flex-col backdrop-blur-md">
          <h3 className="text-base font-bold text-slate-200 mb-6 flex items-center gap-2">
            <TrendingUp size={18} className="text-indigo-400" />
            Workforce distribution
          </h3>
          {metadata?.depts?.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-xs text-slate-500 py-10">
              No department configurations defined.
            </div>
          ) : (
            <div className="space-y-4 overflow-y-auto pr-1">
              {metadata?.depts?.map((dept) => {
                const count = employees.filter((e) => e.deptId?._id === dept._id).length;
                const pct = total > 0 ? (count / total) * 100 : 0;
                return (
                  <div key={dept._id} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-300">{dept.name}</span>
                      <span className="text-indigo-400">{count} ({Math.round(pct)}%)</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-violet-500 h-full rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Global Recent Activity Feed */}
        <div className="bg-slate-900/30 border border-slate-800/80 p-6 rounded-2xl lg:col-span-2 backdrop-blur-md">
          <h3 className="text-base font-bold text-slate-200 mb-6">Staff Lifecycle Logs</h3>
          {allEvents.length === 0 ? (
            <div className="text-center text-xs text-slate-500 py-12">
              No recent changes logged.
            </div>
          ) : (
            <div className="relative border-l border-slate-800 pl-4 space-y-6">
              {allEvents.map((evt, idx) => (
                <div key={idx} className="relative group">
                  <span className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full bg-indigo-500 border border-[#0b0f19] group-hover:scale-125 transition-all duration-200" />
                  <div className="text-[10px] text-slate-500 mb-1">
                    {new Date(evt.date).toLocaleString()} • Logged by <span className="text-indigo-400">{evt.performedBy}</span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-300">
                    {evt.action}:{' '}
                    <Link to={`/employees/${evt.empId}`} className="text-indigo-300 hover:underline">
                      {evt.empName} ({evt.empCode})
                    </Link>
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-1">{evt.description}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default EmployeeDashboard;
