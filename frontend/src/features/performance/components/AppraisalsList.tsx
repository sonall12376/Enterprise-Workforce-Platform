import React, { useState } from 'react';
import { PerformanceReviewRecord } from '../types';
import { acknowledgeReview } from '../services/performanceService';
import { formatDate } from '../../../utils/helpers';
import { Star, CheckCircle, RefreshCw, AlertCircle, FileText } from 'lucide-react';

interface AppraisalsListProps {
  reviews: PerformanceReviewRecord[];
  loading: boolean;
  onActionComplete: () => void;
  userId: string;
}

export const AppraisalsList: React.FC<AppraisalsListProps> = ({
  reviews,
  loading,
  onActionComplete,
  userId,
}) => {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAcknowledge = async (id: string) => {
    setProcessingId(id);
    setError(null);
    try {
      await acknowledgeReview(id);
      onActionComplete();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to acknowledge the appraisal.');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Acknowledged':
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Acknowledged
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
            Submitted (Pending Acknowledgment)
          </span>
        );
    }
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const floor = Math.floor(rating);
    for (let i = 1; i <= 5; i++) {
      if (i <= floor) {
        stars.push(<Star key={i} className="w-4 h-4 fill-amber-450 text-amber-450 shrink-0" />);
      } else if (i === floor + 1 && rating % 1 !== 0) {
        stars.push(
          <div key={i} className="relative shrink-0">
            <Star className="w-4 h-4 text-slate-700" />
            <div className="absolute top-0 left-0 w-1/2 overflow-hidden">
              <Star className="w-4 h-4 fill-amber-450 text-amber-450" />
            </div>
          </div>
        );
      } else {
        stars.push(<Star key={i} className="w-4 h-4 text-slate-700 shrink-0" />);
      }
    }
    return <div className="flex gap-0.5">{stars}</div>;
  };

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center text-slate-400 min-h-[300px]">
        <RefreshCw className="w-8 h-8 animate-spin text-indigo-500 mb-2" />
        <span>Loading appraisal logs...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-start gap-2 text-rose-400 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-550 font-medium">
            No appraisal evaluation reviews registered yet.
          </div>
        ) : (
          reviews.map((rev) => {
            const reviewerName = typeof rev.reviewerId === 'object' && rev.reviewerId !== null
              ? (rev.reviewerId as any).name || 'Manager'
              : 'Manager';

            const reviewerEmail = typeof rev.reviewerId === 'object' && rev.reviewerId !== null
              ? (rev.reviewerId as any).email || '—'
              : '—';

            const employeeName = typeof rev.employeeId === 'object' && rev.employeeId !== null
              ? (rev.employeeId as any).name || 'Employee'
              : 'Employee';

            const targetEmpId = typeof rev.employeeId === 'object' && rev.employeeId !== null
              ? (rev.employeeId as any)._id || (rev.employeeId as any).id
              : rev.employeeId;

            const isOwnReview = String(targetEmpId) === userId;

            return (
              <div
                key={rev._id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden transition-all hover:border-slate-700/80"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-800/80 pb-4 mb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-500">Period: {rev.reviewPeriod}</span>
                      <span className="text-slate-700">•</span>
                      <span className="text-xs font-semibold text-slate-555">Submitted: {formatDate(rev.createdAt)}</span>
                    </div>
                    <h4 className="text-base font-bold text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-400" />
                      Appraisal for: {employeeName}
                    </h4>
                    <p className="text-xs text-slate-500">
                      Evaluated by: <span className="text-slate-300 font-semibold">{reviewerName}</span> ({reviewerEmail})
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white font-mono">{rev.rating.toFixed(1)}</span>
                      {renderStars(rev.rating)}
                    </div>
                    <div className="mt-1">{getStatusBadge(rev.status)}</div>
                  </div>
                </div>

                <div className="text-slate-350 text-sm leading-relaxed whitespace-pre-line bg-slate-950/40 p-4 rounded-xl border border-slate-800/60">
                  <span className="text-xs font-bold text-slate-500 block mb-1 uppercase tracking-wider">
                    Feedback / Review Comments:
                  </span>
                  &ldquo;{rev.feedback}&rdquo;
                </div>

                {rev.status === 'Submitted' && isOwnReview && (
                  <div className="mt-4 flex justify-end pt-2 border-t border-slate-800/40">
                    <button
                      onClick={() => handleAcknowledge(rev._id)}
                      disabled={processingId === rev._id}
                      className="px-4 py-2 bg-emerald-650 hover:bg-emerald-500 active:scale-[0.98] disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-md shadow-emerald-950/20"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      {processingId === rev._id ? 'Acknowledging...' : 'Acknowledge Sign-off'}
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
export default AppraisalsList;
