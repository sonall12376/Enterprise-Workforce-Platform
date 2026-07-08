import React from 'react';
import { AttendanceRecord } from '../types';
import { formatDate } from '../../../utils/helpers';
import { Calendar, HelpCircle, RefreshCw } from 'lucide-react';

interface LogsTableProps {
  logs: AttendanceRecord[];
  onCorrectionRequest: (record: AttendanceRecord) => void;
  loading: boolean;
}

export const LogsTable: React.FC<LogsTableProps> = ({ logs, onCorrectionRequest, loading }) => {
  const formatDuration = (mins?: number): string => {
    if (mins === undefined || mins === null) return '—';
    const hrs = Math.floor(mins / 60);
    const m = mins % 60;
    return `${hrs}h ${m}m`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Present':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Present
          </span>
        );
      case 'Late':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Late
          </span>
        );
      case 'HalfDay':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
            Half Day
          </span>
        );
      case 'Absent':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
            Absent
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-500/10 text-slate-400 border border-slate-500/20">
            {status}
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center text-slate-400 min-h-[300px]">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-500 mb-2" />
        <span>Loading logs...</span>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-400" />
          Attendance History
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-slate-300">
          <thead>
            <tr className="bg-slate-950/60 text-slate-400 text-xs font-semibold tracking-wider border-b border-slate-800">
              <th className="p-4">Date</th>
              <th className="p-4">Clock-In</th>
              <th className="p-4">Clock-Out</th>
              <th className="p-4">Duration</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-sm">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500 font-medium">
                  No attendance logs recorded for this period.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log._id} className="hover:bg-slate-800/25 transition-colors">
                  <td className="p-4 font-semibold text-white">{formatDate(log.date)}</td>
                  <td className="p-4">
                    {new Date(log.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="p-4">
                    {log.clockOut
                      ? new Date(log.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : '—'}
                  </td>
                  <td className="p-4 font-mono text-slate-400">{formatDuration(log.workMinutes)}</td>
                  <td className="p-4">{getStatusBadge(log.status)}</td>
                  <td className="p-4 text-center">
                    <button
                      onClick={() => onCorrectionRequest(log)}
                      className="px-3 py-1.5 text-xs font-semibold bg-slate-800 text-indigo-400 border border-slate-700 hover:bg-slate-700 hover:text-white rounded-lg transition-all duration-150 flex items-center gap-1 mx-auto"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      Request Correction
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
