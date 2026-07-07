import React from 'react';
import { LeaveRequestRecord } from '../types';
import { formatDate } from '../../../utils/helpers';
import { ClipboardList, Calendar, RefreshCw } from 'lucide-react';

interface RequestsTableProps {
  requests: LeaveRequestRecord[];
  loading: boolean;
}

export const RequestsTable: React.FC<RequestsTableProps> = ({ requests, loading }) => {
  const getDurationDays = (start: string, end: string): number => {
    const s = new Date(start);
    const e = new Date(end);
    return Math.round((e.getTime() - s.getTime()) / (1000 * 3600 * 24)) + 1;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Approved
          </span>
        );
      case 'Rejected':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
            Rejected
          </span>
        );
      case 'Pending':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Pending
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

  const getLeaveTypeBadge = (type: string) => {
    switch (type) {
      case 'Casual':
        return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
      case 'Sick':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'Earned':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      default:
        return 'text-slate-400 bg-slate-500/10 border-slate-500/20';
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center text-slate-400 min-h-[300px]">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-500 mb-2" />
        <span>Loading leave history...</span>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
      <div className="p-5 border-b border-slate-800">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <ClipboardList className="w-5 h-5 text-indigo-400" />
          Leave Applications Log
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-slate-300">
          <thead>
            <tr className="bg-slate-950/60 text-slate-400 text-xs font-semibold tracking-wider border-b border-slate-800">
              <th className="p-4">Leave Type</th>
              <th className="p-4">Duration</th>
              <th className="p-4">Reason</th>
              <th className="p-4">Applied On</th>
              <th className="p-4">Approved By</th>
              <th className="p-4 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-sm">
            {requests.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500 font-medium">
                  No leave requests submitted yet.
                </td>
              </tr>
            ) : (
              requests.map((req) => {
                const days = getDurationDays(req.startDate, req.endDate);
                const approvedBy = req.approvedById
                  ? `Manager (ID: ${req.approvedById.slice(-6)})`
                  : '—';

                return (
                  <tr key={req._id} className="hover:bg-slate-800/25 transition-colors">
                    <td className="p-4 font-semibold text-white">
                      <span className={`px-2 py-1 text-xs rounded border ${getLeaveTypeBadge(req.leaveType)}`}>
                        {req.leaveType}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col">
                        <span className="text-white font-semibold flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                          {days} {days === 1 ? 'day' : 'days'}
                        </span>
                        <span className="text-xs text-slate-500 mt-0.5">
                          {formatDate(req.startDate)} – {formatDate(req.endDate)}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 max-w-[200px] truncate" title={req.reason}>
                      {req.reason}
                    </td>
                    <td className="p-4 text-slate-400 text-xs">{formatDate(req.createdAt)}</td>
                    <td className="p-4 text-slate-400 font-mono text-xs">{approvedBy}</td>
                    <td className="p-4 text-center">{getStatusBadge(req.status)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default RequestsTable;
