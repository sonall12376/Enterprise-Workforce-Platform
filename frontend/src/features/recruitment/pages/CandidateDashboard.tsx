import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth';
import { useRecruitment } from '../hooks/useRecruitment';
import { Users, ClipboardList, ShieldCheck, UserCheck, TrendingUp, Calendar, AlertCircle } from 'lucide-react';

export const CandidateDashboard: React.FC = () => {
  const { user } = useAuth();
  const { candidates, interviews, isLoading } = useRecruitment();

  const total = candidates.length;
  const interviewing = candidates.filter((c) =>
    ['Screening', 'Technical Interview', 'HR Interview'].includes(c.status)
  ).length;
  const selected = candidates.filter((c) => c.status === 'Selected').length;
  const joined = candidates.filter((c) => c.status === 'Joined').length;

  // Pipeline funnel steps
  const funnelStages = [
    { name: 'Applied', count: candidates.filter((c) => c.status === 'Applied').length, color: 'bg-indigo-500' },
    { name: 'Screening', count: candidates.filter((c) => c.status === 'Screening').length, color: 'bg-blue-500' },
    { name: 'Technical Round', count: candidates.filter((c) => c.status === 'Technical Interview').length, color: 'bg-violet-500' },
    { name: 'HR Round', count: candidates.filter((c) => c.status === 'HR Interview').length, color: 'bg-fuchsia-500' },
    { name: 'Selected', count: candidates.filter((c) => c.status === 'Selected').length, color: 'bg-teal-500' },
    { name: 'Hired & Joined', count: candidates.filter((c) => c.status === 'Joined').length, color: 'bg-emerald-500' },
  ];

  // Scheduled upcoming interviews
  const upcomingInterviews = interviews
    .filter((i) => i.status === 'Scheduled' && new Date(i.scheduledTime).getTime() > Date.now())
    .sort((a, b) => new Date(a.scheduledTime).getTime() - new Date(b.scheduledTime).getTime())
    .slice(0, 4);

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 font-sans p-6 md:p-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-slate-300 to-indigo-300">
            Recruitment Board
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Track candidates pipelines, scheduled interview panels, and offer lifecycle workflows.
          </p>
        </div>
        {['SuperAdmin', 'OrgAdmin', 'Manager'].includes(user?.role || '') && (
          <div className="flex gap-3">
            <Link
              to="/candidates"
              className="flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-800 font-semibold text-slate-300"
            >
              Candidate Pool
            </Link>
            <Link
              to="/interviews"
              className="flex items-center gap-2 px-5 py-3 rounded-xl border border-slate-800 bg-slate-900/50 hover:bg-slate-800 font-semibold text-slate-300"
            >
              Interviews Calendar
            </Link>
          </div>
        )}
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {/* Total Candidates */}
        <div className="bg-slate-900/40 border border-slate-800/60 p-6 rounded-2xl flex items-center gap-4 shadow-xl">
          <div className="p-3.5 bg-indigo-600/10 text-indigo-400 rounded-xl border border-indigo-500/10">
            <Users size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-100">{total}</p>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total Applicants</p>
          </div>
        </div>

        {/* Interviewing */}
        <div className="bg-slate-900/40 border border-slate-800/60 p-6 rounded-2xl flex items-center gap-4 shadow-xl">
          <div className="p-3.5 bg-blue-600/10 text-blue-400 rounded-xl border border-blue-500/10">
            <ClipboardList size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-100">{interviewing}</p>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Active Interviews</p>
          </div>
        </div>

        {/* Selected */}
        <div className="bg-slate-900/40 border border-slate-800/60 p-6 rounded-2xl flex items-center gap-4 shadow-xl">
          <div className="p-3.5 bg-violet-600/10 text-violet-400 rounded-xl border border-violet-500/10">
            <ShieldCheck size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-100">{selected}</p>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Selected Offers</p>
          </div>
        </div>

        {/* Hired */}
        <div className="bg-slate-900/40 border border-slate-800/60 p-6 rounded-2xl flex items-center gap-4 shadow-xl">
          <div className="p-3.5 bg-emerald-600/10 text-emerald-400 rounded-xl border border-emerald-500/10">
            <UserCheck size={24} />
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-100">{joined}</p>
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Joined workforce</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recruitment Pipeline Funnel */}
        <div className="bg-slate-900/30 border border-slate-800/80 p-6 rounded-2xl backdrop-blur-md">
          <h3 className="text-base font-bold text-slate-200 mb-6 flex items-center gap-2">
            <TrendingUp size={18} className="text-indigo-400" />
            Recruitment Funnel
          </h3>
          <div className="space-y-4">
            {funnelStages.map((stage, idx) => {
              const pct = total > 0 ? (stage.count / total) * 100 : 0;
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-300">{stage.name}</span>
                    <span className="text-slate-400">{stage.count} candidates</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`${stage.color} h-full rounded-full`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scheduled Panels */}
        <div className="bg-slate-900/30 border border-slate-800/80 p-6 rounded-2xl lg:col-span-2 backdrop-blur-md">
          <h3 className="text-base font-bold text-slate-200 mb-6 flex items-center gap-2">
            <Calendar size={18} className="text-indigo-400" />
            Upcoming Interview Panels
          </h3>
          {isLoading ? (
            <div className="text-center text-xs text-slate-500 py-12">Loading upcoming schedules...</div>
          ) : upcomingInterviews.length === 0 ? (
            <div className="text-center text-xs text-slate-500 py-12 flex flex-col items-center gap-2">
              <AlertCircle size={24} className="text-slate-600" />
              No upcoming interviews scheduled.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {upcomingInterviews.map((panel) => (
                <div
                  key={panel._id}
                  className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl hover:border-indigo-500/30 transition-all duration-200"
                >
                  <div className="text-[10px] font-mono font-bold text-indigo-400 uppercase tracking-wider">{panel.roundName}</div>
                  <h4 className="text-xs font-bold text-slate-200 mt-1">{panel.candidateId?.fullName || 'Candidate'}</h4>
                  <div className="text-[10px] text-slate-500 mt-2">
                    {new Date(panel.scheduledTime).toLocaleString()}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Interviewer: <span className="font-semibold">{panel.interviewerId?.name || 'Assigned'}</span>
                  </div>
                  {panel.meetingLink && (
                    <a
                      href={panel.meetingLink}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block mt-3 text-[10px] font-bold text-indigo-400 hover:underline"
                    >
                      Join Meeting Link ↗
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default CandidateDashboard;
