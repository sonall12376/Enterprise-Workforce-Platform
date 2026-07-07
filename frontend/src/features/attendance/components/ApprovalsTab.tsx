import React, { useState } from 'react';
import { CorrectionRequest } from '../types';
import { processCorrection } from '../services/attendanceService';
import { formatDate } from '../../../utils/helpers';
import { ThumbsUp, ThumbsDown, AlertCircle } from 'lucide-react';

interface ApprovalsTabProps {
  corrections: CorrectionRequest[];
  onActionComplete: () => void;
  loading: boolean;
}

export const ApprovalsTab: React.FC<ApprovalsTabProps> = ({
  corrections,
  onActionComplete,
  loading,
}) => {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAction = async (id: string, status: 'Approved' | 'Rejected') => {
    setProcessingId(id);
    setError(null);
    try {
      await processCorrection(id, status);
      onActionComplete();
    } catch (err: any) {
      const errMsg = err.response?.data?.message || `Failed to ${status.toLowerCase()} the request.`;
      setError(errMsg);
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Approved':
        return (
          <span className="px-2 py-0.5 text-xs font-semibold rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Approved
          </span>
        );
      case 'Rejected':
        return (
          <span className="px-2 py-0.5 text-xs font-semibold rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
            Rejected
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 text-xs font-semibold rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Pending
          </span>
        );
    }
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-center text-slate-400">
        Loading pending requests...
      </div>
    );
  }

  const pendingRequests = corrections.filter((c) => c.status === 'Pending');
  const pastRequests = corrections.filter((c) => c.status !== 'Pending');

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-start gap-2 text-rose-400 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {/* Pending Requests Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-5 border-b border-slate-800">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            Pending Approvals
            {pendingRequests.length > 0 && (
              <span className="px-2 py-0.5 text-xs bg-indigo-600 text-white rounded-full font-semibold">
                {pendingRequests.length}
              </span>
            )}
          </h3>
        </div>

        <div className="divide-y divide-slate-800">
          {pendingRequests.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm font-medium">
              No pending correction requests to review.
            </div>
          ) : (
            pendingRequests.map((req) => {
              // Extract details (handle populated requestedById if returned)
              const requester = typeof req.requestedById === 'object' && req.requestedById !== null
                ? (req.requestedById as any).email || (req.requestedById as any).employeeId || 'Employee'
                : `Employee (ID: ${req.requestedById})`;

              return (
                <div key={req._id} className="p-5 hover:bg-slate-800/10 transition-colors flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white text-sm">{requester}</span>
                      <span className="text-slate-500 text-xs">•</span>
                      <span className="text-slate-400 text-xs">Requested on {formatDate(req.createdAt)}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-x-6 gap-y-1 bg-slate-950/40 p-3 rounded-lg border border-slate-800 max-w-md text-xs">
                      <span className="text-slate-500">Date:</span>
                      <span className="text-slate-300 font-semibold">{formatDate(req.requestedClockIn)}</span>

                      <span className="text-slate-500">Requested Clock-In:</span>
                      <span className="text-slate-300 font-semibold">{formatTime(req.requestedClockIn)}</span>

                      <span className="text-slate-500">Requested Clock-Out:</span>
                      <span className="text-slate-300 font-semibold">{formatTime(req.requestedClockOut)}</span>
                    </div>

                    <div className="text-slate-400 text-xs">
                      <span className="text-slate-500 font-semibold">Reason:</span> &ldquo;{req.reason}&rdquo;
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end md:self-start">
                    <button
                      onClick={() => handleAction(req._id, 'Approved')}
                      disabled={processingId === req._id}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1 shadow-md shadow-emerald-950/20"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleAction(req._id, 'Rejected')}
                      disabled={processingId === req._id}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 active:scale-[0.98] disabled:opacity-50 text-rose-400 hover:text-rose-300 border border-slate-700 rounded-lg transition-all flex items-center gap-1"
                    >
                      <ThumbsDown className="w-3.5 h-3.5" />
                      Reject
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Past Requests Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-5 border-b border-slate-800">
          <h3 className="text-lg font-bold text-white">Correction Request History</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-slate-300">
            <thead>
              <tr className="bg-slate-950/60 text-slate-400 text-xs font-semibold tracking-wider border-b border-slate-800">
                <th className="p-4">Requester</th>
                <th className="p-4">Log Date</th>
                <th className="p-4">Requested Timings</th>
                <th className="p-4">Reason</th>
                <th className="p-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {pastRequests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-slate-500 font-medium">
                    No past correction requests found.
                  </td>
                </tr>
              ) : (
                pastRequests.map((req) => {
                  const requester = typeof req.requestedById === 'object' && req.requestedById !== null
                    ? (req.requestedById as any).email || (req.requestedById as any).employeeId || 'Employee'
                    : `Employee (ID: ${req.requestedById})`;

                  return (
                    <tr key={req._id} className="hover:bg-slate-800/10">
                      <td className="p-4 font-semibold text-white">{requester}</td>
                      <td className="p-4">{formatDate(req.requestedClockIn)}</td>
                      <td className="p-4 text-slate-400">
                        {formatTime(req.requestedClockIn)} – {formatTime(req.requestedClockOut)}
                      </td>
                      <td className="p-4 truncate max-w-[200px]" title={req.reason}>
                        {req.reason}
                      </td>
                      <td className="p-4 text-center">{getStatusBadge(req.status)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
